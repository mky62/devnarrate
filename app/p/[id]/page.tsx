import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { sanitize } from "isomorphic-dompurify";

import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";

import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Selection } from "@tiptap/extensions";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

const extensions = [
  StarterKit,
  Image,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  Typography,
  Superscript,
  Subscript,
  TextStyle,
  FontSize,
  Selection,
];

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          stageName: true,
          image: true, // you fetch it but never use it — see suggestion below
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  let html = "";
  try {
    const json = JSON.parse(post.content);
    const rawHtml = renderToHTMLString({
      content: json,
      extensions,
    });
    html = sanitize(rawHtml, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li",
        "a", "img",
        "hr",
        "span", "div",
        "sub", "sup",
        "mark",
        "table", "thead", "tbody", "tr", "th", "td",
      ],
      ALLOWED_ATTR: [
        "href", "src", "alt", "title", "target", "rel",
        "style", "class",
        "data-type",
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.]+(?:[^a-z+.]+|$))/i,
    });
  } catch {
    html = sanitize(`<p>${post.content}</p>`);
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>

          {post.projectLink && (
            <a
              href={post.projectLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink size={16} />
              View Project
            </a>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-8">
          {/* Optional improvement: use user.image if it exists */}
          {post.user.image ? (
            <NextImage
              src={post.user.image}
              alt={post.user.stageName || post.user.name || ""}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
              {post.user.stageName?.[0] || post.user.name?.[0] || "U"}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {post.user.stageName || post.user.name}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar size={14} />
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        {/* Content */}
        <article
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:rounded"
          style={{ 
            '--tw-prose-body': '#374151',
            '--tw-prose-headings': '#111827',
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          .prose p { margin-bottom: 1rem; }
          .prose p:empty { min-height: 0.5rem; margin-bottom: 0.5rem; }
          .prose br { display: block; content: ""; margin-top: 0.5rem; }
          
          article ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1rem !important; }
          article ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1rem !important; }
          article li { margin-bottom: 0.5rem !important; display: list-item !important; }
          article ul ul { list-style-type: circle !important; }
          article ul ul ul { list-style-type: square !important; }
          
          ul[data-type="bulletList"] { list-style-type: disc !important; }
          ol[data-type="orderedList"] { list-style-type: decimal !important; }
          li[data-type="listItem"] { display: list-item !important; }
          
          article span[style*="font-size"] { font-size: inherit !important; }
          article [style*="20px"] { font-size: 20px !important; }
        `}} />
      </main>
    </div>
  );
}