"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";

hljs.registerLanguage("python", python);

export function CodeBlock({
  code,
  filename = "python",
}: {
  code: string;
  filename?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute("data-highlighted");
      hljs.highlightElement(ref.current);
    }
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-ink-950/80">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-blood-600/80" />
          <span className="h-3 w-3 rounded-full bg-blood-500/40" />
          <span className="h-3 w-3 rounded-full bg-blood-400/20" />
          <span className="ml-2 font-mono text-xs text-zinc-500">{filename}</span>
        </div>
        <button onClick={copy} className="btn-ghost px-2 py-1 text-xs">
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[70vh] overflow-auto p-4 text-sm leading-relaxed">
        <code ref={ref} className="language-python font-mono">
          {code}
        </code>
      </pre>
    </div>
  );
}
