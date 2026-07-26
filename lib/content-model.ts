export type CattleMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  alt: string;
  mimeType?: string;
};

export type CattleListing = {
  id: string;
  listingNumber: number;
  hindiName: string;
  englishName: string;
  available: boolean;
  description: string;
  milkYield: string;
  feedIntake: string;
  teeth: string;
  deworming: string;
  lastCalving: string;
  age: string;
  price: string;
  showPricePublicly: boolean;
  media: CattleMedia[];
};

export type BreedGroup = {
  id: string;
  hindiName: string;
  englishName: string;
  protectedDefaultBreed: boolean;
  listings: CattleListing[];
};

export type Supplement = {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string;
  dosage: string;
  suitableFor: string;
  packSize: string;
  price: string;
  available: boolean;
  imageUrl: string;
  whatsappMessage: string;
};

export type SiteContent = {
  contentVersion: number;
  brand: string;
  logo: string;
  whatsapp: string;
  publicPhone: string;
  clickToCall: string;
  hindiAddress: string;
  englishAddress: string;
  hero: {
    eyebrow: string;
    heading: string;
    accent: string;
    description: string;
    location: string;
    delivery: string;
  };
  slides: string[];
  breeds: BreedGroup[];
  supplementsEnabled: boolean;
  supplements: Supplement[];
};

export const CONTENT_VERSION = 5;

export const HOLSTEIN_FRIESIAN_1_MEDIA: CattleMedia[] = [
  ...[1, 2, 3, 4, 5, 6].map((number) => ({
    id: `holstein-friesian-1-photo-${number}`,
    type: "image" as const,
    url: `/media/holstein-friesian-1/photo-${number}.webp`,
    alt: `Holstein Friesian 1 की फोटो ${number}`,
    mimeType: "image/webp",
  })),
  {
    id: "holstein-friesian-1-video-1",
    type: "video",
    url: "/media/holstein-friesian-1/video-1.mp4",
    alt: "Holstein Friesian 1 का वीडियो",
    mimeType: "video/mp4",
  },
];

const requiredBreedSeeds = [
  { id: "holstein-friesian", hindiName: "होल्स्टीन फ्रीजियन", englishName: "Holstein Friesian" },
  { id: "sahiwal", hindiName: "साहीवाल", englishName: "Sahiwal" },
  { id: "gir", hindiName: "गिर", englishName: "Gir" },
  { id: "jersey", hindiName: "जर्सी", englishName: "Jersey" },
] as const;

export const REQUIRED_BREED_IDS: string[] = requiredBreedSeeds.map((breed) => breed.id);

function defaultListing(breed: (typeof requiredBreedSeeds)[number], listingNumber: number): CattleListing {
  const isAvailable = breed.id === "holstein-friesian" && listingNumber === 1;
  return {
    id: `${breed.id}-${listingNumber}`,
    listingNumber,
    hindiName: `${breed.hindiName} ${listingNumber}`,
    englishName: `${breed.englishName} ${listingNumber}`,
    available: isAvailable,
    description: "",
    milkYield: isAvailable ? "16–17 लीटर/दिन" : "",
    feedIntake: isAvailable ? "4 किग्रा/दिन" : "",
    teeth: isAvailable ? "पूर्ण दाँत" : "",
    deworming: isAvailable ? "5 दिन पहले" : "",
    lastCalving: isAvailable ? "15 दिन पहले" : "",
    age: "",
    price: isAvailable ? "₹75,000" : "",
    showPricePublicly: isAvailable,
    media: isAvailable ? HOLSTEIN_FRIESIAN_1_MEDIA.map((item) => ({ ...item })) : [],
  };
}

export function createDefaultBreeds(): BreedGroup[] {
  return requiredBreedSeeds.map((breed) => ({
    ...breed,
    protectedDefaultBreed: true,
    listings: [1, 2, 3].map((number) => defaultListing(breed, number)),
  }));
}

export function createBlankListing(breed: Pick<BreedGroup, "id" | "hindiName" | "englishName">, listingNumber: number, id: string): CattleListing {
  return {
    id,
    listingNumber,
    hindiName: `${breed.hindiName || "नया पशु"} ${listingNumber}`,
    englishName: `${breed.englishName || "New cattle"} ${listingNumber}`,
    available: false,
    description: "",
    milkYield: "",
    feedIntake: "",
    teeth: "",
    deworming: "",
    lastCalving: "",
    age: "",
    price: "",
    showPricePublicly: false,
    media: [],
  };
}

