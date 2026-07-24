import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { siteContent } from "../db/schema";

export type Breed = {
  id: string;
  name: string;
  image: string;
  description: string;
  milkYield: string;
  age: string;
  price: string;
  available: boolean;
};

export type SiteContent = {
  contentVersion: number;
  brand: string;
  logo: string;
  whatsapp: string;
  hero: {
    eyebrow: string;
    heading: string;
    accent: string;
    description: string;
    location: string;
    delivery: string;
  };
  slides: string[];
  breeds: Breed[];
};

const CONTENT_VERSION = 3;

export const defaultContent: SiteContent = {
  contentVersion: CONTENT_VERSION,
  brand: "Pashuगृह",
  logo: "/assets/pashugrih-logo.png",
  whatsapp: "919942936647",
  hero: {
    eyebrow: "भागलपुर, बिहार · भरोसेमंद पशु",
    heading: "स्वस्थ पशु।",
    accent: "भरोसेमंद संबंध।",
    description:
      "देखभाल के साथ चुने गए स्वस्थ और अच्छी नस्ल के पशु। नवीनतम फोटो, स्वास्थ्य रिकॉर्ड, कीमत और डिलीवरी की जानकारी के लिए सीधे WhatsApp पर संपर्क करें।",
    location: "भागलपुर, बिहार एवं आसपास के जिले",
    delivery: "पशु डिलीवरी उपलब्ध",
  },
  slides: ["/assets/hero-1.png", "/assets/hero-2.png", "/assets/hero-3.png"],
  breeds: [
    {
      id: "sahiwal",
      name: "Sahiwal",
      image: "/assets/hero-1.png",
      description: "शांत स्वभाव की गर्मी सहने वाली देसी नस्ल, जो अच्छे दूध उत्पादन और भारतीय मौसम के अनुकूल होने के लिए जानी जाती है।",
      milkYield: "8–15 L/day",
      age: "2.5–5 वर्ष",
      price: "₹65,000 – ₹1,20,000",
      available: true,
    },
    {
      id: "gir",
      name: "Gir",
      image: "/assets/hero-2.png",
      description: "मजबूत देसी नस्ल, जो अच्छे दूध उत्पादन, शांत स्वभाव और अलग-अलग मौसम में आसानी से रहने के लिए प्रसिद्ध है।",
      milkYield: "10–18 L/day",
      age: "3–6 वर्ष",
      price: "₹75,000 – ₹1,45,000",
      available: true,
    },
    {
      id: "hf",
      name: "Holstein Friesian (HF)",
      image: "/assets/hero-3.png",
      description: "अधिक दूध देने वाली नस्ल, जिसे बेहतर दूध उत्पादन और स्वस्थ शरीर के आधार पर सावधानी से चुना गया है।",
      milkYield: "18–30 L/day",
      age: "2.5–5 वर्ष",
      price: "₹85,000 – ₹1,60,000",
      available: true,
    },
    {
      id: "jersey",
      name: "Jersey",
      image: "/assets/hero-1.png",
      description: "अच्छी वसा वाला दूध देने वाली किफायती नस्ल, जो छोटे और व्यावसायिक दोनों पशुगृहों के लिए उपयुक्त है।",
      milkYield: "12–20 L/day",
      age: "2.5–5 वर्ष",
      price: "₹70,000 – ₹1,30,000",
      available: false,
    },
  ],
};

export async function getSiteContent(): Promise<SiteContent> {
  if (!process.env.NETLIFY_DB_URL) return defaultContent;
  try {
    const db = getDb();
    const [row] = await db.select({ data: siteContent.data }).from(siteContent).where(eq(siteContent.id, 1)).limit(1);
    if (!row?.data) {
      await db.insert(siteContent).values({ id: 1, data: JSON.stringify(defaultContent) }).onConflictDoNothing();
      return defaultContent;
    }
    const stored = JSON.parse(row.data) as Partial<SiteContent>;
    const migrated = migrateContent(stored);
    const normalized = normalizeContent(migrated);
    if (stored.contentVersion !== CONTENT_VERSION) {
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
  const db = getDb();
  const normalized = normalizeContent(content);
  await db
    .insert(siteContent)
    .values({ id: 1, data: JSON.stringify(normalized), updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteContent.id, set: { data: JSON.stringify(normalized), updatedAt: new Date() } });
  return normalized;
}

export function normalizeContent(value: Partial<SiteContent>): SiteContent {
  const candidateBreeds = Array.isArray(value.breeds) ? value.breeds : defaultContent.breeds;
  const candidateSlides = Array.isArray(value.slides) ? value.slides.slice(0, 3) : defaultContent.slides;
  return {
    contentVersion: CONTENT_VERSION,
    brand: clean(value.brand, defaultContent.brand),
    logo: clean(value.logo, defaultContent.logo),
    whatsapp: clean(value.whatsapp, defaultContent.whatsapp).replace(/\D/g, "").slice(0, 15),
    hero: {
      eyebrow: clean(value.hero?.eyebrow, defaultContent.hero.eyebrow),
      heading: clean(value.hero?.heading, defaultContent.hero.heading),
      accent: clean(value.hero?.accent, defaultContent.hero.accent),
      description: clean(value.hero?.description, defaultContent.hero.description),
      location: clean(value.hero?.location, defaultContent.hero.location),
      delivery: clean(value.hero?.delivery, defaultContent.hero.delivery),
    },
    slides: [0, 1, 2].map((index) => clean(candidateSlides[index], defaultContent.slides[index])),
    breeds: defaultContent.breeds.map((fallback, index) => {
      const breed = candidateBreeds[index] ?? fallback;
      return {
        id: fallback.id,
        name: clean(breed.name, fallback.name),
        image: clean(breed.image, fallback.image),
        description: clean(breed.description, fallback.description),
        milkYield: clean(breed.milkYield, fallback.milkYield),
        age: clean(breed.age, fallback.age),
        price: clean(breed.price, fallback.price),
        available: breed.available !== false,
      };
    }),
  };
}

function migrateContent(value: Partial<SiteContent>): Partial<SiteContent> {
  if (value.contentVersion === CONTENT_VERSION) return value;
  const previousBreeds = Array.isArray(value.breeds) ? value.breeds : [];
  const previousSlides = Array.isArray(value.slides) ? value.slides : [];
  return {
    ...defaultContent,
    brand: clean(value.brand, defaultContent.brand),
    logo: clean(value.logo, defaultContent.logo),
    slides: defaultContent.slides.map((slide, index) => clean(previousSlides[index], slide)),
    breeds: defaultContent.breeds.map((fallback, index) => {
      const previous = previousBreeds[index];
      return {
        ...fallback,
        image: clean(previous?.image, fallback.image),
        milkYield: clean(previous?.milkYield, fallback.milkYield),
        age: translateAge(clean(previous?.age, fallback.age)),
        price: clean(previous?.price, fallback.price),
        available: previous?.available !== false,
      };
    }),
  };
}

function clean(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 800) : fallback;
}

function translateAge(value: string): string {
  return value.replace(/\byears?\b/gi, "वर्ष");
}
