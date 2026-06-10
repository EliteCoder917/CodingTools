import {
  MAX_DESCRIPTION,
  MAX_FILE_CHARS,
  MAX_FILE_NAME,
  MAX_FILE_NOTE,
  MAX_FILES,
  MAX_TITLE,
  MIN_TITLE,
} from "./limits";
import type { PostFileInput } from "./db";

export type ValidatedPost = {
  title: string;
  description: string;
  files: PostFileInput[];
};

type Result =
  | { ok: true; value: ValidatedPost }
  | { ok: false; error: string };

// Validates and normalizes a create/update payload. Mirrors the DB-level
// CHECK constraints so users get a friendly 400 instead of a raw DB error.
export function validatePostPayload(body: unknown): Result {
  const { title, description, files } = (body ?? {}) as {
    title?: unknown;
    description?: unknown;
    files?: unknown;
  };

  if (typeof title !== "string") {
    return { ok: false, error: "Title is required." };
  }
  const cleanTitle = title.trim();
  if (cleanTitle.length < MIN_TITLE || cleanTitle.length > MAX_TITLE) {
    return { ok: false, error: `Title must be ${MIN_TITLE}–${MAX_TITLE} characters.` };
  }

  const cleanDescription =
    typeof description === "string" ? description.trim() : "";
  if (cleanDescription.length > MAX_DESCRIPTION) {
    return { ok: false, error: `Description is too long (${MAX_DESCRIPTION} char max).` };
  }

  if (!Array.isArray(files) || files.length < 1) {
    return { ok: false, error: "Add at least one Python file." };
  }
  if (files.length > MAX_FILES) {
    return { ok: false, error: `Too many files (max ${MAX_FILES}).` };
  }

  const cleanFiles: PostFileInput[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i] as { name?: unknown; note?: unknown; content?: unknown };

    const content = typeof f.content === "string" ? f.content : "";
    if (content.trim().length === 0) {
      return { ok: false, error: `File ${i + 1} has no code.` };
    }
    if (content.length > MAX_FILE_CHARS) {
      return { ok: false, error: `File ${i + 1} is too long (${MAX_FILE_CHARS} char max).` };
    }

    const name =
      (typeof f.name === "string" ? f.name.trim() : "") || `script_${i + 1}.py`;
    if (name.length > MAX_FILE_NAME) {
      return { ok: false, error: `File ${i + 1} name is too long.` };
    }

    const note = typeof f.note === "string" ? f.note.trim() : "";
    if (note.length > MAX_FILE_NOTE) {
      return { ok: false, error: `File ${i + 1} subtitle is too long.` };
    }

    cleanFiles.push({ name, note, content });
  }

  return {
    ok: true,
    value: { title: cleanTitle, description: cleanDescription, files: cleanFiles },
  };
}
