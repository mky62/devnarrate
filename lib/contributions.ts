const ALLOWED_CONTRIBUTION_HOSTS = new Set([
  "buymeacoffee.com",
  "ko-fi.com",
  "github.com",
  "patreon.com",
]);

const ALLOWED_GITHUB_PATH_PREFIXES = ["/sponsors/"];

function isAllowedContributionUrl(url: URL) {
  if (url.protocol !== "https:") {
    return false;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

  if (!ALLOWED_CONTRIBUTION_HOSTS.has(hostname)) {
    return false;
  }

  if (hostname === "github.com") {
    return ALLOWED_GITHUB_PATH_PREFIXES.some((prefix) =>
      url.pathname.toLowerCase().startsWith(prefix)
    );
  }

  return true;
}

export function getSafeContributionUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return isAllowedContributionUrl(url) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isValidContributionUrl(value?: string | null) {
  return Boolean(getSafeContributionUrl(value));
}

export function getSafeHttpUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function truncateHeaderValue(value?: string | null, maxLength = 1000) {
  if (!value) {
    return null;
  }

  return value.slice(0, maxLength);
}
