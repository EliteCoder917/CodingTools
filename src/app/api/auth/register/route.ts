import { NextResponse } from "next/server";
import { createUser, getUserByUsername } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

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

  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    return NextResponse.json(
      { error: "Username must be 3–32 characters." },
      { status: 400 },
    );
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return NextResponse.json(
      { error: "Username may only contain letters, numbers, and . _ -" },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const existing = await getUserByUsername(trimmed);
  if (existing) {
    return NextResponse.json(
      { error: "That username is already taken." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(trimmed, passwordHash);

  await createSession({ userId: user.id, username: user.username });

  return NextResponse.json({ id: user.id, username: user.username });
}
