function namespacePart(value: string | number | bigint): string {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function getRepoNamespace({
  userId,
  repoId,
}: {
  userId: string;
  repoId: string | number | bigint;
}): string {
  return `user-${namespacePart(userId)}-repo-${namespacePart(repoId)}`;
}

export function getRepoIndexJobNamespace({
  userId,
  repoId,
  jobId,
}: {
  userId: string;
  repoId: string | number | bigint;
  jobId: string;
}): string {
  return `${getRepoNamespace({ userId, repoId })}-job-${namespacePart(jobId)}`;
}