export function createDefaultSupplements(): Supplement[] {
  return [
    {
      id: "mineral-mixture",
      name: "मिनरल मिक्सचर",
      category: "दैनिक पोषण",
      description: "पशुओं की दैनिक खनिज आवश्यकताओं को पूरा करने और स्वास्थ्य, प्रजनन क्षमता तथा दूध उत्पादन में सहायता करने वाला संतुलित मिनरल मिक्सचर।",
      benefits: "बेहतर स्वास्थ्य, दूध उत्पादन में सहायता, मजबूत हड्डियाँ",
      dosage: "पशु चिकित्सक या उत्पाद के निर्देशानुसार",
      suitableFor: "गाय एवं भैंस",
      packSize: "1 किलो",
      price: "₹450",
      available: true,
      imageUrl: "",
      whatsappMessage: "नमस्ते, मुझे मिनरल मिक्सचर, 1 किलो, ₹450 के बारे में जानकारी चाहिए।",
    },
    {
      id: "calcium-supplement",
      name: "कैल्शियम सप्लीमेंट",
      category: "हड्डी एवं दूध उत्पादन",
      description: "गाय और भैंस में कैल्शियम की आवश्यकता पूरी करने, हड्डियों को मजबूत बनाने और दूध उत्पादन के दौरान पोषण सहायता देने वाला सप्लीमेंट।",
      benefits: "मजबूत हड्डियाँ, कैल्शियम सहायता, दूध देने वाले पशुओं के लिए उपयोगी",
      dosage: "पशु चिकित्सक या उत्पाद के निर्देशानुसार",
      suitableFor: "गाय एवं भैंस",
      packSize: "1 लीटर",
      price: "₹550",
      available: true,
      imageUrl: "",
      whatsappMessage: "नमस्ते, मुझे कैल्शियम सप्लीमेंट, 1 लीटर, ₹550 के बारे में जानकारी चाहिए।",
    },
  ];
}

export const defaultContent: SiteContent = {
  contentVersion: CONTENT_VERSION,
  brand: "Pashuगृह",
  logo: "/assets/pashugrih-logo.png",
  whatsapp: "919942936647",
  publicPhone: "+91 99429 36647",
  clickToCall: "+919942936647",
  hindiAddress: "जवारीपुर, तिलकामांझी, भागलपुर, बिहार",
  englishAddress: "Jawaripur, Tilkamanjhi, Bhagalpur, Bihar",
  hero: {
    eyebrow: "भागलपुर, बिहार · भरोसेमंद पशु",
    heading: "स्वस्थ पशु।",
    accent: "भरोसेमंद संबंध।",
    description: "देखभाल के साथ चुने गए स्वस्थ और अच्छी नस्ल के पशु। नवीनतम फोटो, स्वास्थ्य रिकॉर्ड, कीमत और डिलीवरी की जानकारी के लिए सीधे WhatsApp पर संपर्क करें।",
    location: "भागलपुर, बिहार एवं आसपास के जिले",
    delivery: "पशु डिलीवरी उपलब्ध",
  },
  slides: ["/assets/hero-1.png", "/assets/hero-2.png", "/assets/hero-3.png"],
  breeds: createDefaultBreeds(),
  supplementsEnabled: false,
  supplements: createDefaultSupplements(),
};

