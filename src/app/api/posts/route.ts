import { NextResponse } from "next/server";
import { createPost } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, description, code } = (body ?? {}) as {
    title?: unknown;
    description?: unknown;
    code?: unknown;
  };

  if (typeof title !== "string" || typeof code !== "string") {
    return NextResponse.json(
      { error: "Title and code are required." },
      { status: 400 },
    );
  }

  const cleanTitle = title.trim();
  const cleanDescription =
    typeof description === "string" ? description.trim() : "";

  if (cleanTitle.length < 3 || cleanTitle.length > 120) {
    return NextResponse.json(
      { error: "Title must be 3–120 characters." },
      { status: 400 },
    );
  }
  if (cleanDescription.length > 5000) {
    return NextResponse.json(
      { error: "Description is too long (5000 char max)." },
      { status: 400 },
    );
  }
  if (code.trim().length === 0) {
    return NextResponse.json({ error: "Code cannot be empty." }, { status: 400 });
  }
  if (code.length > 100_000) {
    return NextResponse.json(
      { error: "Code is too long (100k char max)." },
      { status: 400 },
    );
  }

  const post = await createPost({
    authorId: session.userId,
    title: cleanTitle,
    description: cleanDescription,
    code,
  });

  return NextResponse.json({ id: post.id });
}
