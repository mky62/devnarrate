export const REVIEW_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  FLAGGED: "FLAGGED",
  REVIEW_FAILED: "REVIEW_FAILED",
} as const;

export const POST_VISIBILITY = {
  AUTHOR_ONLY: "AUTHOR_ONLY",
  PUBLIC: "PUBLIC",
  HIDDEN_BY_MODERATION: "HIDDEN_BY_MODERATION",
} as const;

export const INBOX_MESSAGE_TYPE = {
  MODERATION_WARNING: "MODERATION_WARNING",
  MODERATION_UPDATE: "MODERATION_UPDATE",
} as const;

export const INBOX_MESSAGE_STATUS = {
  UNREAD: "UNREAD",
  READ: "READ",
  RESOLVED: "RESOLVED",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
export type PostVisibility = (typeof POST_VISIBILITY)[keyof typeof POST_VISIBILITY];
export type InboxMessageType = (typeof INBOX_MESSAGE_TYPE)[keyof typeof INBOX_MESSAGE_TYPE];
export type InboxMessageStatus = (typeof INBOX_MESSAGE_STATUS)[keyof typeof INBOX_MESSAGE_STATUS];

export const MODERATION_JOB_LEASE_MS = 5 * 60 * 1000;
export const MODERATION_DELETE_AFTER_HOURS = 24;
export const MODERATION_BATCH_SIZE = 10;

export function getDeletionDeadline(from = new Date()) {
  return new Date(from.getTime() + MODERATION_DELETE_AFTER_HOURS * 60 * 60 * 1000);
}

export function getLeaseDeadline(from = new Date()) {
  return new Date(from.getTime() + MODERATION_JOB_LEASE_MS);
}

export function isPubliclyVisible(visibility: string) {
  return visibility === POST_VISIBILITY.PUBLIC;
}

export function formatDeletionDeadline(date: Date | string | null | undefined) {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getRetryDelayMs(attemptCount: number) {
  if (attemptCount <= 1) {
    return 0;
  }

  return Math.min(30 * 60 * 1000, 2 ** (attemptCount - 2) * 60 * 1000);
}

export function shouldRetryReview(updatedAt: Date, attemptCount: number, now = new Date()) {
  return updatedAt.getTime() + getRetryDelayMs(attemptCount) <= now.getTime();
}
