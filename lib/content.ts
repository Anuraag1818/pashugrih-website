import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { siteContent } from "../db/schema";
import { CONTENT_VERSION, defaultContent, normalizeContent, validateContentForSave, type SiteContent } from "./content-model";

export * from "./content-model";

export async function getSiteContent(): Promise<SiteContent> {
  if (!process.env.NETLIFY_DB_URL) return defaultContent;
  try {
    const db = getDb();
    const [row] = await db.select({ data: siteContent.data }).from(siteContent).where(eq(siteContent.id, 1)).limit(1);
    if (!row?.data) {
      await db.insert(siteContent).values({ id: 1, data: JSON.stringify(defaultContent) }).onConflictDoNothing();
      return defaultContent;
    }
    const stored = JSON.parse(row.data) as Partial<SiteContent> & Record<string, unknown>;
    const normalized = normalizeContent(stored);
    if (stored.contentVersion !== CONTENT_VERSION || JSON.stringify(stored) !== JSON.stringify(normalized)) {
      await db.update(siteContent).set({ data: JSON.stringify(normalized), updatedAt: new Date() }).where(eq(siteContent.id, 1));
    }
    return normalized;
  } catch (error) {
    console.error("Could not read Pashuगृह content from Netlify Database.", error);
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  if (!process.env.NETLIFY_DB_URL) throw new Error("Netlify Database is not enabled. Enable it in the Netlify dashboard, then redeploy.");
  const normalized = normalizeContent(content as SiteContent & Record<string, unknown>);
  validateContentForSave(normalized);
  const db = getDb();
  await db
    .insert(siteContent)
    .values({ id: 1, data: JSON.stringify(normalized), updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteContent.id, set: { data: JSON.stringify(normalized), updatedAt: new Date() } });
  return normalized;
}
