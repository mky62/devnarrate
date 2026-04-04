import z from "zod";

const tipTapMark = z.object({
  type: z.string().min(1),
  attrs: z.record(z.string(), z.unknown()).optional().nullable(),
}).passthrough();

const tipTapContentNode: z.ZodType = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    attrs: z.record(z.string(), z.unknown()).optional().nullable(),
    content: z.array(tipTapContentNode).optional(),
    marks: z.array(tipTapMark).optional(),
    text: z.string().optional(),
  }).passthrough().refine(
    (node) => {
      if (node.type === "text") {
        return typeof node.text === "string" && node.text.length > 0;
      }
      return true;
    },
    { message: "Text nodes must have non-empty text content" }
  )
);

const tipTapDocument = z.object({
  type: z.literal("doc"),
  content: z.array(tipTapContentNode).min(1, "Document must have at least one node"),
}).passthrough();

export const postSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  link: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  content: tipTapDocument.refine(
    (doc) => {
      const jsonStr = JSON.stringify(doc);
      return jsonStr.length > 20;
    },
    { message: "Content must not be empty" }
  ),
});

export const repoSchema = z.object({
  githubRepoId: z.number(),
  name: z.string().min(1, "Repository name is required"),
  language: z.string().optional().nullable(),
  stargazers_count: z.number().int().min(0).default(0),
  forks_count: z.number().int().min(0).default(0),
});

export const profileUpdateSchema = z.object({
  stageName: z
    .string()
    .max(30, "Stage name must be 30 characters or less")
    .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, underscores, and hyphens allowed")
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional()
    .nullable(),
  socialLinks: z
    .record(z.string(), z.string().url())
    .optional()
    .nullable(),
});
