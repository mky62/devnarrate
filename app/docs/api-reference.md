# API Reference

All API routes are implemented with Next.js App Router route handlers under `app/api`.

## Authentication

### `app/api/auth/[...all]/route.ts`

Delegates `GET` and `POST` to Better Auth's Next.js handler.

Used by:

- GitHub OAuth sign-in.
- Session management.
- Better Auth client helpers.

## Current User And Profiles

### `GET /api/user/me`

Requires authentication.

Returns the current user with:

- `id`
- `name`
- `email`
- `emailVerified`
- `image`
- `createdAt`
- `stageName`
- `description`
- `socialLinks`
- `contributionUrl`

Responses:

- `401` if unauthenticated.
- `404` if the session user no longer exists.
- `500` on server failure.

### `PATCH /api/user/profile`

Requires authentication.

Validates with `profileUpdateSchema`.

Accepted body:

- `stageName`: optional or nullable, max 30, letters/numbers/underscore/hyphen.
- `description`: optional or nullable, max 500.
- `socialLinks`: optional or nullable URL map.
- `contributionUrl`: optional or nullable safe contribution URL.

Behavior:

- Checks `stageName` uniqueness against other users.
- Normalizes empty strings to null.
- Sanitizes `contributionUrl` through `getSafeContributionUrl`.

Responses:

- `401` unauthenticated.
- `400` validation failure.
- `409` stage name already taken.
- `200` with `{ success: true, user }`.

### `GET /api/user/[stageName]`

Public.

Returns public profile fields for a user by `stageName`.

Responses:

- `400` missing stage name.
- `404` user not found.
- `500` on server failure.

### `DELETE /api/user/delete`

Requires authentication.

Deletes the user's repos, posts, accounts, sessions, and finally the user row. The schema has cascades for many relationships, but this route explicitly deletes the primary user-owned records first.

Responses:

- `401` unauthenticated.
- `200` `{ success: true }`.
- `500` failure.

### `GET /api/users/search?q=...`

Public user search.

Query parameters:

- `q`: required, minimum 2 characters.
- `page`: optional, default 1.
- `limit`: optional, default 10, max 50.

Searches `stageName`, `name`, and `email` with case-insensitive contains matching.

Returns:

- `users`: `stageName`, `name`, `avatarUrl`, `description`, repo count.
- `pagination`.

## Posts

### `GET /api/posts`

Requires authentication.

Query parameters:

- `page`: optional, default 1.
- `limit`: optional, default 20, max 100.

Returns the current user's posts in newest-first order. Posts are serialized through `serializePostSummaries` with `readOnly: true`, so dashboard posts cannot be liked by the owner from this endpoint.

### `POST /api/saveposts`

Requires authentication.

Validates with `postSchema`.

Accepted body:

- `title`: required, max 200.
- `link`: optional URL or empty string.
- `content`: Tiptap document JSON with root `{ type: "doc" }`.

Behavior:

- Stores `content` as a JSON string in `Post.content`.
- Stores empty `link` as null.

Returns `{ success: true, postId }`.

### `GET /api/posts/[id]`

Public, but uses session when available to compute `likedByViewer` and `canLike`.

Returns post detail with author fields.

Responses:

- `404` post not found.
- `500` server error.

### `DELETE /api/posts/[id]`

Requires authentication.

Behavior:

- Verifies post exists.
- Ensures the session user owns the post.
- Deletes the post.

Responses:

- `401` unauthenticated.
- `403` non-owner.
- `404` missing post.
- `200` `{ success: true }`.

### `POST /api/posts/[id]/like`

Requires authentication.

Behavior:

- Rejects liking your own post.
- Creates a `Like`.
- Treats duplicate-like unique violations as idempotent.
- Returns updated `liked: true` and `likeCount`.

Responses:

- `401` unauthenticated.
- `403` author liking own post.
- `404` post not found.
- `500` server error.

