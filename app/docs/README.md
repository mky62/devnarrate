# DevNarrate Codebase Documentation

This directory documents the current DevNarrate application as implemented in the repository.

DevNarrate is a Next.js App Router application for developer storytelling. Users authenticate with GitHub, save repositories, write rich Tiptap posts, publish public profile pages, collect likes, expose contribution links, and optionally use an AI writer backed by indexed repository code.

## Documentation Map

- [Architecture](./architecture.md): application shape, runtime boundaries, major dependencies, and cross-cutting concerns.
- [Data Model](./data-model.md): Prisma schema, model relationships, migrations, and generated Prisma client notes.
- [API Reference](./api-reference.md): all route handlers under `app/api`, grouped by feature.
- [Frontend Routes](./frontend-routes.md): pages, layouts, client components, hooks, and UI data flow.
- [Editor And AI](./editor-and-ai.md): Tiptap editor, post rendering, image upload, repository indexing, embeddings, Pinecone, and OpenRouter generation.
- [Operations](./operations.md): environment variables, scripts, cache behavior, external services, and known implementation notes.

## Source Areas

| Area | Purpose |
| --- | --- |
| `app/` | Next.js App Router pages, layouts, API route handlers, and route-local components. |
| `lib/` | Server/client helpers for auth, data access wrappers, validation, post rendering, GitHub, Redis, embeddings, Pinecone, and Tiptap utilities. |
| `hooks/` | React Query hooks and UI utility hooks. Many are mirrored from the bundled Tiptap package. |
| `components/` | Shared app-level components such as particles and post like button. |
| `packages/prisma/` | Prisma schema and SQL migrations. |
| `packages/generated/prisma/` | Generated Prisma TypeScript client. Treat as generated output, not hand-written source. |
| `packages/tiptap/` | Local Tiptap UI primitives, editor toolbar controls, icons, node styling, image-upload node, and a simple editor template. |
| `inngest/` | Inngest client and repository indexing function. |
| `services/` | Small service helper for random banner fetching. |
| `public/` | Static visual assets used by landing, dashboard, and auth screens. |

## Main User Flows

1. A visitor lands on `/home` or `/`, searches for builders, or signs in.
2. GitHub OAuth creates or resumes a Better Auth user session.
3. An authenticated user reaches `/dashboard`, edits their public profile, saves repositories, and writes posts.
4. Post creation happens in `/p/create`, where Tiptap JSON is saved through `POST /api/saveposts`.
5. Public profile pages live at `/:stageName` and load profile, posts, repos, and GitHub stats through public APIs.
6. Post pages live at `/p/:id`, sanitize/render stored Tiptap JSON, expose the project link, and optionally redirect contribution clicks through tracking.
7. AI writing uses repositories indexed from the dashboard `RepoList`. The AI panel reads the shared cached repo list, shows only usable indexed repos, retrieves relevant Pinecone chunks, and streams generated text from OpenRouter.
