import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPostDetail } from "@/lib/db";
import { PostEditor } from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const post = await getPostDetail(id);
  if (!post) notFound();
  if (post.author_id !== session.userId) redirect(`/posts/${id}`);

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Edit snippet
        </h1>
        <p className="mt-1 text-sm text-zinc-400">Update your post and its files.</p>
      </div>
      <PostEditor
        mode="edit"
        postId={id}
        initial={{
          title: post.title,
          description: post.description,
          files: post.files.map((f) => ({
            name: f.name,
            note: f.note,
            content: f.content,
          })),
        }}
      />
    </div>
  );
}
