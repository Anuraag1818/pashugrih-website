import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("ships the Pashuगृह public catalogue and exact breed enquiry", async () => {
  const [content, site] = await Promise.all([
    readFile(new URL("lib/content.ts", root), "utf8"),
    readFile(new URL("app/components/PashugrihSite.tsx", root), "utf8"),
  ]);
  for (const breed of ["Sahiwal", "Gir", "Holstein Friesian (HF)", "Jersey"]) {
    assert.match(content, new RegExp(breed.replace(/[()]/g, "\\$&")));
  }
  assert.match(site, /मुझे Pashuगृह वेबसाइट पर उपलब्ध \$\{breed\} नस्ल के पशु में रुचि है/);
  assert.match(site, /WhatsApp पर जानकारी लें/);
  assert.match(site, /हमारी पशु नस्लें/);
  assert.match(content, /919942936647/);
  assert.match(content, /भागलपुर, बिहार एवं आसपास के जिले/);
  assert.match(site, /setInterval/);
  assert.match(site, /onTouchStart/);
  assert.match(site, /अभी उपलब्ध नहीं/);
});
