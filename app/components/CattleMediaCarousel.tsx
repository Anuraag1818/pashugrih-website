"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CattleMedia } from "../../lib/content";

export function CattleMediaCarousel({ media, cattleName }: { media: CattleMedia[]; cattleName: string }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const go = useCallback((index: number) => setActive((index + media.length) % media.length), [media.length]);

  useEffect(() => {
    if (media.length < 2 || paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % media.length), 3000);
    return () => window.clearInterval(timer);
  }, [media.length, paused]);

  useEffect(() => {
    const videos = root.current?.querySelectorAll("video") ?? [];
    videos.forEach((video) => {
      if (Number(video.dataset.mediaIndex) === active) video.play().catch(() => undefined);
      else video.pause();
    });
  }, [active, media]);

  return <div
    ref={root}
    className="cattle-carousel"
    role="region"
    aria-roledescription="कैरोसेल"
    aria-label={`${cattleName} की फोटो और वीडियो`}
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft") go(active - 1);
      if (event.key === "ArrowRight") go(active + 1);
    }}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
    onTouchEnd={(event) => {
      if (touchStart.current === null) return;
      const change = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
      if (Math.abs(change) > 40) go(active + (change < 0 ? 1 : -1));
      touchStart.current = null;
    }}
  >
    {media.map((item, index) => <div className={`cattle-media-slide ${index === active ? "active" : ""}`} key={item.id} aria-hidden={index !== active}>
      {item.type === "video" ? <video data-media-index={index} src={item.url} muted loop playsInline preload="metadata" aria-label={item.alt || `${cattleName} का वीडियो`} /> : <img src={item.url} alt={item.alt || `${cattleName} की फोटो ${index + 1}`} loading="lazy" />}
    </div>)}
    {media.length > 1 && <>
      <button className="cattle-media-arrow prev" type="button" onClick={() => go(active - 1)} aria-label={`${cattleName} की पिछली मीडिया`}>‹</button>
      <button className="cattle-media-arrow next" type="button" onClick={() => go(active + 1)} aria-label={`${cattleName} की अगली मीडिया`}>›</button>
      <div className="cattle-media-dots" aria-label="मीडिया चुनें">{media.map((item, index) => <button key={item.id} type="button" className={index === active ? "active" : ""} onClick={() => go(index)} aria-label={`मीडिया ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}</div>
    </>}
  </div>;
}
