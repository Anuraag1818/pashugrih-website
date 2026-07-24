"use client";

import { useState, type ChangeEvent } from "react";
import type { SiteContent } from "../../lib/content";
import { LogoutButton } from "./LogoutButton";

type ImageTarget = { kind: "logo" } | { kind: "slide"; index: number } | { kind: "breed"; index: number };

export function AdminEditor({ initialContent, userName }: { initialContent: SiteContent; userName: string }) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateHero = (field: keyof SiteContent["hero"], value: string) => setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  const updateBreed = (index: number, field: keyof SiteContent["breeds"][number], value: string | boolean) => setContent((current) => ({ ...current, breeds: current.breeds.map((breed, breedIndex) => breedIndex === index ? { ...breed, [field]: value } : breed) }));

  const setImage = (target: ImageTarget, value: string) => {
    setContent((current) => {
      if (target.kind === "logo") return { ...current, logo: value };
      if (target.kind === "slide") return { ...current, slides: current.slides.map((slide, index) => index === target.index ? value : slide) };
      return { ...current, breeds: current.breeds.map((breed, index) => index === target.index ? { ...breed, image: value } : breed) };
    });
  };

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, target: ImageTarget) {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImage(target, preview);
    setMessage("Uploading image…");
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Upload failed");
      setImage(target, result.url);
      setMessage("Image uploaded. Save changes to publish it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) });
      const result = await response.json() as { content?: SiteContent; error?: string };
      if (!response.ok || !result.content) throw new Error(result.error || "Could not save changes");
      setContent(result.content);
      setMessage("Changes published successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/"><img src={content.logo} alt="" /><span><strong>{content.brand}</strong><span>Website administration</span></span></a>
        <div className="admin-user"><span>Signed in as {userName}</span><a href="/">View website</a><LogoutButton /></div>
      </header>
      <div className="admin-layout">
        <div className="admin-intro"><div><h1>Website content</h1><p>Update your branding, slideshow, cattle details, prices and stock status.</p></div><button className="save-button" type="button" onClick={save} disabled={saving}>{saving ? "Publishing…" : "Save & publish changes"}</button></div>
        {message && <div className="admin-message" role="status">{message}</div>}
        <div className="admin-grid">
          <div className="admin-stack">
            <section className="admin-panel">
              <h2>Brand & contact</h2><p className="panel-help">Your logo appears in the navbar and as the subtle hero watermark.</p>
              <div className="form-field"><label htmlFor="brand">Brand name</label><input id="brand" value={content.brand} onChange={(event) => setContent({ ...content, brand: event.target.value })} /></div>
              <div className="form-field"><label htmlFor="whatsapp">WhatsApp number</label><input id="whatsapp" inputMode="tel" value={content.whatsapp} onChange={(event) => setContent({ ...content, whatsapp: event.target.value.replace(/\D/g, "") })} /><small>Use country code without + or spaces.</small></div>
              <UploadControl label="Logo" preview={content.logo} logo onChange={(event) => uploadImage(event, { kind: "logo" })} />
            </section>
            <section className="admin-panel">
              <h2>Hero content</h2><p className="panel-help">This text remains readable over all three slideshow images.</p>
              <div className="form-field"><label htmlFor="eyebrow">Small heading</label><input id="eyebrow" value={content.hero.eyebrow} onChange={(event) => updateHero("eyebrow", event.target.value)} /></div>
              <div className="form-row"><div className="form-field"><label htmlFor="hero-heading">Main heading</label><input id="hero-heading" value={content.hero.heading} onChange={(event) => updateHero("heading", event.target.value)} /></div><div className="form-field"><label htmlFor="hero-accent">Gold heading</label><input id="hero-accent" value={content.hero.accent} onChange={(event) => updateHero("accent", event.target.value)} /></div></div>
              <div className="form-field"><label htmlFor="hero-description">Description</label><textarea id="hero-description" value={content.hero.description} onChange={(event) => updateHero("description", event.target.value)} /></div>
              <div className="form-row"><div className="form-field"><label htmlFor="location">Location</label><input id="location" value={content.hero.location} onChange={(event) => updateHero("location", event.target.value)} /></div><div className="form-field"><label htmlFor="delivery">Delivery</label><input id="delivery" value={content.hero.delivery} onChange={(event) => updateHero("delivery", event.target.value)} /></div></div>
            </section>
            <section className="admin-panel">
              <h2>Hero slideshow</h2><p className="panel-help">Upload three horizontal photographs. A preview appears immediately.</p>
              <div className="slide-upload-grid">{content.slides.map((slide, index) => <UploadControl key={index} label={`Hero image ${index + 1}`} preview={slide} onChange={(event) => uploadImage(event, { kind: "slide", index })} />)}</div>
            </section>
          </div>
          <section className="admin-panel">
            <h2>Cattle breed cards</h2><p className="panel-help">The stock button instantly switches each listing between Available and Sold before publishing.</p>
            {content.breeds.map((breed, index) => (
              <div className="breed-editor" key={breed.id}>
                <div className="breed-editor-head"><h3>{breed.name || `Breed ${index + 1}`}</h3><button type="button" className={`stock-toggle ${breed.available ? "available" : "sold"}`} onClick={() => updateBreed(index, "available", !breed.available)}>{breed.available ? "Available · Mark out of stock" : "Sold · Mark available"}</button></div>
                <UploadControl label="Breed image" preview={breed.image} onChange={(event) => uploadImage(event, { kind: "breed", index })} />
                <div className="form-field"><label htmlFor={`name-${breed.id}`}>Breed name</label><input id={`name-${breed.id}`} value={breed.name} onChange={(event) => updateBreed(index, "name", event.target.value)} /></div>
                <div className="form-field"><label htmlFor={`description-${breed.id}`}>Description</label><textarea id={`description-${breed.id}`} value={breed.description} onChange={(event) => updateBreed(index, "description", event.target.value)} /></div>
                <div className="form-row"><div className="form-field"><label htmlFor={`yield-${breed.id}`}>Milk yield</label><input id={`yield-${breed.id}`} value={breed.milkYield} onChange={(event) => updateBreed(index, "milkYield", event.target.value)} /></div><div className="form-field"><label htmlFor={`age-${breed.id}`}>Age</label><input id={`age-${breed.id}`} value={breed.age} onChange={(event) => updateBreed(index, "age", event.target.value)} /></div></div>
                <div className="form-field"><label htmlFor={`price-${breed.id}`}>Price or price range</label><input id={`price-${breed.id}`} value={breed.price} onChange={(event) => updateBreed(index, "price", event.target.value)} /></div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

function UploadControl({ label, preview, logo = false, onChange }: { label: string; preview: string; logo?: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="upload-control"><img className={`upload-preview ${logo ? "logo-preview" : ""}`} src={preview} alt={`${label} preview`} /><div className="upload-copy"><strong>{label}</strong><input type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} /><small>PNG, JPG or WebP · up to 8 MB</small></div></div>;
}
