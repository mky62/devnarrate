-- AlterTable
ALTER TABLE "user" ADD COLUMN "contributionUrl" TEXT;

-- CreateTable
CREATE TABLE "contribution_click" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "viewerId" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contribution_click_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contribution_click_postId_idx" ON "contribution_click"("postId");

-- CreateIndex
CREATE INDEX "contribution_click_authorId_idx" ON "contribution_click"("authorId");

-- CreateIndex
CREATE INDEX "contribution_click_viewerId_idx" ON "contribution_click"("viewerId");

-- CreateIndex
CREATE INDEX "contribution_click_createdAt_idx" ON "contribution_click"("createdAt");

-- AddForeignKey
ALTER TABLE "contribution_click" ADD CONSTRAINT "contribution_click_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_click" ADD CONSTRAINT "contribution_click_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_click" ADD CONSTRAINT "contribution_click_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