### `DELETE /api/posts/[id]/like`

Requires authentication.

Behavior:

- Rejects unliking your own post.
- Deletes any matching like rows.
- Returns updated `liked: false` and `likeCount`.

### `GET /api/posts/public/[stageName]`

Public.

Query parameters:

- `page`: optional, default 1.
- `limit`: optional, default 20, max 100.

Looks up the user by `stageName`, returns that user's posts with viewer like state when a session exists.

## Repositories

### `GET /api/github/repos`

Requires authentication.

Returns the user's GitHub repositories. The server reads from Redis when available; on a cache miss it uses the user's GitHub OAuth token to fetch all repositories from `https://api.github.com/user/repos` and caches them in Redis for 30 minutes.

Returns repositories with:

- `githubRepoId`
- `name`
- `description`
- `language`
- `stargazers_count`
- `forks_count`

Responses:

- `400` missing query or missing GitHub access token.
- `401` session missing or GitHub auth expired.
- `502` GitHub API failure.
- `500` internal failure.

### `GET /api/repos`

Requires authentication.

Paginated current-user saved repositories.

Returns:

- `repos`
- `pagination`

### `POST /api/repos/add`

Requires authentication.

Validates with `repoSchema`.

Accepted body:

- `githubRepoId`: JSON-safe positive GitHub repository ID. The API stores it as a Prisma `BigInt` and serializes it back to a number in responses.
- `name`
- `language`
- `stargazers_count`
- `forks_count`

Behavior:

- Finds the current user's GitHub `Account`.
- Verifies the repo ID is accessible with the current user's GitHub token.
- Rejects GitHub detail mismatches instead of trusting client-submitted metadata.
- Rejects duplicate `githubRepoId` for the same user.
- Creates a `Repo` tied to the user and account using canonical GitHub metadata.
- Returns an explicitly JSON-safe repo payload.

Responses:

- `400` validation failure or missing GitHub account.
- `401` unauthenticated.
- `409` repository already saved.
- `201` with `{ repo }`.

### `DELETE /api/repos/delete`

Requires authentication.

Accepted body:

- `githubRepoId`

Deletes the matching repo only if it belongs to the current user.

Behavior:

- Parses `githubRepoId` as a safe positive repository ID.
- Deletes both the deterministic base namespace and the stored `Repo.indexNamespace` when present.
- Deletes previous `RepoIndexJob` rows for that user/repo.
- Deletes the saved repo row.

### `GET /api/repos/public/[stageName]`

Public paginated saved repositories for a profile.

Returns public repo shape using `stargazers_count` and `forks_count` aliases.

### `GET /api/repos/list`

Requires authentication.

Used by the dashboard repo list and shared repo cache. Returns all saved repos plus indexing status.

Status values exposed to the client:

- `not_indexed`
- `pending`
- `indexing`
- `completed`
- `failed`
- `failed_with_stale_index`
- `stale`

The route checks the latest `RepoIndexJob`, `Repo.indexStatus`, and Pinecone namespace existence. It uses the stored `Repo.indexNamespace` when present, with the deterministic `user-${userId}-repo-${repoId}` base namespace as a fallback. If vectors exist, the repo is considered usable even when the latest job failed. If the webhook marks `Repo.indexStatus` as `STALE`, the client receives `stale` and can still generate from the stored index while showing that the repo should be refreshed.

### `POST /api/repos/index`

Requires authentication.

Accepted body:

- `repoId`: GitHub repo ID as string or number.
- `repoName`: non-empty string.
- `accountId`: account ID as string or number.

Behavior:

- Parses the GitHub repo ID as a safe positive ID.
- Verifies the repo belongs to the current user and account.
- Creates a `RepoIndexJob` with `PENDING` status.
- Sets `Repo.indexStatus` to `PENDING`.
- Sends Inngest event `repos/index`.

Returns `{ success: true, jobId }`.

## AI

### `POST /api/ai/generate`

