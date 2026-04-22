import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import ClientPage from "@/app/p/components/client-page";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      projectLink: true,
      content: true,
    },
  });

  if (!post || post.userId !== session.user.id) {
    notFound();
  }

  return (
    <ClientPage
      mode="edit"
      postId={post.id}
      initialTitle={post.title}
      initialLink={post.projectLink ?? ""}
      initialContent={post.content}
    />
  );
}
