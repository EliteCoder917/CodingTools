import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <p className="font-mono text-5xl font-bold text-blood-500">404</p>
      <p className="mt-3 text-zinc-400">This snippet doesn’t exist.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to feed
      </Link>
    </div>
  );
}
