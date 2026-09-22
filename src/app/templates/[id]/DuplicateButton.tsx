"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DuplicateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/templates/${templateId}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { templateId: newId } = await res.json();
      router.push(`/templates/${newId}`);
    } catch {
      setError("Duplicate failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={busy}
        className="border rounded px-3 py-1 text-sm disabled:opacity-50"
      >
        {busy ? "Duplicating…" : "Duplicate template"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
