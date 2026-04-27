import { inngest } from "../client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getRepoFilesFromGithub, RepoFile } from "@/lib/github";
import { chunkCodeFile, Chunk } from "@/lib/chunking";
import { embedTexts } from "@/lib/embeddings";
import { upsertChunksToPinecone } from "@/lib/pinecone";

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    name: "Index Repo",
    retries: 2,
    triggers: [{ event: "repos/index" }],
  },
  async ({ event, step }: { event: any; step: any }) => {
    const { jobId, repoId, userId, repoName, accountId } = event.data;

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
            accountId,
            providerId: "github",
            userId,
          },
        });

        if (!tokenResponse?.accessToken) {
          throw new Error("GitHub token not found");
        }

        return { accessToken: tokenResponse.accessToken };
      });

      const files = await step.run("fetch-repo-files", async () => {
        return getRepoFilesFromGithub({
          repoName,
          accessToken,
          maxFiles: 100,
        });
      });

      const chunks = await step.run("chunk-files", async () => {
        return files.flatMap((file: RepoFile) =>
          chunkCodeFile({
            path: file.path,
            content: file.content,
          })
        );
      });

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

      const embeddings = await step.run("generate-embeddings", async () => {
        return embedTexts(chunks.map((chunk: Chunk) => chunk.text));
      });

      await step.run("store-in-pinecone", async () => {
        await upsertChunksToPinecone({
          namespace: `repo-${repoId}`,
          chunks: chunks.map((chunk: Chunk, index: number) => ({
            id: chunk.id,
            text: chunk.text,
            path: chunk.path,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            embedding: embeddings[index],
          })),
        });
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
