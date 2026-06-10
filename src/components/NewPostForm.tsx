"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/posts/${data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Fast prime sieve in pure Python"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description <span className="text-zinc-600">(what does it do?)</span>
        </label>
        <textarea
          id="description"
          className="input min-h-24 resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Generates all primes below N using the Sieve of Eratosthenes…"
        />
      </div>

      <div>
        <label className="label" htmlFor="code">
          Python code
        </label>
        <textarea
          id="code"
          spellCheck={false}
          className="input min-h-72 resize-y font-mono text-sm leading-relaxed"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={"def sieve(n):\n    ..."}
          required
        />
      </div>

      {error && (
        <p className="rounded-lg border border-blood-600/40 bg-blood-600/10 px-3 py-2 text-sm text-blood-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Publishing…" : "Publish snippet"}
        </button>
      </div>
    </form>
  );
}
