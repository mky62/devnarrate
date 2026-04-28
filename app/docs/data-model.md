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

- `githubRepoId`: unique GitHub repository ID.
- `name`: repository name as returned by search/save flow.
- `description`
- `language`
- `stars`, `forks`
- `userId`
- `accountId`

Indexes:

- `userId`
- `accountId`
- `githubRepoId`

Current behavior:

- `POST /api/repos/add` prevents duplicate `githubRepoId` globally because the schema has a unique constraint on `githubRepoId`.
- Repos are shown on dashboard and public profile pages.
- AI indexing uses `githubRepoId` as the vector namespace suffix.

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

- `repoId`: stored as a string version of GitHub repo ID.
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
- The Inngest function updates status as work progresses.
- `GET /api/repos/list` combines latest job status with Pinecone namespace presence and exposes user-facing statuses.

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

## Generated Client

The Prisma client under `packages/generated/prisma` is generated output. App code should import through `lib/prisma.ts`, not directly edit generated files.
