-- AlterTable
ALTER TABLE "repo"
ADD COLUMN "latestCommitSha" TEXT,
ADD COLUMN "indexedCommitSha" TEXT,
ADD COLUMN "indexStatus" TEXT NOT NULL DEFAULT 'NOT_INDEXED';

-- CreateIndex
CREATE INDEX "repo_indexStatus_idx" ON "repo"("indexStatus");
