"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteContent } from "../../lib/content";

export function PashugrihSite({ initialContent }: { initialContent: SiteContent }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const slideCount = initialContent.slides.length;
  const go = useCallback((index: number) => setActive((index + slideCount) % slideCount), [slideCount]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slideCount), 4600);
    return () => window.clearInterval(timer);
  }, [paused, slideCount]);

  const whatsappHref = (breed?: string) => {
    const message = breed
      ? `नमस्कार, मुझे Pashuगृह वेबसाइट पर उपलब्ध ${breed} नस्ल के पशु में रुचि है। कृपया इसकी वर्तमान कीमत, नवीनतम फोटो, दूध उत्पादन, उम्र और उपलब्धता की जानकारी साझा करें।`
      : "नमस्कार, मुझे Pashuगृह वेबसाइट पर उपलब्ध पशुओं की जानकारी चाहिए। कृपया नवीनतम फोटो, कीमत और उपलब्धता की जानकारी साझा करें।";
    return `https://wa.me/${initialContent.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="site-shell">
      <header className="site-header">
        <nav className="header-left" aria-label="मुख्य नेविगेशन">
          <a href="#breeds">हमारी नस्लें</a>
          <a href={whatsappHref()} target="_blank" rel="noreferrer">संपर्क</a>
        </nav>
        <a className="brand-lockup" href="#top" aria-label={`${initialContent.brand} मुखपृष्ठ`}>
          <img className="brand-logo" src={initialContent.logo} alt={`${initialContent.brand} लोगो`} />
          <span>
            <span className="brand-name">{initialContent.brand}</span>
            <span className="brand-subtitle">CATTLE FARM</span>
          </span>
        </a>
        <a className="admin-link header-admin" href="/admin">Admin</a>
      </header>

      <section
        id="top"
        className="hero"
        aria-roledescription="स्लाइडशो"
        aria-label="विशेष पशु"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const change = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
          if (Math.abs(change) > 45) go(active + (change < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        {initialContent.slides.map((slide, index) => (
          <div className={`hero-slide ${index === active ? "active" : ""}`} key={slide} aria-hidden={index !== active}>
            <img className="hero-image" src={slide} alt={`Pashuगृह पशु फोटो ${index + 1}`} />
            <img className="slide-watermark" src={initialContent.logo} alt="" aria-hidden="true" />
          </div>
        ))}
        <div className="hero-content">
          <div className="eyebrow">{initialContent.hero.eyebrow}</div>
          <h1>{initialContent.hero.heading} <em>{initialContent.hero.accent}</em></h1>
          <p className="hero-description">{initialContent.hero.description}</p>
          <div className="hero-actions">
            <a className="whatsapp-button" href={whatsappHref()} target="_blank" rel="noreferrer">
              <span className="wa-mark" aria-hidden="true">WA</span>
              WhatsApp पर पूछें
            </a>
            <span className="hero-note">सीधे हमारे पशुगृह से — बिना बिचौलिये</span>
          </div>
          <div className="hero-meta">
            <div className="meta-item"><span className="meta-icon">01</span><span className="meta-copy"><strong>{initialContent.hero.location}</strong><span>मिलने के लिए पहले संपर्क करें</span></span></div>
            <div className="meta-item"><span className="meta-icon">02</span><span className="meta-copy"><strong>{initialContent.hero.delivery}</strong><span>सुरक्षित परिवहन में सहायता</span></span></div>
            <div className="meta-item"><span className="meta-icon">03</span><span className="meta-copy"><strong>स्वास्थ्य को प्राथमिकता</strong><span>मांगने पर रिकॉर्ड उपलब्ध</span></span></div>
          </div>
        </div>
        <button className="slide-arrow prev" onClick={() => go(active - 1)} aria-label="पिछली फोटो">‹</button>
        <button className="slide-arrow next" onClick={() => go(active + 1)} aria-label="अगली फोटो">›</button>
        <div className="slide-dots" aria-label="फोटो चुनें">
          {initialContent.slides.map((_, index) => <button key={index} className={`slide-dot ${index === active ? "active" : ""}`} onClick={() => go(index)} aria-label={`फोटो ${index + 1} पर जाएं`} aria-current={index === active ? "true" : undefined} />)}
        </div>
      </section>

      <section className="breeds-section" id="breeds">
        <div className="section-heading">
          <span className="section-kicker">देखभाल से चुने गए · पूरी जानकारी के साथ</span>
          <h2>हमारी पशु नस्लें</h2>
          <p>अपनी आवश्यकता के अनुसार नस्ल चुनें और पूरी जानकारी के लिए WhatsApp पर संपर्क करें।</p>
        </div>
        <div className="breed-grid">
          {initialContent.breeds.map((breed) => (
            <article className={`breed-card ${breed.available ? "" : "sold-card"}`} key={breed.id}>
              <div className="breed-image">
                <img src={breed.image} alt={`${breed.name} नस्ल का पशु`} loading="lazy" />
                <span className={`availability-badge ${breed.available ? "available" : "sold"}`}>{breed.available ? "उपलब्ध" : "अभी उपलब्ध नहीं"}</span>
              </div>
              <div className="breed-body">
                <div className="breed-title-row"><h3>{breed.name}</h3><span className="breed-price">{breed.price}</span></div>
                <p className="breed-description">{breed.description}</p>
                <div className="breed-facts">
                  <div className="fact"><span>दूध उत्पादन</span><strong>{breed.milkYield}</strong></div>
                  <div className="fact"><span>उम्र</span><strong>{breed.age}</strong></div>
                  <div className="fact"><span>स्थिति</span><strong>{breed.available ? "उपलब्ध" : "अभी उपलब्ध नहीं"}</strong></div>
                </div>
                {breed.available ? (
                  <a className="whatsapp-button" href={whatsappHref(breed.name)} target="_blank" rel="noreferrer"><span className="wa-mark" aria-hidden="true">WA</span>WhatsApp पर जानकारी लें</a>
                ) : (
                  <button className="whatsapp-button" type="button" disabled>अभी उपलब्ध नहीं</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-strip" aria-label="हमारी सेवा का भरोसा">
        <div className="trust-inner">
          <div className="trust-item"><span className="trust-number">01</span><span className="trust-copy"><strong>सीधे पशुगृह से संपर्क</strong><span>पशुओं की देखभाल करने वाली टीम से सीधे बात करें</span></span></div>
          <div className="trust-item"><span className="trust-number">02</span><span className="trust-copy"><strong>साफ और नई जानकारी</strong><span>नवीनतम फोटो और स्वास्थ्य की पूरी जानकारी पाएं</span></span></div>
          <div className="trust-item"><span className="trust-number">03</span><span className="trust-copy"><strong>डिलीवरी में सहायता</strong><span>भागलपुर और आसपास के जिलों में सहयोग उपलब्ध</span></span></div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand"><img src={initialContent.logo} alt="" />{initialContent.brand}</div>
          <div className="footer-copy">भागलपुर, बिहार · पशुओं की उपलब्धता समय-समय पर बदलती रहती है।<br />नई और पक्की जानकारी के लिए WhatsApp पर संपर्क करें।</div>
        </div>
      </footer>
    </main>
  );
}
