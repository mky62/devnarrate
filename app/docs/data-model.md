# Data Model

The database schema lives in `packages/prisma/schema.prisma` and targets PostgreSQL. The Prisma client generator writes TypeScript output to `packages/generated/prisma`.

## Models

### User

Mapped table: `user`

Stores account and public profile data.

Important fields:

- `id`: CUID primary key.
- `name`: GitHub display handle, currently mapped as `@githubLogin`.
- `stageName`: optional unique public profile slug.
- `email`, `emailVerified`, `image`: Better Auth profile fields.
- `description`: public bio.
- `socialLinks`: JSON object for social URLs.
- `contributionUrl`: safe contribution/support URL.
- `createdAt`, `updatedAt`.

Relations:

- `sessions`
- `accounts`
- `repo`
- `post`
- `likes`
- `contributionClicksReceived`
- `contributionClicksMade`

### Session

Mapped table: `session`

Better Auth session storage.

Important fields:

- `token`: unique session token.
- `expiresAt`
- `ipAddress`, `userAgent`
- `userId`, cascading to `User`.

### Account

Mapped table: `account`

OAuth account storage.

Important fields:

- `accountId`: provider account identifier.
- `accountLogin`: GitHub username/login.
- `providerId`: expected to be `github` for current flows.
- `accessToken`, `refreshToken`, `idToken`: encrypted by Better Auth config.
- `scope`
- `userId`

Relations:

- `user`
- `repo`

### Verification

Mapped table: `verification`

Better Auth verification records.

### Repo

Mapped table: `repo`

Saved GitHub repository metadata.

Important fields:

- `githubRepoId`: GitHub repository ID stored as `BigInt`, unique per user.
- `name`: repository name as returned by search/save flow.
- `description`
- `language`
- `stars`, `forks`
- `userId`
- `accountId`
- `latestCommitSha`: latest commit seen from GitHub webhook events.
- `indexedCommitSha`: commit SHA represented by the current usable index.
- `indexNamespace`: Pinecone namespace that generation should query.
- `indexStatus`: `NOT_INDEXED`, `PENDING`, `INDEXING`, `COMPLETED`, `FAILED`, or `STALE`.

Indexes:

- `userId`
- `accountId`
- `githubRepoId`
- `indexStatus`
- Unique `(userId, githubRepoId)`

Current behavior:

- `POST /api/repos/add` prevents saving the same `githubRepoId` more than once for the same user.
- Repos are shown on dashboard and public profile pages.
- `RepoList` is the only client component that starts indexing and polls active index jobs.
- The AI panel only reads the shared repo query cache and only shows repos with usable index status.
- Successful AI indexing writes vectors to a job-scoped namespace and stores that namespace in `Repo.indexNamespace`.
- GitHub push webhooks mark matching repos `STALE` and store `latestCommitSha`.

### Post

Mapped table: `post`

Stores published articles.

Important fields:

- `title`
- `projectLink`: optional external project URL.
- `bannerImage`: present in schema but not actively used by the current post create/read flow.
- `content`: Tiptap JSON serialized as text.
- `views`: nullable integer defaulting to 0.
- `userId`

Relations:

- `user`
- `likes`
- `contributionClicks`

Indexes:

- `userId`

### Like

Mapped table: `like`

Stores post likes.

Important fields:

- `postId`
- `userId`
- `createdAt`

Constraints and indexes:

- Unique `(postId, userId)` prevents duplicate likes.
- Indexed by `userId` and `postId`.

Current behavior:

- Authors cannot like their own posts.
- Anonymous viewers are redirected to sign in when trying to like.
- Duplicate create attempts are treated idempotently by catching Prisma `P2002`.

### RepoIndexJob

Mapped table: `repo_index_job`

Tracks repository indexing jobs.

Important fields:

- `repoId`: stored as a string version of the GitHub repo ID.
- `userId`
- `status`: string status such as `PENDING`, `INDEXING`, `COMPLETED`, or `FAILED`.
- `error`
- `chunksCount`
- `createdAt`, `updatedAt`

Indexes:

- `repoId`
- `userId`

Current behavior:

- `POST /api/repos/index` creates a `PENDING` job and sends an Inngest event.
- The Inngest function updates status as work progresses, writes vectors to `user-${userId}-repo-${repoId}-job-${jobId}`, and stores that namespace on the `Repo` after success.
- Successful re-indexing removes older namespaces after the new namespace is usable.
- Failed indexing removes the failed job namespace and records the error on the job.
- `GET /api/repos/list` combines latest job status, `Repo.indexStatus`, and Pinecone namespace presence to expose user-facing statuses.

### ContributionClick

Mapped table: `contribution_click`

Tracks clicks on contribution/support redirects for posts.

Important fields:

- `postId`
- `authorId`
- `viewerId`: nullable, set null if viewer user is deleted.
- `referrer`
- `userAgent`
- `createdAt`

Indexes:

- `postId`
- `authorId`
- `viewerId`
- `createdAt`

Current behavior:

- `GET /api/contributions/redirect?postId=...` records a click and redirects to a safe contribution URL.
- Logging failures are swallowed so the redirect can still proceed.

## Migrations

Migration files under `packages/prisma/migrations` show the schema evolved through:

- Initial Better Auth and app tables.
- Like system.
- Contribution tracking.
- Repository indexing jobs.
- `chunksCount` on repo index jobs.
- Repository uniqueness scoped to `(userId, githubRepoId)`.
- Repository webhook/index state: `latestCommitSha`, `indexedCommitSha`, and `indexStatus`.
- GitHub repository IDs expanded to `BigInt`.
- `indexNamespace` on `Repo` for job-scoped vector namespaces.

## Generated Client

The Prisma client under `packages/generated/prisma` is generated output. App code should import through `lib/prisma.ts`, not directly edit generated files.
