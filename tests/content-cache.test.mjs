import assert from "node:assert/strict";
import test from "node:test";
import {
  SITE_CONTENT_CACHE_KEY,
  SITE_CONTENT_CACHE_TAG,
  SITE_CONTENT_REVALIDATE_SECONDS,
  createPublicContentLoader,
  persistAndInvalidateContent,
} from "../lib/content-cache.ts";

function fakeCacheController() {
  let populated = false;
  let value;
  let configuration;
  return {
    factory(callback, keyParts, options) {
      configuration = { keyParts, options };
      return async () => {
        if (!populated) {
          value = await callback();
          populated = true;
        }
        return value;
      };
    },
    clear() {
      populated = false;
    },
    configuration() {
      return configuration;
    },
  };
}

test("cold public load queries once and repeated loads reuse the cache", async () => {
  let databaseReads = 0;
  const cache = fakeCacheController();
  const loadPublicContent = createPublicContentLoader(async () => ({ revision: ++databaseReads }), cache.factory);

  assert.deepEqual(await loadPublicContent(), { revision: 1 });
  assert.deepEqual(await loadPublicContent(), { revision: 1 });
  assert.deepEqual(await loadPublicContent(), { revision: 1 });
  assert.equal(databaseReads, 1);
  assert.deepEqual(cache.configuration(), {
    keyParts: SITE_CONTENT_CACHE_KEY,
    options: { tags: [SITE_CONTENT_CACHE_TAG], revalidate: SITE_CONTENT_REVALIDATE_SECONDS },
  });
});

test("successful Admin persistence invalidates cached public content", async () => {
  let databaseReads = 0;
  let stored = { heading: "पहले" };
  const invalidatedTags = [];
  const cache = fakeCacheController();
  const loadPublicContent = createPublicContentLoader(async () => {
    databaseReads += 1;
    return { ...stored };
  }, cache.factory);

  assert.deepEqual(await loadPublicContent(), { heading: "पहले" });
  const saved = await persistAndInvalidateContent(async () => {
    stored = { heading: "अपडेट किया गया" };
    return stored;
  }, (tag) => {
    invalidatedTags.push(tag);
    cache.clear();
  });

  assert.deepEqual(saved, { heading: "अपडेट किया गया" });
  assert.deepEqual(invalidatedTags, [SITE_CONTENT_CACHE_TAG]);
  assert.deepEqual(await loadPublicContent(), { heading: "अपडेट किया गया" });
  assert.equal(databaseReads, 2);
});

test("failed persistence does not invalidate the current public cache", async () => {
  let invalidations = 0;
  await assert.rejects(
    persistAndInvalidateContent(async () => { throw new Error("database write failed"); }, () => { invalidations += 1; }),
    /database write failed/,
  );
  assert.equal(invalidations, 0);
});
