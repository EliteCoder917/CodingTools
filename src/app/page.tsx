import Link from "next/link";
import { searchPosts } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ items, total }, session] = await Promise.all([
    searchPosts({ sort: "newest", page: 1, pageSize: 8 }),
    getSession(),
  ]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="animate-fade-up py-8 text-center sm:py-12">
        <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Share raw Python.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-zinc-400">
          Post one script or many, each with a title and a description of what it
          does. Clean, dev-friendly, and fast.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href={session ? "/new" : "/register"} className="btn-primary">
            {session ? "Post a snippet" : "Get started"}
          </Link>
          <Link href="/browse" className="btn-ghost">
            Browse all
          </Link>
        </div>
      </section>

      {/* Recent feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Latest snippets</h2>
          <Link
            href="/browse"
            className="text-sm text-blood-400 hover:text-blood-300"
          >
            Browse all {total} →
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="card p-10 text-center text-zinc-400">
            No snippets yet.{" "}
            <Link href="/register" className="text-blood-400 hover:text-blood-300">
              Create an account
            </Link>{" "}
            and be the first to post.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((post) => (
              <li key={post.id} className="animate-fade-up">
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