export function normalizeContent(input: Partial<SiteContent> & Record<string, unknown>): SiteContent {
  const incomingVersion = Number(input.contentVersion);
  const source = !Number.isFinite(incomingVersion) || incomingVersion < 4
    ? migrateLegacyContent(input)
    : incomingVersion === 4
      ? migrateV4Content(input)
      : input;
  const sourceBreeds = Array.isArray(source.breeds) ? source.breeds : [];
  const requiredBreeds = requiredBreedSeeds.map((seed) => {
    const candidate = sourceBreeds.find((breed) => isRecord(breed) && breed.id === seed.id);
    return normalizeBreed(candidate, { ...seed, protectedDefaultBreed: true, listings: createDefaultBreeds().find((breed) => breed.id === seed.id)!.listings });
  });
  const customBreeds = sourceBreeds
    .filter((breed) => isRecord(breed) && typeof breed.id === "string" && !REQUIRED_BREED_IDS.includes(breed.id))
    .slice(0, 30)
    .map((breed, index) => normalizeBreed(breed, {
      id: `custom-breed-${index + 1}`,
      hindiName: "नई नस्ल",
      englishName: "New Breed",
      protectedDefaultBreed: false,
      listings: [],
    }));
  const slides = Array.isArray(source.slides) ? source.slides : defaultContent.slides;
  const hero: Record<string, unknown> = isRecord(source.hero) ? source.hero : {};
  const supplements = Array.isArray(source.supplements) ? source.supplements : createDefaultSupplements();
  return {
    contentVersion: CONTENT_VERSION,
    brand: clean(source.brand, defaultContent.brand),
    logo: clean(source.logo, defaultContent.logo),
    whatsapp: clean(source.whatsapp, defaultContent.whatsapp).replace(/\D/g, "").slice(0, 15),
    publicPhone: clean(source.publicPhone, defaultContent.publicPhone),
    clickToCall: normalizePhone(source.clickToCall, defaultContent.clickToCall),
    hindiAddress: clean(source.hindiAddress, defaultContent.hindiAddress),
    englishAddress: clean(source.englishAddress, defaultContent.englishAddress),
    hero: {
      eyebrow: clean(hero.eyebrow, defaultContent.hero.eyebrow),
      heading: clean(hero.heading, defaultContent.hero.heading),
      accent: clean(hero.accent, defaultContent.hero.accent),
      description: clean(hero.description, defaultContent.hero.description),
      location: clean(hero.location, defaultContent.hero.location),
      delivery: clean(hero.delivery, defaultContent.hero.delivery),
    },
    slides: [0, 1, 2].map((index) => clean(slides[index], defaultContent.slides[index])),
    breeds: [...requiredBreeds, ...customBreeds],
    supplementsEnabled: source.supplementsEnabled === true,
    supplements: supplements.slice(0, 100).map((item, index) => normalizeSupplement(item, index)),
  };
}

function migrateV4Content(input: Partial<SiteContent> & Record<string, unknown>): Partial<SiteContent> & Record<string, unknown> {
  const breeds = Array.isArray(input.breeds) ? structuredClone(input.breeds) : createDefaultBreeds();
  const holstein = breeds.find((breed) => isRecord(breed) && breed.id === "holstein-friesian");
  if (isRecord(holstein) && Array.isArray(holstein.listings)) {
    const firstListing = holstein.listings.find((listing) => isRecord(listing) && listing.id === "holstein-friesian-1");
    if (isRecord(firstListing) && (!Array.isArray(firstListing.media) || firstListing.media.length === 0)) {
      firstListing.media = HOLSTEIN_FRIESIAN_1_MEDIA.map((item) => ({ ...item }));
    }
  }
  return { ...input, contentVersion: CONTENT_VERSION, breeds };
}

export function migrateLegacyContent(input: Partial<SiteContent> & Record<string, unknown>): Partial<SiteContent> & Record<string, unknown> {
  const hero: Record<string, unknown> = isRecord(input.hero) ? input.hero : {};
  const slides = Array.isArray(input.slides) ? input.slides : defaultContent.slides;
  return {
    contentVersion: CONTENT_VERSION,
    brand: clean(input.brand, defaultContent.brand),
    logo: clean(input.logo, defaultContent.logo),
    whatsapp: clean(input.whatsapp, defaultContent.whatsapp),
    publicPhone: defaultContent.publicPhone,
    clickToCall: defaultContent.clickToCall,
    hindiAddress: defaultContent.hindiAddress,
    englishAddress: defaultContent.englishAddress,
    hero: {
      eyebrow: clean(hero.eyebrow, defaultContent.hero.eyebrow),
      heading: clean(hero.heading, defaultContent.hero.heading),
      accent: clean(hero.accent, defaultContent.hero.accent),
      description: clean(hero.description, defaultContent.hero.description),
      location: clean(hero.location, defaultContent.hero.location),
      delivery: clean(hero.delivery, defaultContent.hero.delivery),
    },
    slides: [0, 1, 2].map((index) => clean(slides[index], defaultContent.slides[index])),
    breeds: createDefaultBreeds(),
    supplementsEnabled: false,
    supplements: createDefaultSupplements(),
  };
}

