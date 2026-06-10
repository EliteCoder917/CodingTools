import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/db";
import { CodeBlock } from "@/components/CodeBlock";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl animate-fade-up space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-blood-300"
      >
        ← Back to feed
      </Link>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
          <span className="text-blood-400">@{post.author_username}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        {post.description && (
          <p className="text-pretty leading-relaxed text-zinc-300">
            {post.description}
          </p>
        )}
      </header>

      <CodeBlock code={post.code} />
    </article>
  );
}
