import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("large public and Admin images use responsive or thumbnail-sized delivery", async () => {
  const [site, carousel, editor, mediaUrl] = await Promise.all([
    readFile(new URL("app/components/PashugrihSite.tsx", root), "utf8"),
    readFile(new URL("app/components/CattleMediaCarousel.tsx", root), "utf8"),
    readFile(new URL("app/admin/AdminEditor.tsx", root), "utf8"),
    readFile(new URL("lib/media-url.ts", root), "utf8"),
  ]);

  assert.match(mediaUrl, /\.netlify\/images/);
  assert.match(mediaUrl, /q: String\(options\.quality/);
  assert.match(site, /responsiveImageSrcSet\(slide, \[640, 960, 1280, 1600\]/);
  assert.match(site, /responsiveImageSrcSet\(supplement\.imageUrl/);
  assert.match(carousel, /\[360, 540, 720, 960\]/);
  assert.match(editor, /width: 420, height: 315/);
  assert.match(editor, /quality: 58/);
});

test("cattle videos load only after a visitor explicitly requests playback", async () => {
  const [carousel, editor] = await Promise.all([
    readFile(new URL("app/components/CattleMediaCarousel.tsx", root), "utf8"),
    readFile(new URL("app/admin/AdminEditor.tsx", root), "utf8"),
  ]);

  assert.match(carousel, /controls playsInline preload="none"/);
  assert.doesNotMatch(carousel, /autoPlay|setInterval|\.play\(\)/);
  assert.match(editor, /controls preload="none"/);
});
