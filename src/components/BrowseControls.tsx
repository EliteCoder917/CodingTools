"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function BrowseControls() {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get("q") ?? "");
  const sort = params.get("sort") ?? "newest";
  const files = params.get("files") ?? "any";

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v && v !== "any" && !(k === "sort" && v === "newest")) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page"); // any filter change resets to page 1
    const qs = sp.toString();
    router.push(qs ? `/browse?${qs}` : "/browse");
  }

  return (
    <div className="card p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="label" htmlFor="q">
            Search
          </label>
          <div className="flex gap-2">
            <input
              id="q"
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles & descriptions…"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <label className="label" htmlFor="files">
              Files
            </label>
            <select
              id="files"
              className="input"
              value={files}
              onChange={(e) => apply({ files: e.target.value })}
            >
              <option value="any">Any</option>
              <option value="single">Single file</option>
              <option value="multiple">Multiple files</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              className="input"
              value={sort}
              onChange={(e) => apply({ sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}
