import { getStore } from "@netlify/blobs";

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const store = getStore({ name: "pashugrih-media", consistency: "strong" });
  const entry = await store.getWithMetadata(key.join("/"), { type: "blob", consistency: "strong" });
  if (!entry) return new Response("Image not found", { status: 404 });
  const contentType = typeof entry.metadata.contentType === "string" ? entry.metadata.contentType : "application/octet-stream";
  return new Response(entry.data, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      ...(entry.etag ? { etag: entry.etag } : {}),
    },
  });
}
