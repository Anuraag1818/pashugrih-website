import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses Netlify Database, Blobs and role-protected writes", async () => {
  const [content, contentRoute, uploadRoute, mediaRoute, auth, config] = await Promise.all([
    readFile(new URL("lib/content.ts", root), "utf8"),
    readFile(new URL("app/api/content/route.ts", root), "utf8"),
    readFile(new URL("app/api/upload/route.ts", root), "utf8"),
    readFile(new URL("app/api/media/[...key]/route.ts", root), "utf8"),
    readFile(new URL("lib/auth.ts", root), "utf8"),
    readFile(new URL("netlify.toml", root), "utf8"),
  ]);
  assert.match(content, /drizzle-orm/);
  assert.match(content, /NETLIFY_DB_URL/);
  assert.match(contentRoute, /getAdminUser/);
  assert.match(contentRoute, /assertSameOrigin/);
  assert.match(uploadRoute, /getStore/);
  assert.match(uploadRoute, /8 \* 1024 \* 1024/);
  assert.match(mediaRoute, /pashugrih-media/);
  assert.match(auth, /roles\?\.includes\("admin"\)/);
  assert.match(config, /pnpm run build/);
});

test("ships a PostgreSQL migration and invite-capable Admin login", async () => {
  const [migration, login, callback] = await Promise.all([
    readFile(new URL("netlify/database/migrations/20260724071421_remarkable_pepper_potts/migration.sql", root), "utf8"),
    readFile(new URL("app/admin/login/AdminLoginForm.tsx", root), "utf8"),
    readFile(new URL("app/AuthCallback.tsx", root), "utf8"),
  ]);
  assert.match(migration, /CREATE TABLE "site_content"/);
  assert.match(login, /requestPasswordRecovery/);
  assert.match(callback, /accept-invite/);
});
