"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import type { CattleListing, SiteContent, Supplement } from "../../lib/content";
import { isSupplementPublicReady } from "../../lib/content-model";
import { CattleMediaCarousel } from "./CattleMediaCarousel";

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

  const whatsappHref = (message: string) => `https://wa.me/${initialContent.whatsapp}?text=${encodeURIComponent(message)}`;
  const generalMessage = "नमस्कार, मुझे Pashuगृह वेबसाइट पर उपलब्ध पशुओं की जानकारी चाहिए। कृपया वर्तमान उपलब्धता, नवीनतम फोटो और वीडियो साझा करें।";
  const cattleMessage = (listing: CattleListing) => {
    const price = listing.showPricePublicly && listing.price ? ` वेबसाइट पर दिखाई गई कीमत ${listing.price} है।` : "";
    return `नमस्कार, मुझे Pashuगृह वेबसाइट पर ${listing.hindiName} — ${listing.englishName} में रुचि है। कृपया इसकी वर्तमान उपलब्धता, नवीनतम फोटो, वीडियो और स्वास्थ्य की जानकारी साझा करें।${price}`;
  };
  const supplementMessage = (supplement: Supplement) => supplement.whatsappMessage || `नमस्ते, मुझे ${supplement.name}${supplement.packSize ? `, ${supplement.packSize}` : ""}${supplement.price ? `, ${supplement.price}` : ""} के बारे में जानकारी चाहिए।`;
  const visibleSupplements = initialContent.supplements.filter(isSupplementPublicReady);

  return <main className="site-shell">
    <header className="site-header">
      <nav className="header-left" aria-label="मुख्य नेविगेशन">
        <a href="#breeds">हमारी नस्लें</a>
        {initialContent.supplementsEnabled && visibleSupplements.length > 0 && <a href="#supplements">सप्लीमेंट्स</a>}
        <a href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer">संपर्क</a>
      </nav>
      <a className="brand-lockup" href="#top" aria-label={`${initialContent.brand} मुखपृष्ठ`}>
        <img className="brand-logo" src={initialContent.logo} alt={`${initialContent.brand} लोगो`} />
        <span><span className="brand-name">{initialContent.brand}</span><span className="brand-subtitle">CATTLE FARM</span></span>
      </a>
      <a className="admin-link header-admin" href="/admin">Admin</a>
    </header>

    <section id="top" className="hero" aria-roledescription="स्लाइडशो" aria-label="विशेष पशु" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => {
      if (touchStart.current === null) return;
      const change = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
      if (Math.abs(change) > 45) go(active + (change < 0 ? 1 : -1));
      touchStart.current = null;
    }}>
      {initialContent.slides.map((slide, index) => <div className={`hero-slide ${index === active ? "active" : ""}`} key={slide} aria-hidden={index !== active}>
        <img className="hero-image" src={slide} alt={`Pashuगृह पशु फोटो ${index + 1}`} />
        <img className="slide-watermark" src={initialContent.logo} alt="" aria-hidden="true" />
      </div>)}
      <div className="hero-content">
        <div className="eyebrow">{initialContent.hero.eyebrow}</div>
        <h1>{initialContent.hero.heading} <em>{initialContent.hero.accent}</em></h1>
        <p className="hero-description">{initialContent.hero.description}</p>
        <div className="hero-actions">
          <a className="whatsapp-button" href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer"><FaWhatsapp aria-hidden="true" />WhatsApp पर पूछें</a>
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
      <div className="slide-dots" aria-label="फोटो चुनें">{initialContent.slides.map((_, index) => <button key={index} className={`slide-dot ${index === active ? "active" : ""}`} onClick={() => go(index)} aria-label={`फोटो ${index + 1} पर जाएं`} aria-current={index === active ? "true" : undefined} />)}</div>
    </section>

    <section className="breeds-section" id="breeds">
      <div className="section-heading"><span className="section-kicker">देखभाल से चुने गए · पूरी जानकारी के साथ</span><h2>हमारी पशु नस्लें</h2><p>अपनी आवश्यकता के अनुसार नस्ल चुनें और पूरी जानकारी के लिए WhatsApp पर संपर्क करें।</p></div>
      <div className="breed-sections">{initialContent.breeds.map((breed) => <section className="breed-group" key={breed.id} aria-labelledby={`breed-${breed.id}`}>
        <header className="breed-group-heading"><h3 id={`breed-${breed.id}`}>{breed.hindiName}</h3><p>{breed.englishName}</p></header>
        <div className="cattle-grid">{breed.listings.map((listing) => {
          const facts = [
            ["दूध उत्पादन", listing.milkYield], ["प्रतिदिन चारा", listing.feedIntake], ["दाँत", listing.teeth],
            ["कृमिनाशक दवा", listing.deworming], ["पिछला ब्याना", listing.lastCalving], ["उम्र", listing.age],
          ].filter((fact) => fact[1]);
          return <article className={`cattle-card ${listing.available ? "available-card" : "unavailable-card"}`} key={listing.id}>
            <div className="cattle-media-area">
              {listing.media.length ? <CattleMediaCarousel media={listing.media} cattleName={listing.hindiName} /> : <div className="cattle-placeholder"><img src={initialContent.logo} alt="" aria-hidden="true" /><strong>{listing.available ? "असली फोटो और वीडियो जल्द उपलब्ध होंगे" : "अभी उपलब्ध नहीं"}</strong><span>{listing.available ? "नवीनतम मीडिया के लिए WhatsApp पर संपर्क करें" : "भविष्य की उपलब्धता के लिए सुरक्षित पशु बॉक्स"}</span></div>}
              <span className={`availability-badge ${listing.available ? "available" : "sold"}`}>{listing.available ? "अभी उपलब्ध" : "अभी उपलब्ध नहीं"}</span>
            </div>
            <div className="cattle-card-body">
              <div className="cattle-title"><h4>{listing.hindiName}</h4><p>{listing.englishName}</p></div>
              {listing.description && <p className="cattle-description">{listing.description}</p>}
              {facts.length > 0 && <dl className="cattle-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
              {listing.showPricePublicly && listing.price && <div className="cattle-price"><span>कीमत</span><strong>{listing.price}</strong></div>}
              {listing.available ? <a className="whatsapp-button" href={whatsappHref(cattleMessage(listing))} target="_blank" rel="noreferrer"><FaWhatsapp aria-hidden="true" />WhatsApp पर जानकारी लें</a> : <div className="unavailable-message">अभी उपलब्ध नहीं</div>}
            </div>
          </article>;
        })}</div>
      </section>)}</div>
    </section>

    {initialContent.supplementsEnabled && visibleSupplements.length > 0 && <section className="supplements-section" id="supplements">
      <div className="section-heading"><span className="section-kicker">भविष्य के पोषण उत्पाद</span><h2>पशु आहार सप्लीमेंट्स</h2><p>बेहतर स्वास्थ्य, दूध उत्पादन और पशुओं की दैनिक पोषण आवश्यकताओं के लिए उपयोगी सप्लीमेंट्स।</p></div>
      <div className="supplement-grid">{visibleSupplements.map((supplement) => <article className="supplement-card" key={supplement.id}>
        <img src={supplement.imageUrl} alt={`${supplement.name} उत्पाद`} loading="lazy" />
        <div className="supplement-body"><span className="supplement-category">{supplement.category}</span><h3>{supplement.name}</h3><p>{supplement.description}</p>
          <dl>{[["लाभ", supplement.benefits], ["उपयोग / मात्रा", supplement.dosage], ["उपयुक्त पशु", supplement.suitableFor], ["पैक आकार", supplement.packSize], ["कीमत", supplement.price]].filter((item) => item[1]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {supplement.available ? <a className="whatsapp-button" href={whatsappHref(supplementMessage(supplement))} target="_blank" rel="noreferrer"><FaWhatsapp aria-hidden="true" />WhatsApp पर पूछें</a> : <div className="unavailable-message">फिलहाल उपलब्ध नहीं</div>}
        </div>
      </article>)}</div>
    </section>}

    <section className="trust-strip" aria-label="हमारी सेवा का भरोसा"><div className="trust-inner">
      <div className="trust-item"><span className="trust-number">01</span><span className="trust-copy"><strong>सीधे पशुगृह से संपर्क</strong><span>पशुओं की देखभाल करने वाली टीम से सीधे बात करें</span></span></div>
      <div className="trust-item"><span className="trust-number">02</span><span className="trust-copy"><strong>साफ और नई जानकारी</strong><span>नवीनतम फोटो और स्वास्थ्य की पूरी जानकारी पाएं</span></span></div>
      <div className="trust-item"><span className="trust-number">03</span><span className="trust-copy"><strong>डिलीवरी में सहायता</strong><span>भागलपुर और आसपास के जिलों में सहयोग उपलब्ध</span></span></div>
    </div></section>
    <footer className="site-footer"><div className="footer-inner">
      <div className="footer-brand"><img src={initialContent.logo} alt="" />{initialContent.brand}</div>
      <address className="footer-contact"><a href={`tel:${initialContent.clickToCall}`}>{initialContent.publicPhone}</a><strong>{initialContent.hindiAddress}</strong>{initialContent.englishAddress && <span>{initialContent.englishAddress}</span>}</address>
      <div className="footer-copy">पशुओं की उपलब्धता समय-समय पर बदलती रहती है।<br />नई और पक्की जानकारी के लिए WhatsApp पर संपर्क करें।</div>
    </div></footer>
    <a className="floating-whatsapp" href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer" aria-label="Pashuगृह से WhatsApp पर संपर्क करें"><FaWhatsapp aria-hidden="true" /></a>
  </main>;
}
