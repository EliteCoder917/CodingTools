import { NextResponse } from "next/server";
import { deletePost, updatePostWithFiles } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { validatePostPayload } from "@/lib/validatePost";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { id } = await params;

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

  const outcome = await updatePostWithFiles({
    postId: id,
    authorId: session.userId,
    ...result.value,
  });

  if (outcome === "not_found") {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  if (outcome === "forbidden") {
    return NextResponse.json(
      { error: "You can only edit your own posts." },
      { status: 403 },
    );
  }

  return NextResponse.json({ id });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const { id } = await params;

  // deletePost only removes the row if it belongs to this user; the post_files
  // rows are removed automatically by ON DELETE CASCADE.
  const deleted = await deletePost(id, session.userId);
  if (!deleted) {
    return NextResponse.json(
      { error: "Post not found, or it isn’t yours to delete." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
