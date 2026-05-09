const DEFAULT_AUTH_CALLBACK_URL = "/dashboard";

export function getSafeRelativePath(path?: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  return path;
}

export function getAuthCallbackUrl(path?: string | null) {
  return getSafeRelativePath(path) ?? DEFAULT_AUTH_CALLBACK_URL;
}