Requires authentication.

Accepted body:

- `repoId`: GitHub repo ID.
- `prompt`: non-empty string up to 4000 characters.
- `contentType`: optional `tutorial`, `overview`, `changelog-style`, or `implementation deep dive`. Defaults to `tutorial`.
- `audience`: optional `beginner`, `intermediate`, or `advanced`. Defaults to `intermediate`.
- `tone`: optional `concise`, `explanatory`, or `polished`. Defaults to `explanatory`.

Behavior:

1. Verifies the repo belongs to the current user.
2. Checks the stored `Repo.indexNamespace` exists in Pinecone, falling back to the deterministic base namespace when no stored namespace exists.
3. Embeds the prompt with Hugging Face using the E5 `query:` prefix, with a raw embedding fallback for older indexes.
4. Queries Pinecone for top 10 relevant chunks and drops weak matches.
5. Builds a grouped source-context prompt with file paths, line ranges, and relevance scores.
6. Streams text from OpenRouter.

Responses:

- `400` invalid JSON, missing repo ID, or invalid prompt.
- `401` unauthenticated.
- `413` prompt too long.
- `425` repo not indexed yet.
- `404` no relevant chunks.
- `402` OpenRouter quota or credits are insufficient.
- `429` OpenRouter rate limit exceeded.
- `502` OpenRouter rejected the request or authentication failed.
- `503` missing OpenRouter key or provider unavailable.
- `504` retrieval or generation timed out.

Successful response is `text/plain; charset=utf-8` streamed content.

## GitHub Webhooks

### `POST /api/github/webhook`

Public endpoint intended for GitHub webhook delivery.

Security:

- Requires `GITHUB_WEBHOOK_SECRET`.
- Verifies `x-hub-signature-256` with HMAC SHA-256.

Behavior:

- Responds to `ping` with `{ success: true }`.
- Ignores unsupported event types with `202`.
- Handles `push` events for `refs/heads/main`.
- Parses the repository ID and commit SHA from the payload.
- Updates all tracked matching repos with `latestCommitSha` and `indexStatus: "STALE"`.

Responses:

- `401` invalid or missing signature.
- `400` invalid JSON or missing repository/commit fields.
- `202` ignored event, branch, or untracked repository.
- `200` successful update.

## GitHub Stats

### `GET /api/github/stats`

Requires authentication.

Uses the current session user's GitHub username and token to fetch contribution calendar stats through GitHub GraphQL. Results are cached for 30 minutes.

Returns `{ stats }`, where `stats` may be null if no valid token is available.

### `GET /api/github/stats/public/[stageName]`

Public profile stats.

Looks up a user by stage name, retrieves GitHub contribution stats with the saved account token, and caches by public stage name.

## Platform Stats

### `GET /api/stats`

Public.

Returns total counts:

- `developers`
- `articles`
- `repos`

Caches in Redis for 2 hours under `platform:stats`.

On failure it returns status `500` and zero counts.

## Uploads

### `POST /api/upload`

Requires authentication.

Accepts multipart form data with `file`.

Allowed MIME types:

- `image/jpeg`
- `image/jpg`
- `image/png`

Behavior:

- Requires Cloudinary env config.
- Signs upload params with SHA-1.
- Uploads directly to Cloudinary.
- Returns `{ url: result.secure_url }`.

## Contributions

### `GET /api/contributions/redirect?postId=...`

Public.

Behavior:

- Finds the post and author contribution URL.
- Requires the post to have a safe project link and the author to have a safe contribution URL.
- Logs `ContributionClick` with optional session viewer, referrer, and user agent.
- Redirects to the safe contribution URL.

Allowed contribution URL hosts:

- `buymeacoffee.com`
- `ko-fi.com`
- `patreon.com`
- `github.com/sponsors/...`

## Inngest

### `GET|POST|PUT /api/inngest`

Exposes the Inngest serve handler with the `indexRepo` function registered.
