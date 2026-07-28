import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses Netlify Database, Blobs and role-protected writes", async () => {
  const [content, contentCache, contentRoute, uploadRoute, mediaRoute, auth, config] = await Promise.all([
    readFile(new URL("lib/content.ts", root), "utf8"),
    readFile(new URL("lib/content-cache.ts", root), "utf8"),
    readFile(new URL("app/api/content/route.ts", root), "utf8"),
    readFile(new URL("app/api/upload/route.ts", root), "utf8"),
    readFile(new URL("app/api/media/[...key]/route.ts", root), "utf8"),
    readFile(new URL("lib/auth.ts", root), "utf8"),
    readFile(new URL("netlify.toml", root), "utf8"),
  ]);
  assert.match(content, /drizzle-orm/);
  assert.match(content, /NETLIFY_DB_URL/);
  assert.match(content, /unstable_cache/);
  assert.match(content, /getFreshSiteContent/);
  assert.match(content, /revalidateTag\(tag, \{ expire: 0 \}\)/);
  assert.match(content, /revalidatePath\("\/"\)/);
  assert.match(contentCache, /SITE_CONTENT_CACHE_TAG = "site-content"/);
  assert.match(contentCache, /60 \* 60/);
  const readOnlyBlock = content.slice(content.indexOf("async function readSiteContentFromDatabase"), content.indexOf("const readCachedSiteContent"));
  assert.doesNotMatch(readOnlyBlock, /\.insert\(|\.update\(|\.delete\(/);
  assert.match(contentRoute, /getAdminUser/);
  assert.match(contentRoute, /assertSameOrigin/);
  assert.match(uploadRoute, /getStore/);
  assert.match(uploadRoute, /8 \* 1024 \* 1024/);
  assert.match(uploadRoute, /40 \* 1024 \* 1024/);
  assert.match(uploadRoute, /video\/mp4/);
  assert.match(mediaRoute, /pashugrih-media/);
  assert.match(mediaRoute, /content-range/);
  assert.match(auth, /roles\?\.includes\("admin"\)/);
  assert.match(config, /pnpm run build/);
});

test("Admin supports dynamic inventory, media ordering and private supplements", async () => {
  const editor = await readFile(new URL("app/admin/AdminEditor.tsx", root), "utf8");
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
  assert.doesNotMatch(migration, /DROP\s+TABLE|TRUNCATE|DELETE\s+FROM/i);
  assert.match(login, /requestPasswordRecovery/);
  assert.match(callback, /accept-invite/);
});
