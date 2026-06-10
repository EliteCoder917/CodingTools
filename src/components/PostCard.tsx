import Link from "next/link";
import type { PostListItem } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { DeletePostButton } from "./DeletePostButton";

export function PostCard({
  post,
  owner = false,
}: {
  post: PostListItem;
  owner?: boolean;
}) {
  return (
    <div className="card group flex h-full flex-col overflow-hidden transition hover:border-blood-500/40 hover:shadow-glow">
      <Link href={`/posts/${post.id}`} className="block flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-semibold text-white group-hover:text-blood-300">
            {post.title}
          </h3>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400">
            {post.file_count} {post.file_count === 1 ? "file" : "files"}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
          {post.description || "No description provided."}
        </p>
      </Link>

      <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-zinc-500">
        <span className="text-blood-400/80">@{post.author_username}</span>
        {owner ? (
          <span className="flex items-center gap-1">
            <Link
              href={`/posts/${post.id}/edit`}
              className="btn-ghost px-2 py-1 text-xs"
            >
              Edit
            </Link>
            <DeletePostButton postId={post.id} title={post.title} />
          </span>
        ) : (
          <span>{formatDate(post.created_at)}</span>
        )}
      </div>
    </div>
  );
}
