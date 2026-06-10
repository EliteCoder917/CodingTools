<div align="center">

# 🐍 PythonTools

### Share raw Python. A clean, dev-friendly place to post code and discover what it does.

</div>

---

## What is PythonTools?

PythonTools is a community snippet board for Python. Create an account, paste in a
piece of raw Python, give it a **title** and a short **description of what it does**,
and publish it for everyone to read. Browsing the feed feels less like scrolling a
forum and more like flipping through a clean, syntax-highlighted notebook of useful
code.

Think of it as a focused home for the little scripts and tools that usually get lost
in gists, chat threads, and `Untitled-3.py` — somewhere they're actually titled,
described, and easy to find.

## Why you'd use it

- 📌 **Save the scripts you keep rewriting** — that one-liner, that sieve, that
  argparse boilerplate — in a place you'll actually look.
- 🔎 **Discover how other people solve things** by reading real, runnable snippets.
- 🤝 **Share with your team or the world** with a single link to a snippet.
- 🎯 **No noise** — every post is just a title, a description, and the code.

## Features

- **Accounts** — sign up with a username and password, no email required.
- **Post snippets** — title, description, and your raw Python code.
- **Beautiful code view** — Python syntax highlighting with one-click copy.
- **Clean, modern UI** — a red-and-black theme with soft gradients, built to feel
  fast and dev-friendly on desktop and mobile.
- **Browse the feed** — every snippet, newest first, with a live preview on each card.

## A quick tour

| Page | What's there |
| --- | --- |
| **Home** `/` | The feed of every published snippet, with previews. |
| **Sign up / Log in** | Create an account or get back into yours. |
| **New snippet** `/new` | Write a title, description, and paste your code. |
| **Snippet** `/posts/[id]` | The full post with highlighted code and a copy button. |

## Run it yourself

PythonTools is a [Next.js](https://nextjs.org) app backed by [Supabase](https://supabase.com).

1. **Create a Supabase project**, then run [`supabase/schema.sql`](supabase/schema.sql)
   in its SQL Editor to set up the tables.

2. **Add your credentials:**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a `JWT_SECRET`
   (generate one with `openssl rand -base64 32`).

3. **Install and start:**

   ```bash
   npm install
   npm run dev
   ```

   Then open **http://localhost:3000**.

## Built with

Next.js · TypeScript · Tailwind CSS · Supabase (Postgres) · highlight.js

> Accounts are secured with bcrypt-hashed passwords and signed session cookies, and
> all data lives in your Supabase database — nothing sensitive is stored in the
> browser.

---

<div align="center">
<sub>Built for sharing raw Python.</sub>
</div>
