// Validation exports
export { profileSchema } from "./profile";
export { postSchema } from "./schemas";

import type { z } from "zod";
import type { profileSchema } from "./profile";
import type { postSchema } from "./schemas";

// Inferred types
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PostFormData = z.infer<typeof postSchema>;
