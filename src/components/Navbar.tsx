import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export function Navbar({ username }: { username: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blood-500 to-blood-700 font-mono text-sm font-bold text-white shadow-glow">
            {">"}
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            python<span className="text-blood-500">tools</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {username ? (
            <>
              <Link href="/new" className="btn-primary">
                + New snippet
              </Link>
              <span className="hidden text-sm text-zinc-400 sm:inline">
                @{username}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
