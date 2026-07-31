export const SITE_CONTENT_CACHE_TAG = "site-content";
export const SITE_CONTENT_CACHE_KEY = ["pashugrih-site-content"];
export const SITE_CONTENT_REVALIDATE_SECONDS = false;

type CacheOptions = { tags: string[]; revalidate: number | false };
type CacheFactory = <T extends () => Promise<unknown>>(callback: T, keyParts?: string[], options?: CacheOptions) => T;

export function createPublicContentLoader<T>(
  readFresh: () => Promise<T>,
  cacheFactory: CacheFactory,
): () => Promise<T> {
  return cacheFactory(readFresh, SITE_CONTENT_CACHE_KEY, {
    tags: [SITE_CONTENT_CACHE_TAG],
    revalidate: SITE_CONTENT_REVALIDATE_SECONDS,
  }) as () => Promise<T>;
}

export async function persistAndInvalidateContent<T>(
  persist: () => Promise<T>,
  invalidate: (tag: string) => void | Promise<void>,
): Promise<T> {
  const saved = await persist();
  await invalidate(SITE_CONTENT_CACHE_TAG);
  return saved;
}
