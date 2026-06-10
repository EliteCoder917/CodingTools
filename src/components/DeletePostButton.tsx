"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({
  postId,
  title,
  redirectTo,
}: {
  postId: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (
      !window.confirm(
        `Delete “${title}”? This permanently removes it and all of its files from the database.`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error ?? "Could not delete this post.");
        return;
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={loading}
      className="btn-ghost border-blood-600/40 text-blood-400 hover:bg-blood-600/10"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
