-- Create enums
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'REVIEW_FAILED');
CREATE TYPE "PostVisibility" AS ENUM ('AUTHOR_ONLY', 'PUBLIC', 'HIDDEN_BY_MODERATION');
CREATE TYPE "InboxMessageType" AS ENUM ('MODERATION_WARNING', 'MODERATION_UPDATE');
CREATE TYPE "InboxMessageStatus" AS ENUM ('UNREAD', 'READ', 'RESOLVED');

-- Alter post table
ALTER TABLE "post"
ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "flaggedAt" TIMESTAMP(3),
ADD COLUMN "deletionScheduledFor" TIMESTAMP(3),
ADD COLUMN "reviewAttemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reviewLeaseUntil" TIMESTAMP(3),
ADD COLUMN "latestReviewSummary" TEXT,
ADD COLUMN "latestFlaggedContent" JSONB,
ADD COLUMN "latestWritingFeedback" JSONB;

CREATE INDEX "post_visibility_createdAt_idx" ON "post"("visibility", "createdAt");
CREATE INDEX "post_reviewStatus_reviewLeaseUntil_idx" ON "post"("reviewStatus", "reviewLeaseUntil");
CREATE INDEX "post_deletionScheduledFor_idx" ON "post"("deletionScheduledFor");

-- Create inbox messages
CREATE TABLE "inbox_message" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "type" "InboxMessageType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "InboxMessageStatus" NOT NULL DEFAULT 'UNREAD',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbox_message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inbox_message_userId_status_createdAt_idx" ON "inbox_message"("userId", "status", "createdAt");
CREATE INDEX "inbox_message_postId_idx" ON "inbox_message"("postId");

ALTER TABLE "inbox_message"
ADD CONSTRAINT "inbox_message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "inbox_message"
ADD CONSTRAINT "inbox_message_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
