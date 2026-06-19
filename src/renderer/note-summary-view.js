(function exposeNoteSummaryView(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.noteSummaryView = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderStructuredSummaryHtml(summary) {
    const blocks = String(summary || "")
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);

    const html = [];
    let pendingListItems = [];

    function flushList() {
      if (pendingListItems.length === 0) return;
      html.push(`<ul class="note-summary-list">${pendingListItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
      pendingListItems = [];
    }

    for (const block of blocks) {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const bulletItems = lines
        .map((line) => line.match(/^[-*•]\s+(.+)$/)?.[1]?.trim())
        .filter(Boolean);

      if (bulletItems.length === lines.length && bulletItems.length > 0) {
        pendingListItems.push(...bulletItems);
        continue;
      }

      flushList();
      html.push(`<p class="note-summary-paragraph">${escapeHtml(lines.join(" "))}</p>`);
    }

    flushList();
    return html.join("");
  }

  return { renderStructuredSummaryHtml };
});
