import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import {
  BookOpen,
  Boxes,
  Braces,
  Database,
  FileCode2,
  GitBranch,
  Settings2,
} from "lucide-react";
import ThemeToggle from "./theme-toggle";

type DocConfig = {
  slug: string;
  title: string;
  description: string;
  file: string;
  icon: typeof BookOpen;
};

type SidebarItem = {
  label: string;
  href: string;
  detail: string;
};

type SidebarNestedGroup = {
  title: string;
  items: SidebarItem[];
};

type SidebarChildGroup = {
  title: string;
  children: SidebarNestedGroup[];
};

type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  children?: SidebarChildGroup[];
};

type MarkdownBlock =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "table"; rows: string[][] };

export const docs: DocConfig[] = [
  {
    slug: "overview",
    title: "Overview",
    description: "Product goal, repo map, source areas, and main user flows.",
    file: "README.md",
    icon: BookOpen,
  },
  {
    slug: "architecture",
    title: "Architecture",
    description: "Runtime layers, boundaries, services, and generated code.",
    file: "architecture.md",
    icon: Boxes,
  },
  {
    slug: "data-model",
    title: "Data Model",
    description: "Prisma schema, relations, constraints, migrations, and client generation.",
    file: "data-model.md",
    icon: Database,
  },
  {
    slug: "api-reference",
    title: "API Reference",
    description: "Route handlers, request shapes, response behavior, and status codes.",
    file: "api-reference.md",
    icon: Braces,
  },
  {
    slug: "frontend-routes",
    title: "Frontend Routes",
    description: "App routes, layouts, client components, hooks, and UI data flow.",
    file: "frontend-routes.md",
    icon: FileCode2,
  },
  {
    slug: "editor-and-ai",
    title: "Editor + AI",
    description: "Tiptap, post rendering, repo indexing, embeddings, Pinecone, and OpenRouter.",
    file: "editor-and-ai.md",
    icon: GitBranch,
  },
  {
    slug: "operations",
    title: "Operations",
    description: "Scripts, environment variables, services, caching, and deployment notes.",
    file: "operations.md",
    icon: Settings2,
  },
];

const docHref = (slug: string, hash?: string) =>
  slug === "overview" ? `/docs${hash ? `#${hash}` : ""}` : `/docs/${slug}${hash ? `#${hash}` : ""}`;

