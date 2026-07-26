"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { createBlankListing, isSupplementPublicReady, type BreedGroup, type CattleListing, type CattleMedia, type SiteContent, type Supplement } from "../../lib/content-model";
import { LogoutButton } from "./LogoutButton";

type SingleImageTarget = { kind: "logo" } | { kind: "slide"; index: number } | { kind: "supplement"; id: string };
type UploadResult = { id: string; url: string; type: "image" | "video"; mimeType: string; error?: string };

export function AdminEditor({ initialContent, userName }: { initialContent: SiteContent; userName: string }) {
  const [content, setContent] = useState(initialContent);
  const [publishedSnapshot, setPublishedSnapshot] = useState(() => JSON.stringify(initialContent));
  const [saving, setSaving] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const dirty = useMemo(() => JSON.stringify(content) !== publishedSnapshot, [content, publishedSnapshot]);
  const incompleteSupplements = content.supplements.filter((item) => !isSupplementPublicReady(item));

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const updateHero = (field: keyof SiteContent["hero"], value: string) => setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }));
  const updateBreed = (breedId: string, updater: (breed: BreedGroup) => BreedGroup) => setContent((current) => ({ ...current, breeds: current.breeds.map((breed) => breed.id === breedId ? updater(breed) : breed) }));
  const updateListing = (breedId: string, listingId: string, field: keyof CattleListing, value: CattleListing[keyof CattleListing]) => updateBreed(breedId, (breed) => ({ ...breed, listings: breed.listings.map((listing) => listing.id === listingId ? { ...listing, [field]: value } : listing) }));
  const updateSupplement = (id: string, field: keyof Supplement, value: Supplement[keyof Supplement]) => setContent((current) => ({ ...current, supplements: current.supplements.map((item) => item.id === id ? { ...item, [field]: value } : item) }));

  function setSingleImage(target: SingleImageTarget, value: string) {
    setContent((current) => {
      if (target.kind === "logo") return { ...current, logo: value };
      if (target.kind === "slide") return { ...current, slides: current.slides.map((slide, index) => index === target.index ? value : slide) };
      return { ...current, supplements: current.supplements.map((item) => item.id === target.id ? { ...item, imageUrl: value } : item) };
    });
  }

  function currentSingleImage(target: SingleImageTarget) {
    if (target.kind === "logo") return content.logo;
    if (target.kind === "slide") return content.slides[target.index] ?? "";
    return content.supplements.find((item) => item.id === target.id)?.imageUrl ?? "";
  }

  async function uploadSingleImage(event: ChangeEvent<HTMLInputElement>, target: SingleImageTarget) {
    const file = event.target.files?.[0];
    if (!file) return;
    const previous = currentSingleImage(target);
    const preview = URL.createObjectURL(file);
    setSingleImage(target, preview);
    setActiveUploads((count) => count + 1);
    setMessage("Uploading image…");
    try {
      const result = await uploadFile(file, setUploadProgress);
      if (result.type !== "image") throw new Error("This field accepts images only.");
      setSingleImage(target, result.url);
      setMessage("Image uploaded successfully. Save & publish changes to use it on the website.");
    } catch (cause) {
      setSingleImage(target, previous);
      setMessage(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      URL.revokeObjectURL(preview);
      setActiveUploads((count) => Math.max(0, count - 1));
      setUploadProgress(0);
      event.target.value = "";
    }
  }

  async function uploadCattleMedia(breedId: string, listingId: string, files: FileList) {
    const selected = Array.from(files);
    if (!selected.length) return;
    setActiveUploads((count) => count + selected.length);
    let uploaded = 0;
    for (const file of selected) {
      try {
        setMessage(`Uploading ${file.name}…`);
        const result = await uploadFile(file, setUploadProgress);
        const media: CattleMedia = { id: result.id, type: result.type, url: result.url, mimeType: result.mimeType, alt: "" };
        updateBreed(breedId, (breed) => ({ ...breed, listings: breed.listings.map((listing) => listing.id === listingId ? { ...listing, media: [...listing.media, media] } : listing) }));
        uploaded += 1;
      } catch (cause) {
        setMessage(cause instanceof Error ? cause.message : `Could not upload ${file.name}.`);
      } finally {
        setActiveUploads((count) => Math.max(0, count - 1));
      }
    }
    setUploadProgress(0);
    if (uploaded) setMessage(`${uploaded} media file${uploaded === 1 ? "" : "s"} uploaded. Save & publish changes to attach them to this cattle listing.`);
  }

  function addListing(breedId: string) {
    updateBreed(breedId, (breed) => {
      const nextNumber = Math.max(0, ...breed.listings.map((item) => item.listingNumber)) + 1;
      const listing = createBlankListing(breed, nextNumber, `${breed.id}-${crypto.randomUUID()}`);
      return { ...breed, listings: [...breed.listings, listing] };
    });
  }

  function removeListing(breedId: string, listing: CattleListing) {
    if (!window.confirm(`क्या आप “${listing.hindiName || listing.englishName}” को हटाना चाहते हैं? यह बदलाव Save & publish changes दबाने के बाद लागू होगा।`)) return;
    updateBreed(breedId, (breed) => ({ ...breed, listings: breed.listings.filter((item) => item.id !== listing.id) }));
  }

  function moveListing(listing: CattleListing, fromBreedId: string, toBreedId: string) {
    if (fromBreedId === toBreedId) return;
    setContent((current) => ({ ...current, breeds: current.breeds.map((breed) => {
      if (breed.id === fromBreedId) return { ...breed, listings: breed.listings.filter((item) => item.id !== listing.id) };
      if (breed.id === toBreedId) return { ...breed, listings: [...breed.listings, listing] };
      return breed;
    }) }));
  }

  function addBreed() {
    const id = `breed-${crypto.randomUUID()}`;
    const breed: BreedGroup = { id, hindiName: "नई नस्ल", englishName: "New Breed", protectedDefaultBreed: false, listings: [] };
    breed.listings.push(createBlankListing(breed, 1, `${id}-${crypto.randomUUID()}`));
    setContent((current) => ({ ...current, breeds: [...current.breeds, breed] }));
  }

  function removeBreed(breed: BreedGroup) {
    if (breed.protectedDefaultBreed) return;
    if (!window.confirm(`क्या आप “${breed.hindiName || breed.englishName}” नस्ल सेक्शन को हटाना चाहते हैं? यह बदलाव Save & publish changes दबाने के बाद लागू होगा।`)) return;
    setContent((current) => ({ ...current, breeds: current.breeds.filter((item) => item.id !== breed.id) }));
  }

  function addSupplement() {
    const supplement: Supplement = { id: `supplement-${crypto.randomUUID()}`, name: "", category: "", description: "", benefits: "", dosage: "", suitableFor: "", packSize: "", price: "", available: true, imageUrl: "", whatsappMessage: "" };
    setContent((current) => ({ ...current, supplements: [...current.supplements, supplement] }));
  }

  function deleteSupplement(item: Supplement) {
    if (!window.confirm(`क्या आप “${item.name || "Unnamed supplement"}” को हटाना चाहते हैं? यह बदलाव Save & publish changes दबाने के बाद लागू होगा।`)) return;
    setContent((current) => ({ ...current, supplements: current.supplements.filter((supplement) => supplement.id !== item.id) }));
  }

  function toggleSupplements() {
    if (!content.supplementsEnabled) {
      if (incompleteSupplements.length) {
        setMessage(`Cannot enable supplements yet. Complete name, description, price and product image for: ${incompleteSupplements.map((item, index) => item.name || `Supplement ${index + 1}`).join(", ")}.`);
        return;
      }
      if (!window.confirm("क्या आप सप्लीमेंट सेक्शन को वेबसाइट पर दिखाना चाहते हैं?")) return;
    } else if (!window.confirm("क्या आप सप्लीमेंट सेक्शन को वेबसाइट से छिपाना चाहते हैं? आपके उत्पादों की जानकारी सुरक्षित रहेगी।")) return;
    setContent((current) => ({ ...current, supplementsEnabled: !current.supplementsEnabled }));
    setMessage("Supplement visibility changed in this draft. Save & publish changes to apply it.");
  }

  async function save() {
    if (activeUploads) return setMessage("Please wait for all media uploads to finish before publishing.");
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(content) });
      const result = await response.json() as { content?: SiteContent; error?: string };
      if (!response.ok || !result.content) throw new Error(result.error || "Could not save changes");
      setContent(result.content);
      setPublishedSnapshot(JSON.stringify(result.content));
      setMessage("Changes published successfully.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not save changes. Your draft remains on this page.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="admin-shell">
    <header className="admin-topbar"><Link className="admin-brand" href="/"><img src={content.logo} alt="" /><span><strong>{content.brand}</strong><span>Website administration</span></span></Link><div className="admin-user"><span>Signed in as {userName}</span><Link href="/">View website</Link><LogoutButton /></div></header>
    <div className="admin-layout">
      <div className="admin-intro"><div><div className="admin-title-line"><h1>Website content</h1>{dirty && <span className="unsaved-badge">Unsaved changes</span>}</div><p>Manage branding, cattle inventory, real media, contact details and private supplement drafts.</p></div><button className="save-button" type="button" onClick={save} disabled={saving || activeUploads > 0}>{saving ? "Publishing…" : activeUploads ? `Uploading ${uploadProgress}%…` : "Save & publish changes"}</button></div>
      {message && <div className="admin-message" role="status">{message}</div>}

      <div className="admin-grid"><div className="admin-stack">
        <section className="admin-panel"><h2>Brand & contact</h2><p className="panel-help">Global website identity and contact details.</p>
          <Field id="brand" label="Brand name" value={content.brand} onChange={(value) => setContent({ ...content, brand: value })} />
          <Field id="whatsapp" label="WhatsApp number" value={content.whatsapp} onChange={(value) => setContent({ ...content, whatsapp: value.replace(/\D/g, "") })} help="Country code without + or spaces." />
          <div className="form-row"><Field id="public-phone" label="Public phone number" value={content.publicPhone} onChange={(value) => setContent({ ...content, publicPhone: value })} /><Field id="click-phone" label="Click-to-call number" value={content.clickToCall} onChange={(value) => setContent({ ...content, clickToCall: value })} /></div>
          <Field id="hindi-address" label="Hindi address" value={content.hindiAddress} onChange={(value) => setContent({ ...content, hindiAddress: value })} />
          <Field id="english-address" label="English address" value={content.englishAddress} onChange={(value) => setContent({ ...content, englishAddress: value })} />
          <UploadControl label="Logo" preview={content.logo} logo onChange={(event) => uploadSingleImage(event, { kind: "logo" })} />
        </section>
        <section className="admin-panel"><h2>Hero content</h2><p className="panel-help">The approved hero layout and slideshow remain unchanged.</p>
          <Field id="eyebrow" label="Small heading" value={content.hero.eyebrow} onChange={(value) => updateHero("eyebrow", value)} />
          <div className="form-row"><Field id="hero-heading" label="Main heading" value={content.hero.heading} onChange={(value) => updateHero("heading", value)} /><Field id="hero-accent" label="Gold heading" value={content.hero.accent} onChange={(value) => updateHero("accent", value)} /></div>
          <Field id="hero-description" label="Description" value={content.hero.description} onChange={(value) => updateHero("description", value)} multiline />
          <div className="form-row"><Field id="location" label="Location" value={content.hero.location} onChange={(value) => updateHero("location", value)} /><Field id="delivery" label="Delivery" value={content.hero.delivery} onChange={(value) => updateHero("delivery", value)} /></div>
        </section>
        <section className="admin-panel"><h2>Hero slideshow</h2><p className="panel-help">Upload three horizontal images. These controls do not change the approved crop or slideshow behaviour.</p><div className="slide-upload-grid">{content.slides.map((slide, index) => <UploadControl key={index} label={`Hero image ${index + 1}`} preview={slide} onChange={(event) => uploadSingleImage(event, { kind: "slide", index })} />)}</div></section>
      </div>

      <section className="admin-panel inventory-panel"><div className="panel-title-actions"><div><h2>Cattle inventory</h2><p className="panel-help">Breed group → numbered cattle listings. Only publish genuine information and media.</p></div><button className="admin-add-button" type="button" onClick={addBreed}>+ Add breed section</button></div>
        {content.breeds.map((breed) => <div className="breed-admin-group" key={breed.id}>
          <div className="breed-editor-head"><div><strong>{breed.hindiName}</strong><span>{breed.englishName}</span></div>{!breed.protectedDefaultBreed && <button className="danger-link" type="button" onClick={() => removeBreed(breed)}>Delete breed</button>}</div>
          <div className="form-row"><Field id={`breed-hi-${breed.id}`} label="Hindi breed heading" value={breed.hindiName} onChange={(value) => updateBreed(breed.id, (item) => ({ ...item, hindiName: value }))} /><Field id={`breed-en-${breed.id}`} label="English breed heading" value={breed.englishName} onChange={(value) => updateBreed(breed.id, (item) => ({ ...item, englishName: value }))} /></div>
          <div className="listing-stack">{breed.listings.map((listing) => <ListingEditor key={listing.id} breed={breed} breeds={content.breeds} listing={listing} onUpdate={(field, value) => updateListing(breed.id, listing.id, field, value)} onMove={(toBreedId) => moveListing(listing, breed.id, toBreedId)} onRemove={() => removeListing(breed.id, listing)} onMediaChange={(media) => updateListing(breed.id, listing.id, "media", media)} onUpload={(files) => uploadCattleMedia(breed.id, listing.id, files)} />)}</div>
          <button className="admin-add-button full" type="button" onClick={() => addListing(breed.id)}>+ Add cattle box</button>
        </div>)}
      </section></div>

      <section className="admin-panel supplements-admin"><div className="panel-title-actions"><div><h2>Supplement cards</h2><p className="panel-help">Prepare and manage supplement products. These products will remain hidden until you enable the supplement section.</p></div><button className={`supplement-visibility ${content.supplementsEnabled ? "enabled" : ""}`} type="button" onClick={toggleSupplements}>{content.supplementsEnabled ? "Hide supplement section from website" : "Show supplement section on website"}</button></div>
        <div className={`supplement-state ${content.supplementsEnabled ? "public" : "private"}`}>{content.supplementsEnabled ? "Draft is set to public after the next successful save." : "Private draft · supplements are completely hidden from the public website."}</div>
        {incompleteSupplements.length > 0 && <div className="validation-note">Activation requires name, description, price and image. Incomplete: {incompleteSupplements.map((item, index) => item.name || `Supplement ${index + 1}`).join(", ")}.</div>}
        <div className="supplement-admin-grid">{content.supplements.map((item, index) => <div className="supplement-editor" key={item.id}>
          <div className="breed-editor-head"><h3>{item.name || `Supplement ${index + 1}`}</h3><button type="button" className={`stock-toggle ${item.available ? "available" : "sold"}`} onClick={() => updateSupplement(item.id, "available", !item.available)}>{item.available ? "Available · Mark out of stock" : "Out of stock · Mark available"}</button></div>
          <div className="supplement-preview">{item.imageUrl ? <img src={item.imageUrl} alt={`${item.name || "Supplement"} preview`} /> : <div><img src={content.logo} alt="" /><span>Temporary Admin placeholder</span></div>}</div>
          <UploadControl label="Product image" preview={item.imageUrl} onChange={(event) => uploadSingleImage(event, { kind: "supplement", id: item.id })} />
          <div className="form-row"><Field id={`sup-name-${item.id}`} label="Supplement name" value={item.name} onChange={(value) => updateSupplement(item.id, "name", value)} /><Field id={`sup-category-${item.id}`} label="Category" value={item.category} onChange={(value) => updateSupplement(item.id, "category", value)} /></div>
          <Field id={`sup-description-${item.id}`} label="Hindi description" value={item.description} onChange={(value) => updateSupplement(item.id, "description", value)} multiline />
          <Field id={`sup-benefits-${item.id}`} label="Benefits" value={item.benefits} onChange={(value) => updateSupplement(item.id, "benefits", value)} multiline />
          <Field id={`sup-dosage-${item.id}`} label="Usage or dosage" value={item.dosage} onChange={(value) => updateSupplement(item.id, "dosage", value)} />
          <div className="form-row"><Field id={`sup-suitable-${item.id}`} label="Suitable animal" value={item.suitableFor} onChange={(value) => updateSupplement(item.id, "suitableFor", value)} /><Field id={`sup-pack-${item.id}`} label="Pack size" value={item.packSize} onChange={(value) => updateSupplement(item.id, "packSize", value)} /></div>
          <Field id={`sup-price-${item.id}`} label="Price" value={item.price} onChange={(value) => updateSupplement(item.id, "price", value)} />
          <Field id={`sup-wa-${item.id}`} label="Custom WhatsApp message" value={item.whatsappMessage} onChange={(value) => updateSupplement(item.id, "whatsappMessage", value)} multiline />
          <button className="danger-button" type="button" onClick={() => deleteSupplement(item)}>Delete supplement</button>
        </div>)}</div>
        <button className="admin-add-button" type="button" onClick={addSupplement}>+ Add supplement</button>
      </section>
    </div>
  </main>;
}

