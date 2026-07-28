import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the breed-wise catalogue, exact inventory and contact controls", async () => {
  const [content, site, carousel] = await Promise.all([
    readFile(new URL("lib/content-model.ts", root), "utf8"),
    readFile(new URL("app/components/PashugrihSite.tsx", root), "utf8"),
    readFile(new URL("app/components/CattleMediaCarousel.tsx", root), "utf8"),
  ]);
  for (const breed of ["Holstein Friesian", "Sahiwal", "Gir", "Jersey"]) {
    assert.match(content, new RegExp(breed.replace(/[()]/g, "\\$&")));
  }
  assert.doesNotMatch(content, /Holstein Friesian \(HF\)/);
  assert.match(site, /\$\{listing\.hindiName\} — \$\{listing\.englishName\}/);
  assert.match(site, /WhatsApp पर जानकारी लें/);
  assert.match(site, /हमारी पशु नस्लें/);
  assert.match(content, /919942936647/);
  assert.match(content, /₹75,000/);
  assert.match(content, /\+919942936647/);
  assert.match(site, /tel:\$\{initialContent\.clickToCall\}/);
  assert.match(site, /FaWhatsapp/);
  assert.match(carousel, /3000/);
  assert.match(carousel, /muted loop playsInline/);
  assert.match(carousel, /video\.pause\(\)/);
  assert.match(carousel, /onTouchStart/);
  assert.doesNotMatch(site, /fetch\(/);
  assert.doesNotMatch(carousel, /fetch\(/);
  assert.match(site, /अभी उपलब्ध नहीं/);
  assert.match(site, /initialContent\.supplementsEnabled/);
});

test("bundles the supplied Holstein Friesian 1 media in web formats", async () => {
  const files = [
    ...[1, 2, 3, 4, 5, 6].map((number) => `public/media/holstein-friesian-1/photo-${number}.webp`),
    "public/media/holstein-friesian-1/video-1.mp4",
  ];
  const sizes = await Promise.all(files.map(async (file) => (await stat(new URL(file, root))).size));
  assert.equal(sizes.length, 7);
  assert.ok(sizes.every((size) => size > 100_000));
});