const indexGroups: SidebarGroup[] = [
  {
    title: "Start",
    items: [
      { label: "Overview", href: docHref("overview"), detail: "product goal and repo map" },
      { label: "Architecture", href: docHref("architecture"), detail: "runtime layers and boundaries" },
      { label: "Operations", href: docHref("operations"), detail: "scripts, env, services" },
    ],
  },
  {
    title: "Product Surfaces",
    items: [
      {
        label: "Landing + Search",
        href: docHref("frontend-routes", "frontend-routes-landing-and-discovery"),
        detail: "home, stats, builder search",
      },
      {
        label: "Sign In",
        href: docHref("frontend-routes", "frontend-routes-authentication-ui"),
        detail: "GitHub OAuth entry",
      },
      {
        label: "Dashboard",
        href: docHref("frontend-routes", "frontend-routes-dashboard"),
        detail: "profile, posts, repos",
      },
      {
        label: "Public Profiles",
        href: docHref("frontend-routes", "frontend-routes-public-profile"),
        detail: "/:stageName pages",
      },
      {
        label: "Post Reader",
        href: docHref("frontend-routes", "frontend-routes-post-detail-page"),
        detail: "/p/:id rendering",
      },
      {
        label: "Post Editor",
        href: docHref("frontend-routes", "frontend-routes-post-creation"),
        detail: "/p/create workflow",
      },
    ],
  },
  {
    title: "Backend APIs",
    items: [
      {
        label: "Auth Handler",
        href: docHref("api-reference", "api-reference-authentication"),
        detail: "Better Auth route",
      },
      {
        label: "Profiles",
        href: docHref("api-reference", "api-reference-current-user-and-profiles"),
        detail: "me, public user, update, delete",
      },
      { label: "Posts", href: docHref("api-reference", "api-reference-posts"), detail: "list, save, delete, feed" },
      {
        label: "Likes",
        href: docHref("api-reference", "api-reference-post-api-posts-id-like"),
        detail: "like and unlike routes",
      },
      {
        label: "Repos",
        href: docHref("api-reference", "api-reference-repositories"),
        detail: "save, delete, list, public",
      },
      {
        label: "AI Generate",
        href: docHref("api-reference", "api-reference-ai"),
        detail: "OpenRouter streaming route",
      },
      {
        label: "Inngest",
        href: docHref("api-reference", "api-reference-inngest"),
        detail: "background event endpoint",
      },
      {
        label: "Uploads",
        href: docHref("api-reference", "api-reference-uploads"),
        detail: "Cloudinary image upload",
      },
    ],
  },
  {
    title: "Data Model",
    items: [
      { label: "User", href: docHref("data-model", "data-model-user"), detail: "profile and account owner" },
      { label: "Account", href: docHref("data-model", "data-model-account"), detail: "OAuth provider records" },
      { label: "Session", href: docHref("data-model", "data-model-session"), detail: "Better Auth sessions" },
      { label: "Repo", href: docHref("data-model", "data-model-repo"), detail: "saved GitHub repository" },
      { label: "Post", href: docHref("data-model", "data-model-post"), detail: "Tiptap JSON article" },
      { label: "Like", href: docHref("data-model", "data-model-like"), detail: "post reaction uniqueness" },
      {
        label: "Index Job",
        href: docHref("data-model", "data-model-repoindexjob"),
        detail: "repo embedding lifecycle",
      },
    ],
  },
  {
    title: "Editor + AI",
    items: [
      { label: "Overview", href: docHref("editor-and-ai"), detail: "writing and RAG systems" },
      {
        label: "Tiptap Package",
        href: docHref("editor-and-ai", "editor-and-ai-tiptap-package"),
        detail: "local editor components",
      },
      {
        label: "AI Writer",
        href: docHref("editor-and-ai", "editor-and-ai-ai-generation"),
        detail: "generation surface",
      },
    ],
    children: [
      {
        title: "Content Sections",
        children: [
          {
            title: "AI Pipeline",
            items: [
              {
                label: "Repo Indexing",
                href: docHref("editor-and-ai", "editor-and-ai-repository-indexing"),
                detail: "Inngest pipeline",
              },
              {
                label: "GitHub File Fetching",
                href: docHref("editor-and-ai", "editor-and-ai-github-file-fetching"),
                detail: "repo file collection",
              },
              {
                label: "Chunking",
                href: docHref("editor-and-ai", "editor-and-ai-chunking"),
                detail: "code and markdown splitting",
              },
              {
                label: "Embeddings",
                href: docHref("editor-and-ai", "editor-and-ai-embeddings"),
                detail: "Hugging Face vectorization",
              },
              {
                label: "Pinecone",
                href: docHref("editor-and-ai", "editor-and-ai-pinecone"),
                detail: "vector namespaces",
              },
              {
                label: "AI Generation",
                href: docHref("editor-and-ai", "editor-and-ai-ai-generation"),
                detail: "OpenRouter stream",
              },
            ],
          },
          {
            title: "Editor Flow",
            items: [
              {
                label: "Editor Surface",
                href: docHref("editor-and-ai", "editor-and-ai-tiptap-editor-surface"),
                detail: "active editor extensions",
              },
              {
                label: "Draft Persistence",
                href: docHref("editor-and-ai", "editor-and-ai-draft-persistence"),
                detail: "session and local storage",
              },
              {
                label: "Publishing",
                href: docHref("editor-and-ai", "editor-and-ai-publishing"),
                detail: "save post request",
              },
              {
                label: "Image Upload",
                href: docHref("editor-and-ai", "editor-and-ai-image-upload"),
                detail: "custom node and Cloudinary",
              },
              {
                label: "Post Rendering",
                href: docHref("editor-and-ai", "editor-and-ai-post-rendering-and-sanitization"),
                detail: "sanitize and render JSON",
              },
            ],
          },
        ],
      },
    ],
  },
];

