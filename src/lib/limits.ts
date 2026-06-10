// Shared limits — safe to import from both server and client code.
// Keep these in sync with the CHECK constraints / RPC guards in supabase/schema.sql.

export const MAX_FILES = 10;
export const MAX_FILE_CHARS = 100_000;
export const MAX_TITLE = 120;
export const MIN_TITLE = 3;
export const MAX_DESCRIPTION = 5000;
export const MAX_FILE_NAME = 120;
export const MAX_FILE_NOTE = 500;

export const BROWSE_PAGE_SIZE = 20;

export const SORT_OPTIONS = ["newest", "oldest", "title"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const FILES_FILTERS = ["any", "single", "multiple"] as const;
export type FilesFilter = (typeof FILES_FILTERS)[number];

// File types accepted by the upload control.
export const ACCEPTED_UPLOAD =
  ".py,.pyw,.pyi,.txt,.md,.json,.cfg,.ini,.yaml,.yml,.toml,text/plain";
