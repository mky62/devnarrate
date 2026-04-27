-- CreateTable
CREATE TABLE "repo_index_job" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repo_index_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repo_index_job_repoId_idx" ON "repo_index_job"("repoId");

-- CreateIndex
CREATE INDEX "repo_index_job_userId_idx" ON "repo_index_job"("userId");
