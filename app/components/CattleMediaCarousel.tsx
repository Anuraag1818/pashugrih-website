"use client";

import { useCallback, useRef, useState } from "react";
import type { CattleMedia } from "../../lib/content";
import { optimizedImageUrl, responsiveImageSrcSet } from "../../lib/media-url";

export function CattleMediaCarousel({ media, cattleName }: { media: CattleMedia[]; cattleName: string }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const go = useCallback((index: number) => setActive((index + media.length) % media.length), [media.length]);

  const safeActive = Math.min(active, Math.max(0, media.length - 1));
  const activeItem = media[safeActive];
  if (!activeItem) return null;

  return <div
    className="cattle-carousel"
    role="region"
    aria-roledescription="कैरोसेल"
    aria-label={`${cattleName} की फोटो और वीडियो`}
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft") go(safeActive - 1);
      if (event.key === "ArrowRight") go(safeActive + 1);
    }}
    onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
    onTouchEnd={(event) => {
      if (touchStart.current === null) return;
      const change = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
      if (Math.abs(change) > 40) go(safeActive + (change < 0 ? 1 : -1));
      touchStart.current = null;
    }}
  >
    <div className="cattle-media-slide active" key={activeItem.id}>
      {activeItem.type === "video"
        ? <video src={activeItem.url} controls playsInline preload="none" aria-label={activeItem.alt || `${cattleName} का वीडियो`} />
        : <img
            src={optimizedImageUrl(activeItem.url, { width: 720, height: 540, fit: "cover", quality: 68 })}
            srcSet={responsiveImageSrcSet(activeItem.url, [360, 540, 720, 960], 68)}
            sizes="(max-width: 720px) 100vw, 50vw"
            alt={activeItem.alt || `${cattleName} की फोटो ${safeActive + 1}`}
            loading="lazy"
            decoding="async"
          />}
    </div>
    {media.length > 1 && <>
      <button className="cattle-media-arrow prev" type="button" onClick={() => go(safeActive - 1)} aria-label={`${cattleName} की पिछली मीडिया`}>‹</button>
      <button className="cattle-media-arrow next" type="button" onClick={() => go(safeActive + 1)} aria-label={`${cattleName} की अगली मीडिया`}>›</button>
      <div className="cattle-media-dots" aria-label="मीडिया चुनें">{media.map((item, index) => <button key={item.id} type="button" className={index === safeActive ? "active" : ""} onClick={() => go(index)} aria-label={`मीडिया ${index + 1}`} aria-current={index === safeActive ? "true" : undefined} />)}</div>
    </>}
  </div>;
}
