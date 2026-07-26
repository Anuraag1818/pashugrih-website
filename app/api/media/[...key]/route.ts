import { getStore } from "@netlify/blobs";

const safeContentTypes = new Set(["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"]);

export async function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const store = getStore({ name: "pashugrih-media", consistency: "strong" });
  const entry = await store.getWithMetadata(key.join("/"), { type: "blob", consistency: "strong" });
  if (!entry) return new Response("Image not found", { status: 404 });
  const storedType = typeof entry.metadata.contentType === "string" ? entry.metadata.contentType : "";
  const contentType = safeContentTypes.has(storedType) ? storedType : "application/octet-stream";
  const baseHeaders: Record<string, string> = {
    "content-type": contentType,
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
    "cross-origin-resource-policy": "same-origin",
    "content-security-policy": "default-src 'none'; media-src 'self'; img-src 'self'",
    "content-disposition": "inline",
    "accept-ranges": "bytes",
    ...(entry.etag ? { etag: entry.etag } : {}),
  };
  const range = request.headers.get("range");
  if (range && contentType.startsWith("video/")) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const size = entry.data.size;
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      if (start >= 0 && start <= end && end < size) {
        const partial = entry.data.slice(start, end + 1, contentType);
        return new Response(partial, { status: 206, headers: { ...baseHeaders, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(partial.size) } });
      }
    }
    return new Response(null, { status: 416, headers: { ...baseHeaders, "content-range": `bytes */${entry.data.size}` } });
  }
  return new Response(entry.data, { headers: { ...baseHeaders, "content-length": String(entry.data.size) } });
}
