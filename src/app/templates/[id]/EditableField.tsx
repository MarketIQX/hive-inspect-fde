"use client";

import { useState } from "react";

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

export function EditableField({
  initialValue,
  onSave,
  multiline = false,
  testId,
}: {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  multiline?: boolean;
  testId?: string;
}) {
  const [savedValue, setSavedValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setError(null);
    try {
      await onSave(value);
      setSavedValue(value);
      setStatus("saved");
    } catch {
      // Keep the draft on failure - do not discard or revert it.
      setStatus("error");
      setError("Save failed. Your edit is kept; try again.");
    }
  }

  const isDirty = value !== savedValue;
  const Field = multiline ? "textarea" : "input";

  return (
    <div className="space-y-1" data-testid={testId}>
      <Field
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus(e.target.value === savedValue ? "idle" : "dirty");
        }}
        rows={multiline ? 4 : undefined}
        className="w-full border rounded px-2 py-1 text-sm font-mono"
      />
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || status === "saving"}
          className="border rounded px-2 py-0.5 disabled:opacity-40"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "dirty" && <span className="text-amber-600">Unsaved changes</span>}
        {status === "saved" && <span className="text-green-600">Saved</span>}
        {status === "error" && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  );
}
