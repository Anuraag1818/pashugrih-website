import { getSiteContent, saveSiteContent, type SiteContent } from "../../../lib/content";
import { assertSameOrigin, getAdminUser } from "../../../lib/auth";

export async function GET() {
  return Response.json({ content: await getSiteContent() });
}

export async function PUT(request: Request) {
  const user = await getAdminUser();
  if (!user) return Response.json({ error: "Admin access is required to update the website." }, { status: 401 });
  try {
    assertSameOrigin(request);
    const payload = await request.json() as SiteContent;
    return Response.json({ content: await saveSiteContent(payload) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save changes." }, { status: 400 });
  }
}
