import { NextResponse } from "next/server";
import { createPostWithFiles } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { validatePostPayload } from "@/lib/validatePost";

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

  const result = validatePostPayload(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const id = await createPostWithFiles({
    authorId: session.userId,
    ...result.value,
  });

  return NextResponse.json({ id });
}
