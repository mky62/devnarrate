import { inngest } from "../client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getRepoDetailsFromGithub, getRepoFilesFromGithub, RepoFile } from "@/lib/github";
import { chunkCodeFile, Chunk } from "@/lib/chunking";
import { embedTexts } from "@/lib/embeddings";
import { upsertChunksToPinecone } from "@/lib/pinecone";

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    name: "Index Repo",
    retries: 2,
    timeouts: {
      finish: "5m",
    },
    triggers: [{ event: "repos/index" }],
  },
  async ({ event, step }) => {
    const { jobId, repoId, userId } = event.data;

    try {
      await step.run("mark-job-indexing", async () => {
        await db.repoIndexJob.update({
          where: {
            id: jobId,
            userId,
            repoId,
          },
          data: {
            status: "INDEXING",
            error: null,
          },
        });
      });

      const { accessToken } = await step.run("fetch-github-token", async () => {
        const tokenResponse = await auth.api.getAccessToken({
          body: {
            providerId: "github",
            userId,
          },
        });

        if (!tokenResponse?.accessToken) {
          throw new Error("GitHub token not found");
        }

        return { accessToken: tokenResponse.accessToken };
      });

      const { fullName } = await step.run("fetch-repo-details", async () => {
        const repo = await getRepoDetailsFromGithub({
          repoId,
          accessToken,
        });

        return { fullName: repo.fullName };
      });

      const files = await getRepoFilesFromGithub({
        repoName: fullName,
        accessToken,
        maxFiles: 100,
      });

      const chunks = files.flatMap((file: RepoFile) =>
        chunkCodeFile({
          path: file.path,
          content: file.content,
        })
      );

      if (chunks.length === 0) {
        await step.run("mark-job-completed-empty", async () => {
          await db.repoIndexJob.update({
            where: {
              id: jobId,
              userId,
              repoId,
            },
            data: {
              status: "COMPLETED",
              error: null,
              chunksCount: 0,
            },
          });
        });

        return {
          repoId,
          indexedChunks: 0,
        };
      }

      await step.run("embed-and-store-chunks", async () => {
        const batchSize = 16;

        for (let i = 0; i < chunks.length; i += batchSize) {
          const batch = chunks.slice(i, i + batchSize);
          const embeddings = await embedTexts(batch.map((chunk: Chunk) => chunk.text));

          await upsertChunksToPinecone({
            namespace: `repo-${repoId}`,
            chunks: batch.map((chunk: Chunk, index: number) => ({
              id: chunk.id,
              text: chunk.text,
              path: chunk.path,
              startLine: chunk.startLine,
              endLine: chunk.endLine,
              embedding: embeddings[index],
            })),
          });
        }

        return {
          indexedChunks: chunks.length,
        };
      });

      await step.run("mark-job-completed", async () => {
        await db.repoIndexJob.update({
          where: {
            id: jobId,
            userId,
            repoId,
          },
          data: {
            status: "COMPLETED",
            error: null,
            chunksCount: chunks.length,
          },
        });
      });

      return {
        repoId,
        indexedChunks: chunks.length,
      };
    } catch (error) {
      await step.run("mark-job-failed", async () => {
        await db.repoIndexJob.update({
          where: {
            id: jobId,
            userId,
            repoId,
          },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      });

      throw error;
    }
  }
);
