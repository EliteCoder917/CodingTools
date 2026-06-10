import Link from "next/link";
import { Suspense } from "react";
import { searchPosts } from "@/lib/db";
import { PostCard } from "@/components/PostCard";
import { BrowseControls } from "@/components/BrowseControls";
import {
  BROWSE_PAGE_SIZE,
  FILES_FILTERS,
  SORT_OPTIONS,
  type FilesFilter,
  type SortOption,
} from "@/lib/limits";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function buildQuery(params: {
  q?: string;
  sort: SortOption;
  files: FilesFilter;
  page: number;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.sort !== "newest") sp.set("sort", params.sort);
  if (params.files !== "any") sp.set("files", params.files);
  if (params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/browse?${qs}` : "/browse";
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const q = one(sp.q)?.trim() || undefined;
  const sortRaw = one(sp.sort) as SortOption;
  const filesRaw = one(sp.files) as FilesFilter;
  const sort: SortOption = SORT_OPTIONS.includes(sortRaw) ? sortRaw : "newest";
  const files: FilesFilter = FILES_FILTERS.includes(filesRaw) ? filesRaw : "any";
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const { items, total } = await searchPosts({ query: q, sort, files, page });
  const totalPages = Math.max(1, Math.ceil(total / BROWSE_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Browse</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Search and filter every published snippet.
        </p>
      </div>

      <Suspense fallback={<div className="card h-28 animate-pulse" />}>
        <BrowseControls />
      </Suspense>

      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          {total} result{total === 1 ? "" : "s"}
          {q ? (
            <>
              {" "}for <span className="text-zinc-300">“{q}”</span>
            </>
          ) : null}
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-zinc-400">
          No snippets match your search.
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

      {totalPages > 1 && (
        <nav className="flex items-center justify-between pt-2">
          {page > 1 ? (
            <Link
              href={buildQuery({ q, sort, files, page: page - 1 })}
              className="btn-ghost"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {page < totalPages ? (
            <Link
              href={buildQuery({ q, sort, files, page: page + 1 })}
              className="btn-ghost"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
