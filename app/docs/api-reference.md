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

### `GET /api/github/search?q=...`

Requires authentication.

Uses the user's GitHub OAuth token to fetch all repositories from `https://api.github.com/user/repos`, caches them in Redis for 30 minutes, then filters locally by repository name.

Returns repository search results with:

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

- `githubRepoId`
- `name`
- `language`
- `stargazers_count`
- `forks_count`

Behavior:

- Finds the current user's GitHub `Account`.
- Rejects duplicate global `githubRepoId`.
- Creates a `Repo` tied to the user and account.

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

### `GET /api/repos/public/[stageName]`

Public paginated saved repositories for a profile.

Returns public repo shape using `stargazers_count` and `forks_count` aliases.

### `GET /api/repos/list`

Requires authentication.

Used by the AI panel. Returns all saved repos plus indexing status.

Status values exposed to the client:

- `not_indexed`
- `pending`
- `indexing`
- `completed`
- `failed`
- `failed_with_stale_index`

The route checks both the latest `RepoIndexJob` and Pinecone namespace existence. If vectors exist, the repo is considered usable even when the latest job failed.

### `POST /api/repos/index`

Requires authentication.

Accepted body:

- `repoId`: GitHub repo ID as string or number.
- `repoName`: non-empty string.
- `accountId`: account ID as string or number.

Behavior:

- Creates a `RepoIndexJob` with `PENDING` status.
- Sends Inngest event `repos/index`.

Returns `{ success: true, jobId }`.

## AI

### `POST /api/ai/generate`

Requires authentication.

Accepted body:

- `repoId`: GitHub repo ID.
- `prompt`: non-empty string up to 4000 characters.

Behavior:

1. Checks Pinecone namespace `repo-${repoId}` exists.
2. Embeds the prompt with Hugging Face.
3. Queries Pinecone for top 5 relevant chunks.
4. Builds a source-context prompt.
5. Streams text from OpenRouter.

Responses:

- `400` invalid JSON, missing repo ID, or invalid prompt.
- `401` unauthenticated.
- `413` prompt too long.
- `425` repo not indexed yet.
- `404` no relevant chunks.
- `500` missing OpenRouter key or generation failure.

Successful response is `text/plain; charset=utf-8` streamed content.

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
