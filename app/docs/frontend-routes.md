# Frontend Routes And Components

## Routing Overview

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Redirects to `/home`. |
| `/home` | `app/home/page.tsx` | Marketing landing page with smooth scrolling, stats, search, and hero visuals. |
| `/explore` | `app/explore/page.tsx` | Explore page placeholder with header and ASCII coming-soon component. |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | GitHub sign-in page. |
| `/dashboard` | `app/(main)/dashboard/page.tsx` | Authenticated user dashboard. |
| `/:stageName` | `app/[stageName]/page.tsx` | Public profile dashboard. |
| `/p/create` | `app/p/create/page.tsx` | Authenticated post editor shell. |
| `/p/:id` | `app/p/[id]/page.tsx` | Public post detail page. |

## Global App Shell

`app/layout.tsx` imports global styles and Google fonts:

- Geist
- Montserrat
- Arimo
- Grape Nuts

The root body wraps children in `Providers`, which currently only provides TanStack Query.

`app/globals.css` imports:

- Tiptap SCSS variables and keyframes.
- Tailwind CSS v4.
- `tw-animate-css`.
- `shadcn/tailwind.css`.

It also defines light/dark design tokens and post/Tiptap list styling.

## Landing And Discovery

### Home Page

`app/home/page.tsx` is a client component using Lenis for smooth scrolling. It renders:

- Fixed background image from `public/dashbg.jpg`.
- `Navbar`.
- Hero section with `Title`, `Pill`, button, and `public/codeimg.svg`.
- Community stats section using `Stats`.
- Footer with project links.

### User Search

`app/home/components/Searchbar.tsx`:

- Debounces input with `useDebouncedValue`.
- Fetches `GET /api/users/search?q=...` through TanStack Query.
- Shows a dropdown of users.
- Navigates to `/${stageName}` on selection.

### Platform Stats

`app/home/components/Stats.tsx` fetches platform totals from `GET /api/stats`.

## Authentication UI

`app/(auth)/sign-in/page.tsx` computes a safe callback URL and renders `SignInForm`.

`app/(auth)/components/SignInForm.tsx`:

- Uses `signIn.social` from `lib/auth-client.ts`.
- Sends provider `github` and `callbackURL`.
- Shows a background image, particle effect, rotating text, and GitHub sign-in button.

`lib/auth-redirect.ts` ensures callback paths are safe relative paths and defaults to `/dashboard`.

## Dashboard

`app/(main)/dashboard/page.tsx` is a server component.

Flow:

1. Reads session with Better Auth.
2. Redirects unauthenticated users to `/sign-in`.
3. Fetches current user, saved repos, latest posts, and GitHub stats in parallel.
4. Serializes posts with `readOnly: true`.
5. Renders a three-column dashboard over `public/dashbg.jpg`.

Columns:

- Left: `ProfileSection` and `DeleteProfile`.
- Center: `PostSection`.
- Right: `RepoList`.

### Profile Components

`ProfileSection` displays the user profile and GitHub stats, and opens `ProfileEditModal`.

`ProfileEditModal` validates profile data and calls `PATCH /api/user/profile`.

`SocialLinks` renders social link values from the profile JSON.

`ProfileAvatar` and `ProfileBanner` handle display-only profile visuals.

`DeleteProfile` requires typing `DELETE`, calls `DELETE /api/user/delete`, and then routes away.

### Post Components

`PostSection` shows recent posts and uses `usePosts`/`useDeletePost` for client-side refetching and optimistic deletion.

`components/posts/PostLikeButton.tsx` renders like controls and delegates behavior to `usePostLike`.

### Repository Components

`RepoList`:

- Receives initial saved repos from the dashboard server component.
- Opens a search modal and fetches GitHub repositories once per dashboard mount.
- Calls `GET /api/github/repos`, then filters the cached browser list locally while typing.
- Calls `POST /api/repos/add`.
- Calls `DELETE /api/repos/delete`.
- Calls `POST /api/repos/index` to start repository indexing jobs.
- Owns index-status refresh through `useRepoIndexingPolling`, which refetches while any repo is `pending` or `indexing`.
- Populates the shared TanStack Query `["repos"]` cache used by the dashboard and AI panel.
- Keeps local mutation state for add/delete/index button feedback.

## Public Profile

`app/[stageName]/page.tsx` renders the public dashboard by `stageName` with the same three-column concept:

- `PublicProfileSection`
- `PublicPostSection`
- `PublicRepoList`

Public components fetch through public APIs:

- `GET /api/user/[stageName]`
- `GET /api/posts/public/[stageName]`
- `GET /api/repos/public/[stageName]`
- `GET /api/github/stats/public/[stageName]`

## Post Detail Page

`app/p/[id]/page.tsx` is a server component.

Flow:

1. Loads optional viewer session.
2. Fetches post with author and like count.
3. Calls `serializePostDetail`.
4. Sanitizes and renders stored Tiptap JSON through `renderPostContent`.
5. Sanitizes project link and contribution URL.
6. Shows author, date, like button, article content, project link, and contribution link when available.

The contribution link points to `/api/contributions/redirect?postId=...` instead of linking directly, so the click can be recorded.

## Post Creation

`app/p/create/page.tsx` renders `ClientPage`.

`app/p/components/client-page.tsx`:

- Requires client-side session through `useSession`.
- Configures a Tiptap editor with StarterKit, Image, lists, text alignment, typography, highlight, text style/font size, superscript/subscript, selection, horizontal rule, and custom image upload node.
- Persists draft `title`, `link`, and `content` in `sessionStorage`.
- Persists editor theme in `localStorage` as `editor-theme`.
- Saves posts with `POST /api/saveposts`.
- Toggles the AI side panel.

`app/p/components/AIPanel.tsx`:

- Reads repository options from `useCachedRepos`, which subscribes to the existing `["repos"]` cache with `enabled: false`.
- Does not fetch, poll, or start index jobs.
- Shows only cached repos with `completed`, `failed_with_stale_index`, or `stale` status.
- Calls `POST /api/ai/generate` only after a usable repo is selected.

## React Hooks

Application data hooks:

- `useUser`: TanStack Query wrapper for current user.
- `usePosts`: fetches current user's posts.
- `useDeletePost`: optimistic post deletion.
- `useRepos`: fetches current user's saved repos.
- `useCachedRepos`: cache-only repo reader used by the AI panel.
- `useAddRepo`: invalidates repo query after add.
- `useDeleteRepo`: optimistic repo deletion.
- `useUpdateProfile`: profile update mutation.
- `usePostLike`: optimistic like toggling and sign-in redirect.

UI utility hooks:

- `useDebouncedValue`
- `useThrottledCallback`
- `useElementRect`
- `useIsBreakpoint`
- `useMenuNavigation`
- `useScrolling`
- `useComposedRef`
- `useTiptapEditor`
- `useCursorVisibility`
- `useUnmount`
- `useWindowSize`

Several UI utility hooks are duplicated under `packages/tiptap/hooks` for the reusable editor package.
