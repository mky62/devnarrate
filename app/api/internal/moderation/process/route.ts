import {
  buildApprovedInboxUpdate,
  buildFlaggedInboxMessage,
  getApprovedModerationData,
  getFlaggedModerationData,
  getReviewFailedData,
  reviewPostContent,
} from "@/lib/moderation";
import {
  getLeaseDeadline,
  INBOX_MESSAGE_STATUS,
  INBOX_MESSAGE_TYPE,
  MODERATION_BATCH_SIZE,
  POST_VISIBILITY,
  REVIEW_STATUS,
  shouldRetryReview,
} from "@/lib/post-moderation";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isWorkerAuthorized(request: Request) {
  const headerSecret = request.headers.get("x-moderation-worker-secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  const expectedSecret = process.env.MODERATION_WORKER_SECRET;

  if (!expectedSecret) {
    throw new Error("MODERATION_WORKER_SECRET is not configured");
  }

  return headerSecret === expectedSecret || bearerSecret === expectedSecret;
}

async function processExpiredFlaggedPosts(now: Date) {
  const expiredPosts = await db.post.findMany({
    where: {
      reviewStatus: REVIEW_STATUS.FLAGGED,
      deletionScheduledFor: {
        lte: now,
      },
    },
    orderBy: {
      deletionScheduledFor: "asc",
    },
    take: MODERATION_BATCH_SIZE,
    select: {
      id: true,
      userId: true,
      title: true,
    },
  });

  let deletedCount = 0;

  for (const post of expiredPosts) {
    await db.$transaction(async (tx) => {
      await tx.inboxMessage.updateMany({
        where: {
          postId: post.id,
          userId: post.userId,
          status: {
            not: INBOX_MESSAGE_STATUS.RESOLVED,
          },
        },
        data: {
          status: INBOX_MESSAGE_STATUS.RESOLVED,
          title: `Post deleted: ${post.title}`,
          body: "This post was automatically deleted after the 24-hour moderation window expired.",
        },
      });

      await tx.post.delete({
        where: { id: post.id },
      });
    });

    deletedCount += 1;
  }

  return deletedCount;
}

async function processPendingReviews(now: Date) {
  const candidates = await db.post.findMany({
    where: {
      reviewStatus: {
        in: [REVIEW_STATUS.PENDING, REVIEW_STATUS.REVIEW_FAILED],
      },
      visibility: POST_VISIBILITY.AUTHOR_ONLY,
      OR: [
        { reviewLeaseUntil: null },
        { reviewLeaseUntil: { lt: now } },
      ],
    },
    orderBy: [
      { createdAt: "asc" },
      { updatedAt: "asc" },
    ],
    take: MODERATION_BATCH_SIZE * 3,
    select: {
      id: true,
      userId: true,
      title: true,
      content: true,
      reviewStatus: true,
      reviewAttemptCount: true,
      updatedAt: true,
    },
  });

  let processedCount = 0;

  for (const candidate of candidates) {
    if (
      candidate.reviewStatus === REVIEW_STATUS.REVIEW_FAILED &&
      !shouldRetryReview(candidate.updatedAt, candidate.reviewAttemptCount + 1, now)
    ) {
      continue;
    }

    const claimCount = await db.post.updateMany({
      where: {
        id: candidate.id,
        reviewStatus: {
          in: [REVIEW_STATUS.PENDING, REVIEW_STATUS.REVIEW_FAILED],
        },
        OR: [
          { reviewLeaseUntil: null },
          { reviewLeaseUntil: { lt: now } },
        ],
      },
      data: {
        reviewLeaseUntil: getLeaseDeadline(now),
        reviewAttemptCount: {
          increment: 1,
        },
      },
    });

    if (claimCount.count === 0) {
      continue;
    }

    try {
      const result = await reviewPostContent({
        postId: candidate.id,
        title: candidate.title,
        content: candidate.content,
      });

      if (result.decision === "flag") {
        const flaggedData = getFlaggedModerationData(result);

        await db.$transaction(async (tx) => {
          await tx.post.update({
            where: { id: candidate.id },
            data: flaggedData,
          });

          const existingWarning = await tx.inboxMessage.findFirst({
            where: {
              postId: candidate.id,
              userId: candidate.userId,
              type: INBOX_MESSAGE_TYPE.MODERATION_WARNING,
              status: {
                not: INBOX_MESSAGE_STATUS.RESOLVED,
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          });

          const warningPayload = buildFlaggedInboxMessage({
            postId: candidate.id,
            title: candidate.title,
            reviewSummary: result.reviewSummary,
            flaggedSnippets: result.flaggedSnippets,
            unsafeReasons: result.unsafeReasons,
            deletionScheduledFor: flaggedData.deletionScheduledFor,
          });

          if (existingWarning) {
            await tx.inboxMessage.update({
              where: { id: existingWarning.id },
              data: warningPayload,
            });
          } else {
            await tx.inboxMessage.create({
              data: {
                userId: candidate.userId,
                postId: candidate.id,
                ...warningPayload,
              },
            });
          }
        });
      } else {
        const approvedData = getApprovedModerationData(result);

        await db.$transaction(async (tx) => {
          const unresolvedWarnings = await tx.inboxMessage.findMany({
            where: {
              postId: candidate.id,
              userId: candidate.userId,
              type: INBOX_MESSAGE_TYPE.MODERATION_WARNING,
              status: {
                not: INBOX_MESSAGE_STATUS.RESOLVED,
              },
            },
            select: {
              id: true,
            },
          });

          await tx.post.update({
            where: { id: candidate.id },
            data: approvedData,
          });

          if (unresolvedWarnings.length > 0) {
            await tx.inboxMessage.updateMany({
              where: {
                id: {
                  in: unresolvedWarnings.map((warning) => warning.id),
                },
              },
              data: {
                status: INBOX_MESSAGE_STATUS.RESOLVED,
              },
            });

            await tx.inboxMessage.create({
              data: {
                userId: candidate.userId,
                postId: candidate.id,
                ...buildApprovedInboxUpdate({
                  postId: candidate.id,
                  title: candidate.title,
                }),
              },
            });
          }
        });
      }
    } catch (error) {
      await db.post.update({
        where: { id: candidate.id },
        data: getReviewFailedData(error),
      });
    }

    processedCount += 1;

    if (processedCount >= MODERATION_BATCH_SIZE) {
      break;
    }
  }

  return processedCount;
}

export async function POST(request: Request) {
  try {
    if (!isWorkerAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const [deletedCount, reviewedCount] = await Promise.all([
      processExpiredFlaggedPosts(now),
      processPendingReviews(now),
    ]);

    return NextResponse.json({
      success: true,
      deletedCount,
      reviewedCount,
    });
  } catch (error) {
    console.error("Moderation worker failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Moderation worker failed",
      },
      { status: 500 }
    );
  }
}
