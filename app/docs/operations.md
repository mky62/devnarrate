# Operations

## Scripts

From `package.json`:

| Script | Command | Purpose |
| --- | --- | --- |
| `npm run dev` | `next dev` | Start local development server. |
| `npm run build` | `prisma generate && next build --webpack` | Generate Prisma client and build Next.js app with webpack. |
| `npm run start` | `next start` | Start production server after build. |
| `npm run lint` | `eslint` | Run ESLint. |
| `postinstall` | `prisma generate` | Generate Prisma client after install. |

## Required Services

The app expects these backing services for full functionality:

- PostgreSQL.
- Redis.
- GitHub OAuth application.
- Cloudinary account.
- Hugging Face token with inference access.
- Pinecone index.
- OpenRouter API key.
- GitHub webhook secret when webhook freshness tracking is enabled.
- Inngest dev/prod function delivery.

## Environment Variables

Documented in `README.md`:

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `HF_TOKEN`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`
- `OPENROUTER_API_KEY`
- `GITHUB_WEBHOOK_SECRET`

Additional deployment variables used by the code:

- `BETTER_AUTH_ALLOWED_HOSTS`: comma-separated extra Better Auth allowed hosts.
- `BETTER_AUTH_TRUSTED_ORIGINS`: comma-separated extra Better Auth trusted origins.
- `NEXT_PUBLIC_AUTH_URL`: optional auth host source.
- `VERCEL_PROJECT_PRODUCTION_URL`: production deployment URL.
- `VERCEL_URL`: Vercel deployment URL.

## Local Development

Typical setup:

```bash
npm install
npx prisma migrate dev
npm run dev
```

The application opens at `http://localhost:3000` by default.

Because `lib/redis.ts` throws at module load when `REDIS_URL` is missing, routes importing Redis-backed helpers require Redis configuration even in local development.

## Caching

Redis-backed caches:

- Platform stats: 2 hours.
- GitHub repo list: 30 minutes.
- GitHub contribution stats: 30 minutes.

The GitHub repo search route fetches all repos once and then filters locally. This makes search responsive but means newly created GitHub repos may not appear until the cache expires.

Saving a repo verifies the GitHub repo ID against the connected user's GitHub token instead of trusting client-submitted metadata.

## Security And Validation Notes

Implemented protections:

- Better Auth sessions and GitHub OAuth.
- Encrypted OAuth tokens through Better Auth account config.
- Profile, repo, and post validation with Zod.
- Safe auth callback paths.
- Sanitized post rendering with Tiptap JSON allowlists.
- Safe external project URL handling for post pages.
- Contribution URLs restricted to selected HTTPS hosts.
- Image uploads restricted to JPG/JPEG/PNG and 5 MB client-side max.
- Like ownership rules prevent authors liking their own posts.

Important current behaviors:

- `Repo.githubRepoId` is unique per user, so multiple users may save the same GitHub repository.
- Public GitHub stats use the stored user's GitHub access token internally. If token access is unavailable or expired, stats may return null or an error depending on the failure mode.
- Repository deletion removes the saved repo row, previous `RepoIndexJob` rows for that user/repo, the deterministic base Pinecone namespace, and the stored `Repo.indexNamespace`.
- Repository indexing is started only from dashboard `RepoList`. The AI panel reads the shared repo cache and never starts jobs or polls.
- GitHub push webhooks mark tracked repositories `STALE`; generation can continue from the last stored index until the user re-indexes from `RepoList`.
- Account deletion deletes repos, posts, accounts, sessions, and the user, but does not explicitly delete likes/contribution clicks. Schema cascades handle post/user relations where configured.
- `Post.views` and `Post.bannerImage` exist in the schema but are not central to the current visible flows.

## Build And Generated Code

The build script runs `prisma generate` before `next build --webpack`.

Generated Prisma output under `packages/generated/prisma` should be treated as generated code. Update `packages/prisma/schema.prisma` and regenerate instead of editing generated files.

## Styling

The app uses Tailwind CSS v4 with design tokens in `app/globals.css`.

Remote images are configured in `next.config.ts` for:

- `avatars.githubusercontent.com`
- `picsum.photos`

Cloudinary image URLs are returned from uploads, but Cloudinary is not listed in `next.config.ts` `images.remotePatterns`. Inline content rendering currently uses Tiptap/static renderer output rather than Next Image for post images, so this may be acceptable for rendered article content.

## Background Indexing Operations

Indexing depends on all of these being healthy:

- Better Auth access token retrieval.
- GitHub REST API.
- Hugging Face embedding endpoint.
- Pinecone index availability.
- Inngest function execution.

If indexing fails, `RepoIndexJob.status` is set to `FAILED` and `error` stores the message. If an older Pinecone namespace still has vectors, the UI status becomes `failed_with_stale_index`, and generation remains available.

Each indexing job writes to a job-scoped namespace: `user-${userId}-repo-${repoId}-job-${jobId}`. After a successful job, `Repo.indexNamespace` points to that namespace and older namespaces are deleted. If a job fails after partial vector writes, the failed job namespace is deleted before the failure is recorded.

`GET /api/repos/list` checks the stored namespace, job status, and `Repo.indexStatus` to compute the client status. `RepoList` polls this endpoint only while a repo is actively pending or indexing.
