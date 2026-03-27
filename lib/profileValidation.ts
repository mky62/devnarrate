import z from "zod";

export const profileSchema = z.object({
  stageName: z
    .string()
    .max(30, "Stage name must be 30 characters or less")
    .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, underscores, and hyphens allowed")
    .optional(),
  description: z
    .string()
    .max(500, "Bio must be 500 characters or less")
    .optional(),
  github: z
    .string()
    .url("Must be a valid URL")
    .regex(/github\.com/, "Must be a GitHub URL")
    .or(z.literal(""))
    .optional(),
  twitter: z
    .string()
    .url("Must be a valid URL")
    .regex(/(twitter\.com|x\.com)/, "Must be a Twitter/X URL")
    .or(z.literal(""))
    .optional(),
  linkedin: z
    .string()
    .url("Must be a valid URL")
    .regex(/linkedin\.com/, "Must be a LinkedIn URL")
    .or(z.literal(""))
    .optional(),
  feedback: z
    .string()
    .max(200, "Feedback must be 200 characters or less")
    .optional(),
});

