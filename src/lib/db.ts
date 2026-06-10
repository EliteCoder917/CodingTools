import "server-only";
import { getSupabaseAdmin } from "./supabase";
import {
  BROWSE_PAGE_SIZE,
  type FilesFilter,
  type SortOption,
} from "./limits";

export type User = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
};

export type PostFileInput = {
  name: string;
  note: string;
  content: string;
};

export type PostFile = {
  id: string;
  post_id: string;
  position: number;
  name: string;
  note: string;
  content: string;
};

// Lightweight row for feed / browse / profile lists (no file contents).
export type PostListItem = {
  id: string;
  title: string;
  description: string;
  file_count: number;
  created_at: string;
  author_id: string;
  author_username: string;
};

export type PostDetail = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  created_at: string;
  author_username: string;
  files: PostFile[];
};

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

// ---- posts: create / update / delete ---------------------------------------

export async function createPostWithFiles(input: {
  authorId: string;
  title: string;
  description: string;
  files: PostFileInput[];
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("create_post_with_files", {
    p_author: input.authorId,
    p_title: input.title,
    p_description: input.description,
    p_files: input.files,
  });

  if (error) throw error;
  return data as string;
}

export type UpdateResult = "ok" | "not_found" | "forbidden";

export async function updatePostWithFiles(input: {
  postId: string;
  authorId: string;
  title: string;
  description: string;
  files: PostFileInput[];
}): Promise<UpdateResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("update_post_with_files", {
    p_post: input.postId,
    p_author: input.authorId,
    p_title: input.title,
    p_description: input.description,
    p_files: input.files,
  });

  if (error) {
    if (/not authorized/i.test(error.message)) return "forbidden";
    throw error;
  }
  return data ? "ok" : "not_found";
}

// Deletes a post (and, via ON DELETE CASCADE, all of its post_files rows) —
// but only if it belongs to the given author. Returns true if a row was removed.
export async function deletePost(
  postId: string,
  authorId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", authorId)
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// ---- posts: read -----------------------------------------------------------

type ListRow = {
  id: string;
  title: string;
  description: string;
  file_count: number;
  created_at: string;
  author_id: string;
  users: { username: string } | null;
};

function toListItem(row: ListRow): PostListItem {
  const { users, ...rest } = row;
  return { ...rest, author_username: users?.username ?? "unknown" };
}

const LIST_SELECT =
  "id,title,description,file_count,created_at,author_id, users!posts_author_id_fkey(username)";

export type SearchParams = {
  query?: string;
  sort?: SortOption;
  files?: FilesFilter;
  page?: number;
  pageSize?: number;
};

export type SearchResult = {
  items: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
};

// Indexed search: full-text (GIN tsvector) for `query`, indexed `file_count`
// for the single/multiple filter, indexed `created_at` for ordering.
export async function searchPosts(params: SearchParams): Promise<SearchResult> {
  const supabase = getSupabaseAdmin();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? BROWSE_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("posts")
    .select(LIST_SELECT, { count: "exact" });

  const query = params.query?.trim();
  if (query) {
    q = q.textSearch("search_vector", query, {
      type: "websearch",
      config: "english",
    });
  }

  if (params.files === "single") q = q.eq("file_count", 1);
  else if (params.files === "multiple") q = q.gt("file_count", 1);

  switch (params.sort) {
    case "oldest":
      q = q.order("created_at", { ascending: true });
      break;
    case "title":
      q = q.order("title", { ascending: true });
      break;
    default:
      q = q.order("created_at", { ascending: false });
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;

  return {
    items: (data as unknown as ListRow[]).map(toListItem),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function listUserPosts(authorId: string): Promise<PostListItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as ListRow[]).map(toListItem);
}

export async function getPostDetail(id: string): Promise<PostDetail | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,author_id,title,description,created_at, users!posts_author_id_fkey(username), post_files(*)",
    )
    .eq("id", id)
    .order("position", { referencedTable: "post_files", ascending: true })
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    author_id: string;
    title: string;
    description: string;
    created_at: string;
    users: { username: string } | null;
    post_files: PostFile[];
  };

  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    description: row.description,
    created_at: row.created_at,
    author_username: row.users?.username ?? "unknown",
    files: row.post_files ?? [],
  };
}
