export function parseGithubRepoId(value: string | number): bigint | null {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value <= 0) {
      return null;
    }

    return BigInt(value);
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = BigInt(value);
  return parsed <= BigInt(Number.MAX_SAFE_INTEGER) ? parsed : null;
}

export function serializeGithubRepoId(value: bigint): number {
  const serialized = Number(value);

  if (!Number.isSafeInteger(serialized)) {
    throw new Error("GitHub repository ID exceeds JSON safe integer range");
  }

  return serialized;
}
