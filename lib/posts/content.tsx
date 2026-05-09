import type { JSONContent } from "@tiptap/core";
import type { ReactNode } from "react";

import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
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

const ALLOWED_NODE_TYPES = new Set([
  "doc",
  "text",
  "paragraph",
  "heading",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
  "taskList",
  "taskItem",
  "image",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
]);

const ALLOWED_MARK_TYPES = new Set([
  "bold",
  "italic",
  "strike",
  "code",
  "link",
  "highlight",
  "subscript",
  "superscript",
  "textStyle",
]);

const ALLOWED_TEXT_ALIGNMENTS = new Set(["left", "center", "right", "justify"]);
const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const ALLOWED_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);
const FONT_SIZE_PATTERN = /^(?:[1-9]\d?(?:\.\d+)?)(?:px|em|rem|%)$/i;
const COLOR_PATTERN =
  /^(?:#[0-9a-f]{3,8}|(?:rgb|hsl)a?\(\s*[\d.%\s,/-]+\)|[a-z]+)$/i;

type UnknownRecord = Record<string, unknown>;
type SanitizedMark = {
  type: string;
  attrs?: UnknownRecord;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeString(
  value: unknown,
  maxLength = 2_000,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

function sanitizeNumber(
  value: unknown,
  { min, max }: { min: number; max: number },
): number | undefined {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isFinite(numericValue)) {
    return undefined;
  }

  const normalized = Math.trunc(numericValue);

  if (normalized < min || normalized > max) {
    return undefined;
  }

  return normalized;
}

function sanitizeBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function sanitizeColor(value: unknown): string | undefined {
  const color = sanitizeString(value, 64);

  if (!color || !COLOR_PATTERN.test(color)) {
    return undefined;
  }

  return color;
}

function sanitizeFontSize(value: unknown): string | undefined {
  const fontSize = sanitizeString(value, 32);

  if (!fontSize || !FONT_SIZE_PATTERN.test(fontSize)) {
    return undefined;
  }

  return fontSize;
}

function sanitizeUrl(
  value: unknown,
  {
    allowRelative = false,
    allowHash = false,
    protocols = ALLOWED_LINK_PROTOCOLS,
  }: {
    allowRelative?: boolean;
    allowHash?: boolean;
    protocols?: Set<string>;
  } = {},
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (allowHash && trimmed.startsWith("#")) {
    return trimmed;
  }

  if (
    allowRelative &&
    (trimmed.startsWith("./") ||
      trimmed.startsWith("../") ||
      (trimmed.startsWith("/") && !trimmed.startsWith("//")))
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (!protocols.has(parsed.protocol)) {
      return undefined;
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}

function sanitizeMarks(value: unknown): SanitizedMark[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const marks = value
    .map((mark) => sanitizeMark(mark))
    .filter((mark): mark is SanitizedMark => Boolean(mark));

  return marks.length > 0 ? marks : undefined;
}

function sanitizeMark(mark: unknown): SanitizedMark | null {
  if (!isRecord(mark) || typeof mark.type !== "string") {
    return null;
  }

  if (!ALLOWED_MARK_TYPES.has(mark.type)) {
    return null;
  }

  const attrs = isRecord(mark.attrs) ? mark.attrs : undefined;

  switch (mark.type) {
    case "link": {
      const href = sanitizeUrl(attrs?.href, {
        allowRelative: true,
        allowHash: true,
      });

      if (!href) {
        return null;
      }

      const sanitizedAttrs: UnknownRecord = {
        href,
        rel: "noopener noreferrer nofollow",
      };

      if (attrs?.target === "_blank") {
        sanitizedAttrs.target = "_blank";
      }

      const title = sanitizeString(attrs?.title, 256);
      if (title) {
        sanitizedAttrs.title = title;
      }

      return { type: "link", attrs: sanitizedAttrs };
    }

    case "highlight": {
      const color = sanitizeColor(attrs?.color);
      return color ? { type: "highlight", attrs: { color } } : { type: "highlight" };
    }

    case "textStyle": {
      const fontSize = sanitizeFontSize(attrs?.fontSize);
      return fontSize ? { type: "textStyle", attrs: { fontSize } } : null;
    }

    default:
      return { type: mark.type };
  }
}

function sanitizeNodeList(value: unknown): JSONContent[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const nodes = value
    .map((node) => sanitizeNode(node))
    .filter((node): node is JSONContent => Boolean(node));

  return nodes.length > 0 ? nodes : undefined;
}

function sanitizeNode(node: unknown): JSONContent | null {
  if (!isRecord(node) || typeof node.type !== "string") {
    return null;
  }

  if (!ALLOWED_NODE_TYPES.has(node.type)) {
    return null;
  }

  if (node.type === "text") {
    return typeof node.text === "string"
      ? {
          type: "text",
          text: node.text,
          marks: sanitizeMarks(node.marks),
        }
      : null;
  }

  const sanitized: JSONContent = {
    type: node.type,
    marks: sanitizeMarks(node.marks),
    content: sanitizeNodeList(node.content),
  };

  const attrs = isRecord(node.attrs) ? node.attrs : undefined;

  switch (node.type) {
    case "heading": {
      const level = sanitizeNumber(attrs?.level, { min: 1, max: 6 }) ?? 1;
      const textAlign = sanitizeString(attrs?.textAlign, 16);
      sanitized.attrs = {
        level,
        ...(textAlign && ALLOWED_TEXT_ALIGNMENTS.has(textAlign)
          ? { textAlign }
          : {}),
      };
      return sanitized;
    }

    case "paragraph": {
      const textAlign = sanitizeString(attrs?.textAlign, 16);
      if (textAlign && ALLOWED_TEXT_ALIGNMENTS.has(textAlign)) {
        sanitized.attrs = { textAlign };
      }
      return sanitized;
    }

    case "orderedList": {
      const start = sanitizeNumber(attrs?.start, { min: 1, max: 999 });
      if (start) {
        sanitized.attrs = { start };
      }
      return sanitized;
    }

    case "taskItem": {
      const checked = sanitizeBoolean(attrs?.checked);
      sanitized.attrs = { checked: checked ?? false };
      return sanitized;
    }

    case "image": {
      const src = sanitizeUrl(attrs?.src, {
        allowRelative: true,
        protocols: ALLOWED_IMAGE_PROTOCOLS,
      });

      if (!src) {
        return null;
      }

      sanitized.attrs = {
        src,
        ...(sanitizeString(attrs?.alt, 256)
          ? { alt: sanitizeString(attrs?.alt, 256) }
          : {}),
        ...(sanitizeString(attrs?.title, 256)
          ? { title: sanitizeString(attrs?.title, 256) }
          : {}),
        ...(sanitizeNumber(attrs?.width, { min: 1, max: 4096 })
          ? { width: sanitizeNumber(attrs?.width, { min: 1, max: 4096 }) }
          : {}),
        ...(sanitizeNumber(attrs?.height, { min: 1, max: 4096 })
          ? { height: sanitizeNumber(attrs?.height, { min: 1, max: 4096 }) }
          : {}),
      };

      return sanitized;
    }

    default:
      return sanitized;
  }
}

function sanitizeDocument(value: unknown): JSONContent | null {
  const document = sanitizeNode(value);

  if (!document || document.type !== "doc") {
    return null;
  }

  return document;
}

export function getSafeExternalUrl(value: unknown): string | undefined {
  return sanitizeUrl(value, { protocols: ALLOWED_IMAGE_PROTOCOLS });
}

export function renderPostContent(rawContent: string): ReactNode {
  try {
    const parsed = JSON.parse(rawContent);
    const sanitizedDocument = sanitizeDocument(parsed);

    if (!sanitizedDocument) {
      return <p className="whitespace-pre-wrap">{rawContent}</p>;
    }

    return renderToReactElement({
      content: sanitizedDocument,
      extensions,
    });
  } catch {
    return <p className="whitespace-pre-wrap">{rawContent}</p>;
  }
}
