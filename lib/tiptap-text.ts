type TiptapNode = {
  type?: string;
  text?: string;
  content?: TiptapNode[];
};

function extractText(nodes: TiptapNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return node.text ?? "";
      }

      if (!node.content?.length) {
        return "";
      }

      return extractText(node.content);
    })
    .join(" ");
}

export function extractPlainTextFromTiptapJson(value: string | object) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const nodes = Array.isArray((parsed as { content?: unknown })?.content)
      ? ((parsed as { content: TiptapNode[] }).content ?? [])
      : [];

    return extractText(nodes).replace(/\s+/g, " ").trim();
  } catch {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  }
}
