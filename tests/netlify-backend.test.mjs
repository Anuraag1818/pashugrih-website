import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses Netlify Database, persistent public caching, Blobs and role-protected writes", async () => {
  const [page, content, contentCache, contentRoute, uploadRoute, mediaRoute, auth, config, editor, carousel, mediaUrl] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("lib/content.ts", root), "utf8"),
    readFile(new URL("lib/content-cache.ts", root), "utf8"),
    readFile(new URL("app/api/content/route.ts", root), "utf8"),
    readFile(new URL("app/api/upload/route.ts", root), "utf8"),
    readFile(new URL("app/api/media/[...key]/route.ts", root), "utf8"),
    readFile(new URL("lib/auth.ts", root), "utf8"),
    readFile(new URL("netlify.toml", root), "utf8"),
    readFile(new URL("app/admin/AdminEditor.tsx", root), "utf8"),
    readFile(new URL("app/components/CattleMediaCarousel.tsx", root), "utf8"),
    readFile(new URL("lib/media-url.ts", root), "utf8"),
  ]);
  assert.match(content, /drizzle-orm/);
  assert.match(content, /NETLIFY_DB_URL/);
  assert.match(content, /unstable_cache/);
  assert.match(content, /getFreshSiteContent/);
  assert.match(content, /revalidateTag\(tag, \{ expire: 0 \}\)/);
  assert.match(content, /revalidatePath\("\/"\)/);
  assert.match(contentCache, /SITE_CONTENT_CACHE_TAG = "site-content"/);
  assert.match(contentCache, /SITE_CONTENT_REVALIDATE_SECONDS = false/);
  assert.match(page, /export const revalidate = false/);
  assert.doesNotMatch(page, /force-dynamic|no-store/);
  const readOnlyBlock = content.slice(content.indexOf("async function readSiteContentFromDatabase"), content.indexOf("const readCachedSiteContent"));
  assert.doesNotMatch(readOnlyBlock, /\.insert\(|\.update\(|\.delete\(/);
  assert.match(contentRoute, /getAdminUser/);
  assert.match(contentRoute, /assertSameOrigin/);
  assert.match(uploadRoute, /getStore/);
  assert.match(uploadRoute, /8 \* 1024 \* 1024/);
  assert.match(uploadRoute, /40 \* 1024 \* 1024/);
  assert.match(uploadRoute, /video\/mp4/);
  assert.match(uploadRoute, /crypto\.subtle\.digest\("SHA-256"/);
  assert.doesNotMatch(uploadRoute, /crypto\.randomUUID/);
  assert.match(mediaRoute, /pashugrih-media/);
  assert.match(mediaRoute, /content-range/);
  assert.match(auth, /roles\?\.includes\("admin"\)/);
  assert.match(config, /pnpm run build/);
  assert.match(config, /for = "\/assets\/\*"/);
  assert.match(config, /for = "\/media\/\*"/);
  assert.match(config, /max-age=31536000, immutable/);
  assert.match(mediaUrl, /\/\.netlify\/images\?/);
  assert.match(mediaUrl, /URLSearchParams/);
  assert.match(carousel, /const activeItem = media\[safeActive\]/);
  assert.doesNotMatch(carousel, /setInterval|preload="metadata"|\.play\(\)/);
  assert.match(carousel, /preload="none"/);
  assert.match(editor, /existingUrls\.has\(media\.url\)/);
  assert.match(editor, /duplicate.*skipped/);
  assert.match(editor, /preload="none"/);
});

test("public render has no polling or duplicate content request", async () => {
  const [page, site, carousel] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/components/PashugrihSite.tsx", root), "utf8"),
    readFile(new URL("app/components/CattleMediaCarousel.tsx", root), "utf8"),
  ]);
  assert.equal((page.match(/getSiteContent\(\)/g) ?? []).length, 1);
  assert.doesNotMatch(`${page}\n${site}\n${carousel}`, /fetch\(|setInterval\([^)]*fetch|router\.refresh/);
});

test("Admin stays dynamic, fresh and exact-role protected", async () => {
  const [adminPage, editor, auth, contentRoute, uploadRoute] = await Promise.all([
    readFile(new URL("app/admin/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/AdminEditor.tsx", root), "utf8"),
    readFile(new URL("lib/auth.ts", root), "utf8"),
    readFile(new URL("app/api/content/route.ts", root), "utf8"),
    readFile(new URL("app/api/upload/route.ts", root), "utf8"),
  ]);
  assert.match(adminPage, /dynamic = "force-dynamic"/);
  assert.match(adminPage, /getFreshSiteContent/);
  assert.match(adminPage, /if \(!user\) redirect\("\/admin\/login"\)/);
  assert.match(adminPage, /if \(!isAdmin\(user\)\)/);
  assert.match(auth, /user\.role === "admin"/);
  assert.match(auth, /user\.roles\?\.includes\("admin"\)/);
  for (const route of [contentRoute, uploadRoute]) {
    assert.match(route, /getAdminUser/);
    assert.match(route, /status: 401/);
    assert.ok(route.indexOf("getAdminUser()") < route.indexOf("request."));
  }
  assert.match(editor, /\+ Add cattle box/);
  assert.match(editor, /\+ Add breed section/);
  assert.match(editor, /Show price publicly/);
  assert.match(editor, /Upload media/);
  assert.match(editor, /Move media earlier/);
  assert.match(editor, /\+ Add supplement/);
  assert.match(editor, /Show supplement section on website/);
  assert.match(editor, /beforeunload/);
  assert.match(editor, /activeUploads/);
});

test("ships a PostgreSQL migration and invite-capable Admin login", async () => {
  const [migration, login, callback] = await Promise.all([
    readFile(new URL("netlify/database/migrations/20260724071421_remarkable_pepper_potts/migration.sql", root), "utf8"),
    readFile(new URL("app/admin/login/AdminLoginForm.tsx", root), "utf8"),
    readFile(new URL("app/AuthCallback.tsx", root), "utf8"),
  ]);
  assert.match(migration, /CREATE TABLE "site_content"/);
  assert.doesNotMatch(migration, /DROP\s+TABLE|TRUNCATE|DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+/i);
  assert.match(login, /requestPasswordRecovery/);
  assert.match(callback, /accept-invite/);
});
