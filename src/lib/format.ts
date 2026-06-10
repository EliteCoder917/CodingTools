export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function snippetPreview(code: string, lines = 6): string {
  return code.split("\n").slice(0, lines).join("\n");
}
