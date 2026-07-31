type ImageOptions = {
  width: number;
  height?: number;
  quality?: number;
  fit?: "cover" | "contain";
};

function canTransform(source: string): boolean {
  return source.startsWith("/") && !source.startsWith("//");
}

export function optimizedImageUrl(source: string, options: ImageOptions): string {
  if (!canTransform(source)) return source;
  const params = new URLSearchParams({
    url: source,
    w: String(options.width),
    q: String(options.quality ?? 70),
  });
  if (options.height) params.set("h", String(options.height));
  if (options.fit) params.set("fit", options.fit);
  return `/.netlify/images?${params.toString()}`;
}

export function responsiveImageSrcSet(source: string, widths: number[], quality = 70): string | undefined {
  if (!canTransform(source)) return undefined;
  return widths.map((width) => `${optimizedImageUrl(source, { width, quality })} ${width}w`).join(", ");
}
