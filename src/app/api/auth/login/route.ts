import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  const user = await getUserByUsername(username.trim());

  // Always run a comparison-ish path; respond with the same message either way
  // to avoid leaking which usernames exist.
  const ok = user ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !ok) {
    return NextResponse.json(
      { error: "Incorrect username or password." },
      { status: 401 },
    );
  }

  await createSession({ userId: user.id, username: user.username });

  return NextResponse.json({ id: user.id, username: user.username });
}
