import { getStore } from "@netlify/blobs";
import { assertSameOrigin, getAdminUser } from "../../../lib/auth";

const allowedTypes: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Admin access is required to upload images." }, { status: 401 });
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    const extension = allowedTypes[image.type];
    if (!extension) return Response.json({ error: "Use a PNG, JPG or WebP image." }, { status: 400 });
    if (image.size > 8 * 1024 * 1024) return Response.json({ error: "Image must be smaller than 8 MB." }, { status: 400 });
    const key = `site/${crypto.randomUUID()}.${extension}`;
    const store = getStore({ name: "pashugrih-media", consistency: "strong" });
    await store.set(key, await image.arrayBuffer(), {
      metadata: { contentType: image.type, uploadedBy: user.email ?? user.id, uploadedAt: new Date().toISOString() },
    });
    return Response.json({ url: `/api/media/${key}` }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Image upload failed." }, { status: 400 });
  }
}
