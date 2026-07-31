import { getStore } from "@netlify/blobs";
import { assertSameOrigin, getAdminUser } from "../../../lib/auth";

const allowedTypes: Record<string, { extension: string; type: "image" | "video"; maxSize: number }> = {
  "image/png": { extension: "png", type: "image", maxSize: 8 * 1024 * 1024 },
  "image/jpeg": { extension: "jpg", type: "image", maxSize: 8 * 1024 * 1024 },
  "image/webp": { extension: "webp", type: "image", maxSize: 8 * 1024 * 1024 },
  "video/mp4": { extension: "mp4", type: "video", maxSize: 40 * 1024 * 1024 },
  "video/webm": { extension: "webm", type: "video", maxSize: 40 * 1024 * 1024 },
};

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Admin access is required to upload images." }, { status: 401 });
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const file = form.get("file") ?? form.get("image");
    if (!(file instanceof File)) return Response.json({ error: "Choose a media file to upload." }, { status: 400 });
    const rule = allowedTypes[file.type];
    if (!rule) return Response.json({ error: "Use JPG, JPEG, PNG, WebP, MP4 or WebM media." }, { status: 400 });
    if (file.size > rule.maxSize) return Response.json({ error: rule.type === "video" ? "Video must be smaller than 40 MB." : "Image must be smaller than 8 MB." }, { status: 400 });
    const data = await file.arrayBuffer();
    if (!matchesFileSignature(new Uint8Array(data, 0, Math.min(data.byteLength, 16)), file.type)) return Response.json({ error: "The file contents do not match the selected media type." }, { status: 400 });
    const id = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const key = `site/${id}.${rule.extension}`;
    const store = getStore({ name: "pashugrih-media", consistency: "strong" });
    await store.set(key, data, {
      metadata: { contentType: file.type, originalName: file.name.slice(0, 180), mediaType: rule.type, uploadedBy: user.email ?? user.id, uploadedAt: new Date().toISOString() },
    });
    return Response.json({ id, url: `/api/media/${key}`, type: rule.type, mimeType: file.type }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 400 });
  }
}

function matchesFileSignature(bytes: Uint8Array, mimeType: string): boolean {
  const ascii = String.fromCharCode(...bytes);
  if (mimeType === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/webp") return ascii.slice(0, 4) === "RIFF" && ascii.slice(8, 12) === "WEBP";
  if (mimeType === "video/mp4") return ascii.slice(4, 8) === "ftyp";
  if (mimeType === "video/webm") return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  return false;
}
