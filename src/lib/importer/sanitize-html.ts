import sanitizeHtml from "sanitize-html";

// Render-time-only sanitization. Never mutates the stored comments.rawText;
// callers must always keep the raw value and re-sanitize on every render.
// Allowlist grounded in SOURCE_CONTRACT.md: tags actually observed in
// Export A (p, a, strong, div; CS-0023) plus common equivalents a
// representative rich-text editor round trip may introduce.

const ALLOWED_TAGS = ["p", "a", "strong", "div", "b", "i", "em", "ul", "ol", "li", "br"];

export function sanitizeCommentHtml(raw: string | null): string {
  if (!raw) return "";
  return sanitizeHtml(raw, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}
