import "server-only";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getDb } from "../db";
import { siteContent } from "../db/schema";
import { defaultContent, normalizeContent, validateContentForSave, type SiteContent } from "./content-model";
import { createPublicContentLoader, persistAndInvalidateContent } from "./content-cache";

export * from "./content-model";

async function readSiteContentFromDatabase(): Promise<SiteContent> {
  if (!process.env.NETLIFY_DB_URL) return defaultContent;
  try {
    const db = getDb();
    const [row] = await db.select({ data: siteContent.data }).from(siteContent).where(eq(siteContent.id, 1)).limit(1);
    if (!row?.data) return defaultContent;
    const stored = JSON.parse(row.data) as Partial<SiteContent> & Record<string, unknown>;
    return normalizeContent(stored);
  } catch (error) {
    console.error("Could not read Pashuगृह content from Netlify Database.", error);
    return defaultContent;
  }
}

const readCachedSiteContent = createPublicContentLoader(readSiteContentFromDatabase, unstable_cache);

export function getSiteContent(): Promise<SiteContent> {
  return readCachedSiteContent();
}

export function getFreshSiteContent(): Promise<SiteContent> {
  return readSiteContentFromDatabase();
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  if (!process.env.NETLIFY_DB_URL) throw new Error("Netlify Database is not enabled. Enable it in the Netlify dashboard, then redeploy.");
  const normalized = normalizeContent(content as SiteContent & Record<string, unknown>);
  validateContentForSave(normalized);
  return persistAndInvalidateContent(async () => {
    const db = getDb();
    await db
      .insert(siteContent)
      .values({ id: 1, data: JSON.stringify(normalized), updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteContent.id, set: { data: JSON.stringify(normalized), updatedAt: new Date() } });
    return normalized;
  }, (tag) => {
    revalidateTag(tag, { expire: 0 });
    revalidatePath("/");
  });
}
