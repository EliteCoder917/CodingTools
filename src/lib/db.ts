import "server-only";
import { getSupabaseAdmin } from "./supabase";

export type User = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  code: string;
  created_at: string;
};

export type PostWithAuthor = Post & { author_username: string };

// ---- users -----------------------------------------------------------------

export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();

  if (error) throw error;
  return data as User | null;
}

export async function createUser(
  username: string,
  passwordHash: string,
): Promise<User> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .insert({ username, password_hash: passwordHash })
    .select("*")
    .single();

  if (error) throw error;
  return data as User;
}

// ---- posts -----------------------------------------------------------------

export async function createPost(input: {
  authorId: string;
  title: string;
  description: string;
  code: string;
}): Promise<Post> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: input.authorId,
      title: input.title,
      description: input.description,
      code: input.code,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Post;
}

export async function listPosts(): Promise<PostWithAuthor[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("*, users!posts_author_id_fkey(username)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { users, ...post } = row as Post & {
      users: { username: string } | null;
    };
    return { ...post, author_username: users?.username ?? "unknown" };
  });
}

export async function getPost(id: string): Promise<PostWithAuthor | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("*, users!posts_author_id_fkey(username)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { users, ...post } = data as Post & {
    users: { username: string } | null;
  };
  return { ...post, author_username: users?.username ?? "unknown" };
}
