"use client";

import { useState } from "react";
import { EditableField } from "./EditableField";
import type { Template } from "@/lib/types";

async function patchJson(url: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.status}`);
}

export function EditableTemplateView({ template }: { template: Template }) {
  // A template can have hundreds of comments across all sections. Mounting
  // every section's editable fields at once (each with its own React
  // state) made the page heavy to interact with. Only the expanded
  // section's fields are mounted; collapsed sections show counts only.
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set());

  function toggleSection(id: string) {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="border rounded divide-y">
      {template.sections.map((section) => {
        const isOpen = openSectionIds.has(section.id);
        return (
          <details
            key={section.id}
            className="px-3 py-2"
            open={isOpen}
            onToggle={(e) => {
              if (e.currentTarget.open !== isOpen) toggleSection(section.id);
            }}
          >
            <summary className="cursor-pointer font-medium">
              {section.name}{" "}
              <span className="text-slate-400 font-normal">({section.items.length} items)</span>
            </summary>

            {isOpen && (
              <>
                <div className="mt-2 mb-3">
                  <label className="text-xs text-slate-500">Section name</label>
                  <EditableField
                    initialValue={section.name}
                    onSave={(v) => patchJson(`/api/sections/${section.id}`, { name: v })}
                    testId={`section-name-${section.id}`}
                  />
                </div>

                <ul className="ml-4 space-y-4">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <div className="font-medium text-sm mb-1">
                        {item.name}{" "}
                        <span className="text-slate-400 font-normal">
                          ({item.comments.length} comments)
                        </span>
                      </div>
                      <div className="mb-2">
                        <label className="text-xs text-slate-500">Item name</label>
                        <EditableField
                          initialValue={item.name}
                          onSave={(v) => patchJson(`/api/items/${item.id}`, { name: v })}
                          testId={`item-name-${item.id}`}
                        />
                      </div>
                      <ul className="ml-4 space-y-3">
                        {item.comments.map((c) => (
                          <li key={c.id}>
                            <div className="text-sm text-slate-700">{c.name}</div>
                            <label className="text-xs text-slate-500">Comment text</label>
                            <EditableField
                              initialValue={c.rawText ?? ""}
                              onSave={(v) => patchJson(`/api/comments/${c.id}`, { rawText: v })}
                              multiline
                              testId={`comment-text-${c.id}`}
                            />
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </details>
        );
      })}
    </div>
  );
}
