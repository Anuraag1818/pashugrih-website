import assert from "node:assert/strict";
import test from "node:test";
import { HOLSTEIN_FRIESIAN_1_MEDIA, normalizeContent, validateContentForSave } from "../lib/content-model.ts";

const legacy = {
  contentVersion: 3,
  brand: "Pashuगृह",
  logo: "/uploaded/logo.png",
  whatsapp: "919942936647",
  hero: {
    eyebrow: "पुराना छोटा शीर्षक",
    heading: "पुराना मुख्य शीर्षक",
    accent: "पुराना रंगीन शीर्षक",
    description: "पुराना विवरण",
    location: "भागलपुर",
    delivery: "डिलीवरी उपलब्ध",
  },
  slides: ["/uploaded/one.jpg", "/uploaded/two.jpg", "/uploaded/three.jpg"],
  breeds: [{ id: "hf", name: "Holstein Friesian (HF)", image: "/fake.jpg", available: true }],
};

test("migrates legacy fixed cards once without assigning old media", () => {
  const migrated = normalizeContent(legacy);
  assert.equal(migrated.contentVersion, 5);
  assert.deepEqual(migrated.breeds.map((breed) => breed.id), ["holstein-friesian", "sahiwal", "gir", "jersey"]);
  assert.ok(migrated.breeds.every((breed) => breed.listings.length === 3));
  const listings = migrated.breeds.flatMap((breed) => breed.listings);
  assert.deepEqual(listings.filter((listing) => listing.available).map((listing) => listing.id), ["holstein-friesian-1"]);
  assert.equal(listings.find((listing) => listing.id === "holstein-friesian-1")?.price, "₹75,000");
  assert.deepEqual(listings.find((listing) => listing.id === "holstein-friesian-1")?.media, HOLSTEIN_FRIESIAN_1_MEDIA);
  assert.ok(listings.filter((listing) => listing.id !== "holstein-friesian-1").every((listing) => !listing.price && !listing.showPricePublicly && listing.media.length === 0));
  assert.ok(listings.filter((listing) => listing.id !== "holstein-friesian-1").every((listing) => listing.media.length === 0));
  assert.equal(migrated.logo, "/uploaded/logo.png");
  assert.deepEqual(migrated.slides, legacy.slides);
  assert.equal(migrated.hero.heading, "पुराना मुख्य शीर्षक");
  assert.equal(migrated.supplementsEnabled, false);
  assert.equal(migrated.supplements.length, 2);
});

test("v4 to v5 seeds supplied Holstein media without losing existing edits", () => {
  const v4 = normalizeContent({ contentVersion: 3 });
  v4.contentVersion = 4;
  const holstein = v4.breeds.find((breed) => breed.id === "holstein-friesian");
  holstein.hindiName = "संपादित नाम";
  holstein.listings[0].price = "₹77,000";
  holstein.listings[0].media = [];
  v4.breeds.find((breed) => breed.id === "jersey").listings.splice(1, 1);

  const migrated = normalizeContent(v4);
  assert.equal(migrated.contentVersion, 5);
  assert.equal(migrated.breeds.find((breed) => breed.id === "holstein-friesian").hindiName, "संपादित नाम");
  assert.equal(migrated.breeds.find((breed) => breed.id === "holstein-friesian").listings[0].price, "₹77,000");
  assert.deepEqual(migrated.breeds.find((breed) => breed.id === "holstein-friesian").listings[0].media, HOLSTEIN_FRIESIAN_1_MEDIA);
  assert.equal(migrated.breeds.find((breed) => breed.id === "jersey").listings.length, 2);
});

test("normalization is idempotent and preserves later Admin edits and deletions", () => {
  const migrated = normalizeContent(legacy);
  migrated.breeds[0].hindiName = "संपादित नाम";
  migrated.breeds[0].listings = migrated.breeds[0].listings.slice(0, 2);
  migrated.breeds.push({ id: "custom-tharparkar", hindiName: "थारपारकर", englishName: "Tharparkar", protectedDefaultBreed: false, listings: [] });
  migrated.supplements[0].price = "₹499";
  const once = normalizeContent(migrated);
  const twice = normalizeContent(once);
  assert.deepEqual(twice, once);
  assert.equal(once.breeds[0].hindiName, "संपादित नाम");
  assert.equal(once.breeds[0].listings.length, 2);
  assert.ok(once.breeds.some((breed) => breed.id === "custom-tharparkar"));
  assert.equal(once.supplements[0].price, "₹499");
});

test("prevents enabling incomplete supplement cards but permits private drafts", () => {
  const content = normalizeContent(legacy);
  assert.doesNotThrow(() => validateContentForSave(content));
  content.supplementsEnabled = true;
  assert.throws(() => validateContentForSave(content), /product image/);
  content.supplements.forEach((item) => { item.imageUrl = `/api/media/site/${item.id}.jpg`; });
  assert.doesNotThrow(() => validateContentForSave(content));
});