function normalizeBreed(value: unknown, fallback: BreedGroup): BreedGroup {
  const candidate = isRecord(value) ? value : {};
  const listings = Array.isArray(candidate.listings) ? candidate.listings : fallback.listings;
  const id = stableId(candidate.id, fallback.id);
  const hindiName = clean(candidate.hindiName, fallback.hindiName);
  const englishName = clean(candidate.englishName, fallback.englishName).replace(/Holstein Friesian \(HF\)/gi, "Holstein Friesian");
  return {
    id,
    hindiName,
    englishName,
    protectedDefaultBreed: fallback.protectedDefaultBreed,
    listings: listings.slice(0, 100).map((listing, index) => normalizeListing(listing, { id, hindiName, englishName }, index)),
  };
}

function normalizeListing(value: unknown, breed: Pick<BreedGroup, "id" | "hindiName" | "englishName">, index: number): CattleListing {
  const candidate = isRecord(value) ? value : {};
  const listingNumber = positiveInteger(candidate.listingNumber, index + 1);
  const media = Array.isArray(candidate.media) ? candidate.media : [];
  return {
    id: stableId(candidate.id, `${breed.id}-${listingNumber}`),
    listingNumber,
    hindiName: clean(candidate.hindiName, `${breed.hindiName} ${listingNumber}`),
    englishName: clean(candidate.englishName, `${breed.englishName} ${listingNumber}`).replace(/Holstein Friesian \(HF\)/gi, "Holstein Friesian"),
    available: candidate.available === true,
    description: optional(candidate.description),
    milkYield: optional(candidate.milkYield),
    feedIntake: optional(candidate.feedIntake),
    teeth: optional(candidate.teeth),
    deworming: optional(candidate.deworming),
    lastCalving: optional(candidate.lastCalving),
    age: optional(candidate.age),
    price: optional(candidate.price),
    showPricePublicly: candidate.showPricePublicly === true,
    media: media.slice(0, 20).map((item, mediaIndex) => normalizeMedia(item, `${breed.id}-${listingNumber}-media-${mediaIndex + 1}`)).filter(Boolean) as CattleMedia[],
  };
}

function normalizeMedia(value: unknown, fallbackId: string): CattleMedia | null {
  if (!isRecord(value)) return null;
  const url = optional(value.url);
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return null;
  const type = value.type === "video" ? "video" : "image";
  return {
    id: stableId(value.id, fallbackId),
    type,
    url,
    alt: optional(value.alt),
    mimeType: optional(value.mimeType) || undefined,
  };
}

function normalizeSupplement(value: unknown, index: number): Supplement {
  const candidate = isRecord(value) ? value : {};
  return {
    id: stableId(candidate.id, `supplement-${index + 1}`),
    name: optional(candidate.name),
    category: optional(candidate.category),
    description: optional(candidate.description),
    benefits: optional(candidate.benefits),
    dosage: optional(candidate.dosage),
    suitableFor: optional(candidate.suitableFor),
    packSize: optional(candidate.packSize),
    price: optional(candidate.price),
    available: candidate.available !== false,
    imageUrl: optional(candidate.imageUrl),
    whatsappMessage: optional(candidate.whatsappMessage),
  };
}

export function isSupplementPublicReady(supplement: Supplement): boolean {
  return Boolean(supplement.name && supplement.description && supplement.price && supplement.imageUrl);
}

export function validateContentForSave(content: SiteContent) {
  if (!content.supplementsEnabled) return;
  const incomplete = content.supplements.filter((supplement) => !isSupplementPublicReady(supplement));
  if (incomplete.length) {
    const names = incomplete.map((item, index) => item.name || `Supplement ${index + 1}`).join(", ");
    throw new Error(`Complete name, description, price and product image before enabling supplements: ${names}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function clean(value: unknown, fallback: string): string {
  const result = optional(value);
  return result || fallback;
}

function optional(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 1200) : "";
}

function stableId(value: unknown, fallback: string): string {
  const id = optional(value).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120);
  return id || fallback;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed < 10000 ? parsed : fallback;
}

function normalizePhone(value: unknown, fallback: string): string {
  const source = optional(value) || fallback;
  const digits = source.replace(/\D/g, "").slice(0, 15);
  return digits ? `+${digits}` : fallback;
}
