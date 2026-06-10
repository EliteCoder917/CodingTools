"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ACCEPTED_UPLOAD,
  MAX_FILES,
  MAX_FILE_CHARS,
} from "@/lib/limits";

export type EditorFile = {
  key: string;
  name: string;
  note: string;
  content: string;
};

export type EditorInitial = {
  title: string;
  description: string;
  files: { name: string; note: string; content: string }[];
};

let keySeq = 0;
const nextKey = () => `f${keySeq++}`;

function blankFile(): EditorFile {
  return { key: nextKey(), name: "", note: "", content: "" };
}

export function PostEditor({
  mode,
  postId,
  initial,
}: {
  mode: "create" | "edit";
  postId?: string;
  initial?: EditorInitial;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [files, setFiles] = useState<EditorFile[]>(
    initial && initial.files.length > 0
      ? initial.files.map((f) => ({ key: nextKey(), ...f }))
      : [blankFile()],
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const atLimit = files.length >= MAX_FILES;

  function updateFile(key: string, patch: Partial<EditorFile>) {
    setFiles((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f)),
    );
  }

  function addFile() {
    if (atLimit) return;
    setFiles((prev) => [...prev, blankFile()]);
  }

  function removeFile(key: string) {
    setFiles((prev) =>
      prev.length === 1 ? prev : prev.filter((f) => f.key !== key),
    );
  }

  // Read uploaded files as TEXT and turn each into an editable code block, so
  // the script itself is stored and shown to others (not the binary file).
  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-uploading the same file
    if (picked.length === 0) return;
    setError(null);

    const room = MAX_FILES - files.length;
    if (room <= 0) {
      setError(`You can attach at most ${MAX_FILES} files.`);
      return;
    }
    const toRead = picked.slice(0, room);
    if (picked.length > room) {
      setError(`Only the first ${room} file(s) were added (max ${MAX_FILES}).`);
    }

    const read = await Promise.all(
      toRead.map(
        (file) =>
          new Promise<EditorFile | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const text = String(reader.result ?? "");
              resolve({
                key: nextKey(),
                name: file.name,
                note: "",
                content: text.slice(0, MAX_FILE_CHARS),
              });
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
          }),
      ),
    );

    const valid = read.filter((f): f is EditorFile => f !== null && f.content.trim() !== "");
    setFiles((prev) => {
      // Drop a single empty starter block if the user hasn't typed anything.
      const base =
        prev.length === 1 && prev[0].content.trim() === "" && prev[0].name.trim() === ""
          ? []
          : prev;
      return [...base, ...valid].slice(0, MAX_FILES);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleaned = files
      .map((f) => ({ name: f.name.trim(), note: f.note.trim(), content: f.content }))
      .filter((f) => f.content.trim() !== "");

    if (cleaned.length === 0) {
      setError("Add at least one file with some code.");
      return;
    }

    setLoading(true);
    try {
      const url = mode === "edit" ? `/api/posts/${postId}` : "/api/posts";
      const res = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, files: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(`/posts/${data.id ?? postId}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          Description <span className="text-zinc-600">(what does the whole thing do?)</span>
        </label>
        <textarea
          id="description"
          className="input min-h-24 resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A small toolkit for working with primes…"
        />
      </div>

      {/* Files */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Python files</h2>
            <p className="text-xs text-zinc-500">
              Split your post into multiple scripts. {files.length}/{MAX_FILES} used.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_UPLOAD}
              multiple
              hidden
              onChange={onUpload}
            />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={atLimit}
            >
              ↑ Upload
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={addFile}
              disabled={atLimit}
            >
              + Add file
            </button>
          </div>
        </div>

        {files.map((file, i) => (
          <div key={file.key} className="card space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-blood-400">
                file {i + 1}
              </span>
              <button
                type="button"
                className="text-xs text-zinc-500 hover:text-blood-400 disabled:opacity-40"
                onClick={() => removeFile(file.key)}
                disabled={files.length === 1}
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">File name</label>
                <input
                  className="input font-mono"
                  value={file.name}
                  onChange={(e) => updateFile(file.key, { name: e.target.value })}
                  placeholder="primes.py"
                />
              </div>
              <div>
                <label className="label">
                  Subtitle <span className="text-zinc-600">(how it contributes)</span>
                </label>
                <input
                  className="input"
                  value={file.note}
                  onChange={(e) => updateFile(file.key, { note: e.target.value })}
                  placeholder="Core sieve implementation"
                />
              </div>
            </div>

            <div>
              <label className="label">Code</label>
              <textarea
                spellCheck={false}
                className="input min-h-56 resize-y font-mono text-sm leading-relaxed"
                value={file.content}
                onChange={(e) =>
                  updateFile(file.key, { content: e.target.value })
                }
                placeholder={"def sieve(n):\n    ..."}
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-blood-600/40 bg-blood-600/10 px-3 py-2 text-sm text-blood-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading
            ? mode === "edit"
              ? "Saving…"
              : "Publishing…"
            : mode === "edit"
              ? "Save changes"
              : "Publish snippet"}
        </button>
      </div>
    </form>
  );
}
