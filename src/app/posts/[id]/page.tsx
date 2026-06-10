import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostDetail } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CodeBlock } from "@/components/CodeBlock";
import { DeletePostButton } from "@/components/DeletePostButton";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, session] = await Promise.all([getPostDetail(id), getSession()]);
  if (!post) notFound();

  const isOwner = session?.userId === post.author_id;

  return (
    <article className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-blood-300"
      >
        ← Back to feed
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {post.title}
          </h1>
          {isOwner && (
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`/posts/${post.id}/edit`} className="btn-ghost">
                Edit
              </Link>
              <DeletePostButton
                postId={post.id}
                title={post.title}
                redirectTo="/profile"
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
          <span className="text-blood-400">@{post.author_username}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.created_at)}</span>
          <span aria-hidden>·</span>
          <span>
            {post.files.length} {post.files.length === 1 ? "file" : "files"}
          </span>
        </div>
        {post.description && (
          <p className="text-pretty leading-relaxed text-zinc-300">
            {post.description}
          </p>
        )}
      </header>

      <div className="space-y-6">
        {post.files.map((file) => (
          <section key={file.id} className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h2 className="font-mono text-sm font-semibold text-white">
                {file.name}
              </h2>
              {file.note && (
                <span className="text-sm text-zinc-400">— {file.note}</span>
              )}
            </div>
            <CodeBlock code={file.content} filename={file.name} />
          </section>
        ))}
      </div>
    </article>
  );
}