function ListingEditor({ breed, breeds, listing, onUpdate, onMove, onRemove, onMediaChange, onUpload }: { breed: BreedGroup; breeds: BreedGroup[]; listing: CattleListing; onUpdate: (field: keyof CattleListing, value: CattleListing[keyof CattleListing]) => void; onMove: (breedId: string) => void; onRemove: () => void; onMediaChange: (media: CattleMedia[]) => void; onUpload: (files: FileList) => void }) {
  const reorder = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= listing.media.length) return;
    const next = [...listing.media];
    [next[index], next[destination]] = [next[destination], next[index]];
    onMediaChange(next);
  };
  return <article className="listing-editor">
    <div className="listing-editor-head"><div><h3>{listing.hindiName || `Cattle ${listing.listingNumber}`}</h3><span>{listing.englishName}</span></div><div className="listing-actions"><button type="button" className={`stock-toggle ${listing.available ? "available" : "sold"}`} onClick={() => onUpdate("available", !listing.available)}>{listing.available ? "Available · Mark out of stock" : "Out of stock · Mark available"}</button><button className="danger-link" type="button" onClick={onRemove}>Remove box</button></div></div>
    <div className="form-row three"><Field id={`number-${listing.id}`} label="Listing number" value={String(listing.listingNumber)} type="number" onChange={(value) => onUpdate("listingNumber", Math.max(1, Number(value) || 1))} /><div className="form-field"><label htmlFor={`breed-${listing.id}`}>Breed</label><select id={`breed-${listing.id}`} value={breed.id} onChange={(event) => onMove(event.target.value)}>{breeds.map((item) => <option key={item.id} value={item.id}>{item.englishName}</option>)}</select></div><div className="form-field status-field"><label>Status</label><strong>{listing.available ? "अभी उपलब्ध" : "अभी उपलब्ध नहीं"}</strong></div></div>
    <div className="form-row"><Field id={`hi-${listing.id}`} label="Hindi cattle name" value={listing.hindiName} onChange={(value) => onUpdate("hindiName", value)} /><Field id={`en-${listing.id}`} label="English cattle name" value={listing.englishName} onChange={(value) => onUpdate("englishName", value)} /></div>
    <Field id={`description-${listing.id}`} label="Description" value={listing.description} onChange={(value) => onUpdate("description", value)} multiline />
    <div className="form-row"><Field id={`milk-${listing.id}`} label="Milk yield" value={listing.milkYield} onChange={(value) => onUpdate("milkYield", value)} /><Field id={`feed-${listing.id}`} label="Feed intake" value={listing.feedIntake} onChange={(value) => onUpdate("feedIntake", value)} /></div>
    <div className="form-row"><Field id={`teeth-${listing.id}`} label="Teeth information" value={listing.teeth} onChange={(value) => onUpdate("teeth", value)} /><Field id={`deworm-${listing.id}`} label="Deworming information" value={listing.deworming} onChange={(value) => onUpdate("deworming", value)} /></div>
    <div className="form-row"><Field id={`calving-${listing.id}`} label="Last-calving information" value={listing.lastCalving} onChange={(value) => onUpdate("lastCalving", value)} /><Field id={`age-${listing.id}`} label="Age" value={listing.age} onChange={(value) => onUpdate("age", value)} /></div>
    <div className="form-row"><Field id={`price-${listing.id}`} label="Price" value={listing.price} onChange={(value) => onUpdate("price", value)} /><div className="form-field checkbox-field"><label htmlFor={`show-price-${listing.id}`}>Public price visibility</label><label className="checkbox-control"><input id={`show-price-${listing.id}`} type="checkbox" checked={listing.showPricePublicly} onChange={(event) => onUpdate("showPricePublicly", event.target.checked)} />Show price publicly</label></div></div>
    <div className="media-admin"><div className="media-admin-head"><div><strong>Photos & videos</strong><span>JPG, JPEG, PNG, WebP, MP4 or WebM</span></div><label className="file-button">Upload media<input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => { if (event.target.files) onUpload(event.target.files); event.target.value = ""; }} /></label></div>
      {listing.media.length ? <div className="media-admin-grid">{listing.media.map((item, index) => <div className="media-admin-item" key={item.id}>{item.type === "video" ? <video src={item.url} muted playsInline controls preload="metadata" /> : <img src={item.url} alt={item.alt || `${listing.hindiName} preview`} />}<Field id={`alt-${item.id}`} label="Accessible label" value={item.alt} onChange={(value) => onMediaChange(listing.media.map((media) => media.id === item.id ? { ...media, alt: value } : media))} /><div className="media-item-actions"><button type="button" onClick={() => reorder(index, -1)} disabled={index === 0} aria-label="Move media earlier">←</button><button type="button" onClick={() => reorder(index, 1)} disabled={index === listing.media.length - 1} aria-label="Move media later">→</button><button type="button" className="danger-link" onClick={() => onMediaChange(listing.media.filter((media) => media.id !== item.id))}>Remove</button></div></div>)}</div> : <div className="empty-media-admin">No media uploaded. The public card will use a clean branded placeholder.</div>}
    </div>
  </article>;
}

function Field({ id, label, value, onChange, multiline = false, type = "text", help }: { id: string; label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; help?: string }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label>{multiline ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} /> : <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />}{help && <small>{help}</small>}</div>;
}

function UploadControl({ label, preview, logo = false, onChange }: { label: string; preview: string; logo?: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="upload-control">{preview ? <img className={`upload-preview ${logo ? "logo-preview" : ""}`} src={preview} alt={`${label} preview`} /> : <div className="upload-preview empty">No image</div>}<div className="upload-copy"><strong>{label}</strong><input type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} /><small>PNG, JPG or WebP · up to 8 MB</small></div></div>;
}

function uploadFile(file: File, onProgress: (progress: number) => void): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");
    request.responseType = "json";
    request.withCredentials = true;
    request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
    request.onerror = () => reject(new Error("Network error while uploading media."));
    request.onload = () => {
      const result = request.response as UploadResult | null;
      if (request.status < 200 || request.status >= 300 || !result?.url) reject(new Error(result?.error || "Media upload failed."));
      else resolve(result);
    };
    request.send(form);
  });
}
