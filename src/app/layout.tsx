import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "PythonTools — share raw Python",
  description:
    "A clean, dev-friendly place to post and discover raw Python code with a title and a description of what it does.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar username={session?.username ?? null} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-600">
          PythonTools · built for sharing raw Python
        </footer>
      </body>
    </html>
  );
}
