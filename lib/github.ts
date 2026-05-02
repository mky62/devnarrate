export interface RepoFile {
  path: string;
  content: string;
}

export interface RepoDetails {
  id: number;
  name: string;
  fullName: string;
  ownerLogin: string;
  defaultBranch: string | null;
  latestCommitSha: string | null;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
}

interface GetRepoFilesOptions {
  repoName: string;
  accessToken: string;
  maxFiles?: number;
}

interface GitHubTreeItem {
  path: string;
  type: string;
}

// File extensions we want to index
const ALLOWED_EXTENSIONS = [
  '.js', '.ts', '.tsx', '.jsx',
  '.py', '.rb', '.go', '.rs',
  '.java', '.kt', '.swift',
  '.c', '.cpp', '.h', '.hpp',
  '.md', '.mdx', '.txt',
  '.json', '.yaml', '.yml',
  '.html', '.css', '.scss',
  '.sh', '.bash',
];

// Paths to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /build/,
  /coverage/,
  /\.next/,
  /vendor/,
  /\.cache/,
  /package\.json/, // Skip large generated files
  /package-lock\.json/,
  /yarn\.lock/,
  /\.env/,
];

function shouldIncludeFile(path: string): boolean {
  // Skip if matches any pattern
  if (SKIP_PATTERNS.some(pattern => pattern.test(path))) {
    return false;
  }

  // Check extension
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext =>
    path.toLowerCase().endsWith(ext)
  );

  return hasAllowedExt;
}

export async function getRepoFilesFromGithub({
  repoName,
  accessToken,
  maxFiles = 300,
}: GetRepoFilesOptions): Promise<RepoFile[]> {
  const [owner, repo] = repoName.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid repo name format: ${repoName}. Expected "owner/repo"`);
  }

  // Get default branch first
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!repoRes.ok) {
    throw new Error(`Failed to fetch repo info: ${repoRes.status}`);
  }

  const repoInfo = await repoRes.json();
  const defaultBranch = repoInfo.default_branch;

  // Get the tree recursively
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!treeRes.ok) {
    throw new Error(`Failed to fetch repo tree: ${treeRes.status}`);
  }

  const tree = await treeRes.json();
  const files = (tree.tree as GitHubTreeItem[]).filter((item) =>
    item.type === 'blob' && shouldIncludeFile(item.path)
  );

  // Limit number of files
  const limitedFiles = files.slice(0, maxFiles);

  // Fetch content for each file
  const filesWithContent: RepoFile[] = [];

  for (const file of limitedFiles) {
    try {
      const contentRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${defaultBranch}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (!contentRes.ok) {
        console.warn(`Failed to fetch ${file.path}: ${contentRes.status}`);
        continue;
      }

      const contentData = await contentRes.json();

      // GitHub returns base64 encoded content
      if (contentData.content) {
        const decoded = Buffer.from(contentData.content, 'base64').toString('utf-8');

        // Skip files that are too large (>100KB)
        if (decoded.length > 100000) {
          console.warn(`Skipping large file ${file.path} (${decoded.length} chars)`);
          continue;
        }

        filesWithContent.push({
          path: file.path,
          content: decoded,
        });
      }
    } catch (err) {
      console.warn(`Error fetching ${file.path}:`, err);
    }
  }

  return filesWithContent;
}

export async function getRepoDetailsFromGithub({
  repoId,
  accessToken,
}: {
  repoId: string | number;
  accessToken: string;
}): Promise<RepoDetails> {
  const res = await fetch(`https://api.github.com/repositories/${repoId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "devnarrate-App",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch repo details: ${res.status}`);
  }

  const repoInfo = await res.json();

  if (!repoInfo?.full_name || !repoInfo?.owner?.login) {
    throw new Error("GitHub repo details response missing full_name or owner.login");
  }

  const defaultBranch = typeof repoInfo.default_branch === "string"
    ? repoInfo.default_branch
    : null;
  let latestCommitSha: string | null = null;

  if (defaultBranch) {
    const commitRes = await fetch(
      `https://api.github.com/repos/${repoInfo.full_name}/commits/${encodeURIComponent(defaultBranch)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "devnarrate-App",
        },
      }
    );

    if (commitRes.ok) {
      const commitInfo = await commitRes.json();
      latestCommitSha = typeof commitInfo?.sha === "string" ? commitInfo.sha : null;
    } else if (commitRes.status !== 404 && commitRes.status !== 409) {
      throw new Error(`Failed to fetch repo head commit: ${commitRes.status}`);
    }
  }

  return {
    id: repoInfo.id,
    name: repoInfo.name,
    fullName: repoInfo.full_name,
    ownerLogin: repoInfo.owner.login,
    defaultBranch,
    latestCommitSha,
    description: repoInfo.description ?? null,
    language: repoInfo.language ?? null,
    stars: repoInfo.stargazers_count ?? 0,
    forks: repoInfo.forks_count ?? 0,
  };
}