export function getDocBySlug(slug: string) {
  return docs.find((doc) => doc.slug === slug);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripMarkdownLinks(value: string) {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function parseInline(value: string) {
  const cleaned = stripMarkdownLinks(value);
  const parts = cleaned.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="docs-inline-code rounded px-1.5 py-0.5 font-mono text-[0.9em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="docs-strong font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const codeMatch = line.match(/^```([\w-]+)?/);
    if (codeMatch) {
      const language = codeMatch[1] ?? "";
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push({ type: "code", language, code: codeLines.join("\n") });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const text = headingMatch[2].trim();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text,
        id: slugify(text),
      });
      index += 1;
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[2]);
      const items: string[] = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
        if (!itemMatch || /\d+\./.test(itemMatch[2]) !== ordered) break;
        items.push(itemMatch[3].trim());
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }

      const rows = tableLines
        .filter((row) => !/^\|\s*-+/.test(row))
        .map((row) =>
          row
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim())
        );

      if (rows.length > 0) {
        blocks.push({ type: "table", rows });
      }
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("#") &&
      !lines[index].startsWith("```") &&
      !lines[index].match(/^(\s*)([-*]|\d+\.)\s+/) &&
      !lines[index].trim().startsWith("|")
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

async function readDoc(file: string) {
  const fullPath = path.join(process.cwd(), "app", "docs", file);
  return fs.readFile(fullPath, "utf8");
}

function renderBlock(block: MarkdownBlock, key: string, docSlug: string) {
  if (block.type === "heading") {
    if (block.level === 1) return null;

    const HeadingTag = `h${Math.min(block.level, 4)}` as "h2" | "h3" | "h4";
    const className =
      block.level === 2
        ? "docs-heading scroll-mt-8 pt-8 text-3xl font-black tracking-tight"
        : "docs-subheading scroll-mt-8 pt-5 text-xl font-semibold";

    return (
      <HeadingTag key={key} id={`${docSlug}-${block.id}`} className={className}>
        {parseInline(block.text)}
      </HeadingTag>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p key={key} className="docs-body max-w-6xl text-lg font-medium leading-8">
        {parseInline(block.text)}
      </p>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <ListTag
        key={key}
        className={`docs-body max-w-6xl space-y-2 pl-5 text-lg font-medium ${
          block.ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {block.items.map((item, itemIndex) => (
          <li key={`${key}-${itemIndex}`} className="leading-8">
            {parseInline(item)}
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "code") {
    return (
      <div key={key} className="docs-code-block max-w-6xl overflow-hidden border">
        {block.language && (
          <div className="docs-code-label border-b px-4 py-2 font-mono text-xs">
            {block.language}
          </div>
        )}
        <pre className="overflow-x-auto p-4 text-sm leading-6">
          <code>{block.code}</code>
        </pre>
      </div>
    );
  }

  const [head, ...body] = block.rows;
  return (
    <div key={key} className="docs-table-wrap max-w-6xl overflow-x-auto border">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="docs-table-head">
          <tr>
            {head.map((cell, cellIndex) => (
              <th key={`${key}-head-${cellIndex}`} className="docs-table-cell border-b px-4 py-3 font-semibold">
                {parseInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`${key}-row-${rowIndex}`} className="docs-table-row border-b last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="docs-body px-4 py-3 align-top">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isActiveRoute(href: string, currentSlug: string) {
  const route = href.split("#")[0];
  return currentSlug === "overview" ? route === "/docs" : route === `/docs/${currentSlug}`;
}

function SidebarLink({ item, currentSlug }: { item: SidebarItem; currentSlug: string }) {
  const active = isActiveRoute(item.href, currentSlug);

  return (
    <Link
      href={item.href}
      className={`block transition-colors ${active ? "docs-active" : "docs-link"}`}
    >
      <span className="block text-lg font-semibold leading-tight">{item.label}</span>
      <span className="docs-faint mt-1 block text-xs font-medium leading-snug">
        {item.detail}
      </span>
    </Link>
  );
}

export default async function DocsShell({ slug }: { slug: string }) {
  const doc = getDocBySlug(slug) ?? docs[0];
  const blocks = parseMarkdown(await readDoc(doc.file));

  return (
    <main className="docs-shell h-dvh w-full overflow-hidden">
      <style>{`
        .docs-shell {
          --docs-bg: #070b13;
          --docs-sidebar: #171c26;
          --docs-panel: #141922;
          --docs-code: #0d1220;
          --docs-border: #334155;
          --docs-strong: #ffffff;
          --docs-heading: #ffffff;
          --docs-subheading: #f1f5f9;
          --docs-body: #cbd5e1;
          --docs-muted: #94a3b8;
          --docs-faint: #64748b;
          --docs-hover: #ffffff;
          --docs-pill-from: #64748b;
          --docs-pill-to: #0f172a;
          background: var(--docs-bg);
          color: var(--docs-strong);
        }

        html.docs-light .docs-shell {
          --docs-bg: #f4f7fb;
          --docs-sidebar: #e8edf5;
          --docs-panel: #ffffff;
          --docs-code: #eef3fb;
          --docs-border: #c8d1df;
          --docs-strong: #0f172a;
          --docs-heading: #0f172a;
          --docs-subheading: #1e293b;
          --docs-body: #334155;
          --docs-muted: #64748b;
          --docs-faint: #7c8798;
          --docs-hover: #0f172a;
          --docs-pill-from: #ffffff;
          --docs-pill-to: #cbd5e1;
        }

        .docs-sidebar { background: var(--docs-sidebar); }
        .docs-panel { background: var(--docs-panel); border-color: var(--docs-border); }
        .docs-border { border-color: var(--docs-border); }
        .docs-heading { color: var(--docs-heading); }
        .docs-subheading { color: var(--docs-subheading); }
        .docs-strong { color: var(--docs-strong); }
        .docs-body { color: var(--docs-body); }
        .docs-muted { color: var(--docs-muted); }
        .docs-faint { color: var(--docs-faint); }
        .docs-link { color: var(--docs-muted); }
        .docs-link:hover { color: var(--docs-hover); }
        .docs-active { color: var(--docs-strong); }
        .docs-theme-pill {
          color: var(--docs-strong);
          background: linear-gradient(to bottom, var(--docs-pill-from), var(--docs-pill-to));
        }
        .docs-code-block,
        .docs-inline-code {
          background: var(--docs-code);
          border-color: var(--docs-border);
          color: var(--docs-strong);
        }
        .docs-code-label,
        .docs-table-cell,
        .docs-table-wrap,
        .docs-table-row {
          border-color: var(--docs-border);
        }
        .docs-code-label,
        .docs-table-head {
          color: var(--docs-muted);
          background: var(--docs-code);
        }
      `}</style>

      <div className="grid h-dvh grid-cols-[minmax(240px,304px)_minmax(0,1fr)] gap-4">
        <aside className="docs-sidebar flex min-h-0 flex-col overflow-hidden p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="docs-faint text-lg font-medium uppercase tracking-[0.35em]">
              Index
            </p>
            <ThemeToggle />
          </div>

          <nav className="min-h-0 flex-1 space-y-8 overflow-y-auto pr-2">
            {indexGroups.map((group) => (
              <section key={group.title}>
                <p className="docs-faint mb-4 text-sm font-medium uppercase tracking-[0.35em]">
                  {group.title}
                </p>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <SidebarLink key={`${group.title}-${item.label}`} item={item} currentSlug={doc.slug} />
                  ))}
                </div>
                {group.children && (
                  <div className="docs-border mt-5 space-y-5 border-l pl-4">
                    {group.children.map((childGroup) => (
                      <div key={`${group.title}-${childGroup.title}`}>
                        <p className="docs-faint mb-3 text-xs font-semibold uppercase tracking-[0.22em]">
                          {childGroup.title}
                        </p>
                        <div className="docs-border space-y-5 border-l pl-4">
                          {childGroup.children.map((nestedGroup) => (
                            <div key={`${childGroup.title}-${nestedGroup.title}`}>
                              <p className="docs-faint mb-3 text-xs font-semibold uppercase tracking-[0.18em]">
                                {nestedGroup.title}
                              </p>
                              <div className="docs-border space-y-4 border-l pl-4">
                                {nestedGroup.items.map((item) => (
                                  <SidebarLink
                                    key={`${nestedGroup.title}-${item.label}`}
                                    item={item}
                                    currentSlug={doc.slug}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </nav>
        </aside>

        <section className="docs-panel overflow-y-auto border p-7">
          <div className="mb-10 flex items-center">
            <Link
              href="/home"
              className="docs-link flex items-center gap-3 text-xl font-medium transition-colors"
            >
              <span className="text-2xl leading-none">←</span>
              Home
            </Link>
          </div>

          <article id={doc.slug} className="mx-auto max-w-none">
            <header className="mb-10">
              <p className="docs-faint mb-4 text-sm font-semibold uppercase tracking-[0.35em]">
                {doc.slug === "overview" ? "Documentation" : "Documentation Route"}
              </p>
              <h1 className="docs-heading mb-6 max-w-5xl text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                {doc.slug === "overview" ? "DevNarrate Documentation" : doc.title}
              </h1>
              <p className="docs-body max-w-6xl text-xl font-semibold leading-relaxed xl:text-2xl">
                {doc.description}
              </p>
            </header>

            {doc.slug === "overview" && (
              <>
                <section className="mb-12">
                  <h2 className="docs-heading mb-6 text-3xl font-black">Quick Start</h2>
                  <div className="docs-code-block max-w-6xl border p-6">
                    <pre className="overflow-x-auto font-mono text-base font-bold leading-[1.65]">
                      <code>{`# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Open the app
http://localhost:3000

# Open these docs
http://localhost:3000/docs`}</code>
                    </pre>
                  </div>
                </section>

                <section className="mb-12">
                  <h2 className="docs-heading mb-6 text-3xl font-black">Documentation Routes</h2>
                  <div className="grid max-w-6xl gap-3 md:grid-cols-2">
                    {docs.map((routeDoc) => {
                      const Icon = routeDoc.icon;
                      return (
                        <Link
                          key={`doc-route-${routeDoc.slug}`}
                          href={docHref(routeDoc.slug)}
                          className="docs-border docs-link block border p-4 transition-colors"
                        >
                          <span className="mb-3 flex items-center gap-3">
                            <Icon size={20} />
                            <span className="docs-strong text-lg font-black">{routeDoc.title}</span>
                          </span>
                          <span className="block text-sm font-medium leading-6">{routeDoc.description}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            <div className="space-y-5">
              {blocks.map((block, blockIndex) => renderBlock(block, `${doc.slug}-${blockIndex}`, doc.slug))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
