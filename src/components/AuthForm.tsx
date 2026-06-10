"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm animate-fade-up">
      <div className="card p-6 shadow-glow">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isRegister
            ? "Pick a username and password to start posting snippets."
            : "Log in to post and manage your Python snippets."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ada_lovelace"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {isRegister && (
              <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-blood-600/40 bg-blood-600/10 px-3 py-2 text-sm text-blood-400">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "…" : isRegister ? "Sign up" : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-zinc-400">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-blood-400 hover:text-blood-300">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="text-blood-400 hover:text-blood-300">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
