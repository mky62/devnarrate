# dev.narrate

> **Share your coding journey with the world** — storytelling for your code.

**DevNarrate** is a developer-focused blogging platform that lets you link your GitHub repositories and write rich, formatted articles explaining the architecture, design decisions, and lessons learned from your projects. Explain what you built, not just show the code.

---

## About

DevNarrate bridges the gap between code and context. While GitHub shows *what* you built, DevNarrate lets you explain *why* and *how*. It's a platform where developers can:

- Write detailed articles about their projects
- Link GitHub repositories to provide context
- Share their technical journey with the community
- Build a public portfolio of their work and knowledge

---

## Product

### Core Features

- **GitHub OAuth Authentication** — Sign in with GitHub, your profile is automatically imported
- **Rich Article Editor** — Full WYSIWYG editor powered by TipTap with headings, lists, code blocks, images, and more
- **Repository Integration** — Search and link GitHub repositories with live star/fork counts
- **Public Profiles** — Share your unique profile page (`devnarrate.com/yourname`) with posts and repos
- **Dashboard** — Manage your profile, posts, and linked repositories in one place
- **Image Upload** — Upload images via Cloudinary to enrich your articles
- **Platform Stats** — Track community growth with real-time developer, article, and repository counts

### Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript, React 19 |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI |
| **Editor** | TipTap v3 (custom extensions) |
| **Auth** | Better Auth + GitHub OAuth |
| **Database** | PostgreSQL + Prisma ORM |
| **Caching** | Redis |
| **Images** | Cloudinary |
| **State** | TanStack React Query |
| **Validation** | Zod |
| **Animations** | Framer Motion, Lenis |

---

## Goals

- **Democratize technical storytelling** — Make it easy for every developer to share their knowledge, not just their code
- **Build developer portfolios** — Help developers showcase not just what they've built, but how they think
- **Create a learning community** — Enable developers to learn from the real-world experiences and decisions of others
- **Bridge code and context** — Connect GitHub repositories with the narratives behind them
- **Lower the barrier to technical writing** — Provide a rich, intuitive editor that makes writing about code as natural as writing code

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance
- GitHub OAuth App
- Cloudinary account

### Environment Variables

Create a `.env` file with the following:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
app/                      # Next.js App Router
  (auth)/                 # Authentication routes
  (main)/dashboard/       # User dashboard
  [stageName]/            # Public profile pages
  p/create/               # Post creation
  p/[id]/                 # Post viewing
  home/                   # Landing page
  api/                    # API routes
lib/                      # Utilities (auth, prisma, redis, validation)
hooks/                    # Custom React hooks
packages/
  prisma/                 # Prisma schema & migrations
  tip tap/                # Custom TipTap editor package
services/                 # Service-layer utilities
public/                   # Static assets
```

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/)
- [TipTap Documentation](https://tiptap.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## Deploy on Vercel

The easiest way to deploy DevNarrate is using the [Vercel Platform](https://vercel.com/new). Make sure to configure your environment variables and database connection before deploying.
