import type { Metadata } from "next";
import DocsShell from "./docs-shell";

export const metadata: Metadata = {
  title: "Docs | dev.narrate",
  description: "DevNarrate codebase documentation",
};

export default function DocsPage() {
  return <DocsShell slug="overview" />;
}
