import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsShell, { docs, getDocBySlug } from "../docs-shell";

type DocsRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return docs
    .filter((doc) => doc.slug !== "overview")
    .map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DocsRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc || doc.slug === "overview") {
    return {
      title: "Docs | dev.narrate",
    };
  }

  return {
    title: `${doc.title} | dev.narrate docs`,
    description: doc.description,
  };
}

export default async function DocsRoutePage({ params }: DocsRouteProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc || doc.slug === "overview") {
    notFound();
  }

  return <DocsShell slug={doc.slug} />;
}
