export type RepoStatus =
  | "not_indexed"
  | "pending"
  | "indexing"
  | "completed"
  | "failed"
  | "failed_with_stale_index"
  | "stale";

export function getRepoStatus({
  indexStatus,
  indexNamespace,
}: {
  indexStatus?: string | null;
  indexNamespace?: string | null;
}): RepoStatus {
  switch (indexStatus) {
    case "PENDING":
      return "pending";
    case "INDEXING":
      return "indexing";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return indexNamespace ? "failed_with_stale_index" : "failed";
    case "STALE":
      return "stale";
    case "NOT_INDEXED":
    default:
      return "not_indexed";
  }
}
