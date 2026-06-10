import { redirect } from "next/navigation";
import { PostEditor } from "@/components/PostEditor";
import { getSession } from "@/lib/auth";

export default async function NewPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          New snippet
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Posting as <span className="text-blood-400">@{session.username}</span>
        </p>
      </div>
      <PostEditor mode="create" />
    </div>
  );
}
