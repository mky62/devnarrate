import { inngest } from "../client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { getRepoDetailsFromGithub, getRepoFilesFromGithub, RepoFile } from "@/lib/github";
import { chunkCodeFile, Chunk } from "@/lib/chunking";
import { embedPassages } from "@/lib/embeddings";
import { deletePineconeNamespace, upsertChunksToPinecone } from "@/lib/services/ai/pinecone";
import { parseGithubRepoId } from "@/lib/github-repo-id";
import { getRepoIndexJobNamespace, getRepoNamespace } from "@/lib/repo-indexing";

interface IndexRepoEventData {
  jobId: string;
  repoId: string;
  userId: string;
}

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    name: "Index Repo",
    retries: 2,

    triggers: [{ event: "repos/index" }],
  },
  async ({ event, step }) => {
    const { jobId, repoId, userId } = event.data as IndexRepoEventData;
    const githubRepoId = parseGithubRepoId(String(repoId));
    const namespace = getRepoIndexJobNamespace({ userId, repoId, jobId });
    const baseNamespace = getRepoNamespace({ userId, repoId });

    try {
      if (!githubRepoId) {
        throw new Error("Invalid GitHub repository ID");
      }

      const { previousNamespace } = await step.run("load-repo-index-state", async () => {
        const repo = await db.repo.findFirst({
          where: {
            githubRepoId,
            userId,
          },
          select: {
            indexNamespace: true,
          },
        });

        if (!repo) {
          throw new Error("Repository is not tracked");
        }

        return { previousNamespace: repo.indexNamespace };
      });

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

        await db.repo.updateMany({
          where: {
            githubRepoId,
            userId,
          },
          data: {
            indexStatus: "INDEXING",
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

      const { fullName, latestCommitSha } = await step.run("fetch-repo-details", async () => {
        const repo = await getRepoDetailsFromGithub({
          repoId,
          accessToken,
        });

        return {
          fullName: repo.fullName,
          latestCommitSha: repo.latestCommitSha,
        };
      });

      const chunkResult = await step.run("fetch-and-chunk-files", async () => {
        const files = await getRepoFilesFromGithub({
          repoName: fullName,
          accessToken,
          maxFiles: 300,
        });

        const chunks = files.flatMap((file: RepoFile) =>
          chunkCodeFile({
            path: file.path,
            content: file.content,
          })
        );

        return { chunks };
      });
      const { chunks } = chunkResult as { chunks: Chunk[] };

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

          await db.repo.updateMany({
            where: {
              githubRepoId,
              userId,
            },
            data: {
              indexStatus: "COMPLETED",
              latestCommitSha,
              indexedCommitSha: latestCommitSha,
              indexNamespace: namespace,
            },
          });
        });

        await step.run("cleanup-previous-index-empty", async () => {
          await cleanupPreviousNamespaces({
            currentNamespace: namespace,
            previousNamespaces: [previousNamespace, baseNamespace],
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
          const embeddings = await embedPassages(batch.map((chunk: Chunk) => chunk.text));

          await upsertChunksToPinecone({
            namespace,
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

        await db.repo.updateMany({
          where: {
            githubRepoId,
            userId,
          },
          data: {
            indexStatus: "COMPLETED",
            latestCommitSha,
            indexedCommitSha: latestCommitSha,
            indexNamespace: namespace,
          },
        });
      });

      await step.run("cleanup-previous-index", async () => {
        await cleanupPreviousNamespaces({
          currentNamespace: namespace,
          previousNamespaces: [previousNamespace, baseNamespace],
        });
      });

      return {
        repoId,
        indexedChunks: chunks.length,
      };
    } catch (error) {
      await step.run("cleanup-failed-index", async () => {
        try {
          await deletePineconeNamespace(namespace);
        } catch (cleanupError) {
          console.warn(
            `Failed to clean up failed Pinecone namespace ${namespace}:`,
            cleanupError
          );
        }
      });

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

        if (githubRepoId) {
          await db.repo.updateMany({
            where: {
              githubRepoId,
              userId,
            },
            data: {
              indexStatus: "FAILED",
            },
          });
        }
      });

      throw error;
    }
  }
);

async function cleanupPreviousNamespaces({
  currentNamespace,
  previousNamespaces,
}: {
  currentNamespace: string;
  previousNamespaces: Array<string | null | undefined>;
}) {
  const namespacesToDelete = new Set(
    previousNamespaces.filter(
      (namespace): namespace is string =>
        Boolean(namespace) && namespace !== currentNamespace
    )
  );

  for (const namespace of namespacesToDelete) {
    try {
      await deletePineconeNamespace(namespace);
    } catch (error) {
      console.warn(`Failed to clean up Pinecone namespace ${namespace}:`, error);
    }
  }
}
