import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "@/inngest/functions/indexRepo";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [indexRepo],
});