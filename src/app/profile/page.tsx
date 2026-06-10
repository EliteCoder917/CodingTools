import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listUserPosts } from "@/lib/db";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const posts = await listUserPosts(session.userId);
  const fileTotal = posts.reduce((n, p) => n + p.file_count, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-blood-500 to-blood-700 text-xl font-bold text-white shadow-glow">
            {session.username.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              @{session.username}
            </h1>
            <p className="text-sm text-zinc-400">
              {posts.length} {posts.length === 1 ? "snippet" : "snippets"} ·{" "}
              {fileTotal} {fileTotal === 1 ? "file" : "files"}
            </p>
          </div>
        </div>
        <Link href="/new" className="btn-primary">
          + New snippet
        </Link>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Your snippets</h2>
        {posts.length === 0 ? (
          <div className="card p-10 text-center text-zinc-400">
            You haven’t posted anything yet.{" "}
            <Link href="/new" className="text-blood-400 hover:text-blood-300">
              Create your first snippet
            </Link>
            .
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id} className="animate-fade-up">
                <PostCard post={post} owner />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
