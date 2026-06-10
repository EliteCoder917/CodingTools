import Link from "next/link";
import { listPosts } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate, snippetPreview } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, session] = await Promise.all([listPosts(), getSession()]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="animate-fade-up py-8 text-center sm:py-12">
        <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Share raw Python.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-zinc-400">
          Post a snippet with a title and a description of what it does. Clean,
          dev-friendly, and fast.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={session ? "/new" : "/register"} className="btn-primary">
            {session ? "Post a snippet" : "Get started"}
          </Link>
          <a href="#feed" className="btn-ghost">
            Browse feed
          </a>
        </div>
      </section>

      {/* Feed */}
      <section id="feed" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Latest snippets</h2>
          <span className="text-sm text-zinc-500">{posts.length} total</span>
        </div>

        {posts.length === 0 ? (
          <div className="card p-10 text-center text-zinc-400">
            No snippets yet.{" "}
            <Link href="/register" className="text-blood-400 hover:text-blood-300">
              Create an account
            </Link>{" "}
            and be the first to post.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id} className="animate-fade-up">
                <Link
                  href={`/posts/${post.id}`}
                  className="card group block h-full overflow-hidden p-0 transition hover:border-blood-500/40 hover:shadow-glow"
                >
                  <div className="border-b border-white/5 px-5 pb-3 pt-4">
                    <h3 className="line-clamp-1 font-semibold text-white group-hover:text-blood-300">
                      {post.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                      {post.description || "No description provided."}
                    </p>
                  </div>
                  <pre className="max-h-36 overflow-hidden bg-ink-950/60 px-5 py-3 font-mono text-xs leading-relaxed text-zinc-500">
                    {snippetPreview(post.code)}
                  </pre>
                  <div className="flex items-center justify-between px-5 py-3 text-xs text-zinc-500">
                    <span className="text-blood-400/80">
                      @{post.author_username}
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
