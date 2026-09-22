"use client";

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
  return (
    <div className="border rounded divide-y">
      {template.sections.map((section) => (
        <details key={section.id} className="px-3 py-2" open={false}>
          <summary className="cursor-pointer font-medium">
            {section.name}{" "}
            <span className="text-slate-400 font-normal">({section.items.length} items)</span>
          </summary>

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
        </details>
      ))}
    </div>
  );
}
