# Architecture

## Runtime Overview

DevNarrate is a TypeScript Next.js 16 App Router application using React 19. It combines server-rendered pages, client components, API route handlers, Prisma/PostgreSQL persistence, Redis caching, GitHub OAuth, and background repository indexing.

The application has three major surfaces:

- Public marketing and discovery: `/`, `/home`, `/explore`, and user search.
- Authenticated dashboard and editor: `/dashboard`, `/p/create`.
- Public portfolio and post reading: `/:stageName`, `/p/:id`.

## Main Layers

### Next.js App Router

`app/layout.tsx` defines global fonts, metadata, global CSS, and wraps the tree in `Providers`.

`app/providers.tsx` creates a TanStack Query client with:

- `staleTime`: 10 minutes and 30 seconds.
- `retry`: 1.
- `refetchOnWindowFocus`: false.

Route groups:

- `app/(auth)`: sign-in flow.
- `app/(main)/dashboard`: authenticated dashboard.
- `app/[stageName]`: public user profile/dashboard.
- `app/p/create`: post creation editor.
- `app/p/[id]`: post detail page.
- `app/api`: JSON and streaming APIs.

### Authentication

Authentication uses Better Auth in `lib/auth.ts` with the Prisma adapter and GitHub as the social provider.

Important behavior:

- OAuth tokens are encrypted by Better Auth.
- GitHub profile mapping stores `User.name` as `@${profile.login}`.
- Sessions last 7 days and update every 1 day.
- Better Auth trusted origins and allowed hosts are derived from `BETTER_AUTH_URL`, Vercel URLs, `NEXT_PUBLIC_AUTH_URL`, and explicit host/origin env lists.
- `lib/auth-client.ts` exposes client helpers: `authClient`, `signIn`, `signOut`, and `useSession`.

### Persistence

Prisma is configured in `packages/prisma/schema.prisma`. The generated client is emitted into `packages/generated/prisma`. The app imports the singleton Prisma client through `lib/prisma.ts`.

PostgreSQL stores:

- Users, sessions, OAuth accounts, and verification records.
- Saved GitHub repositories.
- Tiptap JSON posts.
- Likes.
- Repository indexing job records.
- Contribution click analytics.

### Caching

Redis is used through `lib/redis.ts`. The client is cached globally as `global.redisPromise`.

Current cache keys:

- `platform:stats`: platform counts, 2 hour TTL.
- `github:repos:${userId}`: authenticated GitHub repository list, 30 minute TTL.
- `github:stats:${userId}`: authenticated GitHub contribution stats, 30 minute TTL.
- `github:stats:public:${stageName}`: public GitHub contribution stats, 30 minute TTL.

### Background Jobs

Inngest is configured in `inngest/client.ts` and exposed through `app/api/inngest/route.ts`.

The repository indexing function in `inngest/functions/indexRepo.ts` handles:

1. Marking a `RepoIndexJob` as `INDEXING`.
2. Retrieving the user's GitHub access token.
3. Resolving repository details by GitHub repo ID.
4. Fetching up to 300 supported repository files.
5. Chunking files.
6. Embedding chunks with Hugging Face.
7. Upserting vectors to Pinecone under namespace `user-${userId}-repo-${repoId}`.
8. Marking the job `COMPLETED` or `FAILED`.

### AI Writer

The AI writer is surfaced by `app/p/components/AIPanel.tsx` and served by `app/api/ai/generate/route.ts`.

Generation flow:

1. The dashboard `RepoList` owns repository indexing and status polling.
2. The AI panel reads the shared React Query repo cache and shows only repos already usable for generation.
3. User selects an indexed repo and sends prompt and repo ID to `POST /api/ai/generate`.
4. Server embeds the prompt, queries Pinecone, builds source context, and streams generated text from OpenRouter.
5. Client can insert the streamed markdown text into the Tiptap editor.

## External Services

| Service | Used For | Code |
| --- | --- | --- |
| GitHub OAuth/API/GraphQL | Authentication, repo search, repo file fetch, contribution stats | `lib/auth.ts`, `app/api/github/*`, `lib/github.ts`, `lib/github-stats.ts` |
| PostgreSQL | Persistent application data | Prisma schema/client |
| Redis | Caching repository lists, stats, platform counts | `lib/redis.ts` |
| Cloudinary | Authenticated image upload | `app/api/upload/route.ts`, `lib/tiptap-utils.ts` |
| Hugging Face Inference Router | Embeddings | `lib/embeddings.ts` |
| Pinecone | Vector storage and similarity search | `lib/pinecone.ts` |
| OpenRouter | Streaming AI writing response | `app/api/ai/generate/route.ts` |
| Inngest | Background indexing orchestration | `inngest/*`, `app/api/inngest/route.ts` |

## Import Aliases

`tsconfig.json` defines `@/*` for repository root imports. It also maps Tiptap-specific aliases such as `@/components/tiptap-ui/*` to `packages/tiptap/...`.

`next.config.ts` mirrors Tiptap aliases for both Turbopack and webpack.

## Generated And Vendor-Like Code

`packages/generated/prisma` is generated Prisma client output. It is documented as generated infrastructure and should not be edited manually.

`packages/tiptap` is checked-in application source, but much of it is reusable editor UI and copied template infrastructure. The active post creation surface imports parts of it directly from `app/p/components/client-page.tsx`.
