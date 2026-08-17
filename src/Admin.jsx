import React, { useState, useEffect, useRef } from "react";
import { Lock, Plus, Trash2, Pencil, Upload, Loader2, Check, X, Waves } from "lucide-react";

const C = {
  seaDeep: "#0E3A4C",
  seaMid: "#1C6E8C",
  sand: "#F3E7C9",
  sandDeep: "#E8D6A8",
  coral: "#FF6B4A",
  coralDeep: "#E8542F",
  ink: "#12242B",
  cream: "#FBF6EA",
};

const ZONES = ["Mamaia Nord", "Mamaia Centru", "Mamaia Sat", "Mamaia Sud"];
const AMENITY_OPTIONS = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "parcare", label: "Parcare" },
  { key: "ac", label: "Aer condiționat" },
  { key: "bucatarie", label: "Bucătărie" },
];

const EMPTY_APT = {
  name: "", zone: ZONES[0], tag: "", rooms: 1, guests: 2, beds: 1, size: 30,
  price: 300, rating: 4.8, reviews: 0, images: [], amenities: [], desc: "",
};

function authHeaders(password) {
  return { "Content-Type": "application/json", "x-admin-password": password };
}

/* ---------------- LOGIN GATE ---------------- */
function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/apartments", { method: "PUT", headers: authHeaders(password), body: JSON.stringify({ id: "__ping__" }) }).catch(() => null);
    setLoading(false);
    if (!res || res.status === 401) {
      setError("Parolă greșită.");
      return;
    }
    sessionStorage.setItem("admin_password", password);
    onSuccess(password);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.seaDeep, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.cream, borderRadius: 20, padding: 28, maxWidth: 380, width: "100%" }}>
        <div className="flex items-center gap-2 mb-5">
          <Waves color={C.seaDeep} size={22} />
          <span style={{ color: C.ink, fontWeight: 600, fontSize: 18 }}>Panou de administrare</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5 mb-3" style={{ borderColor: C.sandDeep }}>
          <Lock size={16} color={C.seaMid} />
          <input
            type="password"
            placeholder="Parola de administrator"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="text-sm w-full outline-none bg-transparent"
          />
        </div>
        {error && <p className="text-xs mb-3" style={{ color: C.coralDeep }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading || !password}
          className="w-full rounded-lg text-sm font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: C.coral, color: C.cream }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Intră"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- GALLERY UPLOAD FIELD (mai multe poze) ---------------- */
function GalleryUploadField({ value, onChange, password }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const images = value || [];

  function uploadOne(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            headers: authHeaders(password),
            body: JSON.stringify({ filename: file.name, dataUrl: reader.result }),
          });
          const data = await res.json();
          resolve(res.ok ? data.url : null);
        } catch {
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const url = await uploadOne(file);
      if (url) urls.push(url);
    }
    onChange([...images, ...urls]);
    setUploading(false);
  }

  function removeAt(idx) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <span className="text-xs uppercase mb-1 block" style={{ color: C.seaMid }}>
        Poze apartament {images.length > 0 && `(${images.length})`}
      </span>
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {images.map((url, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              <img src={url} alt="" style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8 }} />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: C.coralDeep, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={12} />
              </button>
              {idx === 0 && (
                <span style={{ position: "absolute", bottom: 2, left: 2, background: "rgba(14,58,76,0.85)", color: C.cream, fontSize: 9, padding: "1px 5px", borderRadius: 4 }}>
                  copertă
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5"
        style={{ background: C.sand, color: C.ink }}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {uploading ? "Se încarcă…" : "Adaugă poze"}
      </button>
      <p className="text-[10px] mt-1" style={{ color: C.ink, opacity: 0.55 }}>
        Prima poză devine coperta afișată în listă. Poți alege mai multe deodată.
      </p>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

/* ---------------- APARTMENT FORM ---------------- */
function AptForm({ initial, onSave, onCancel, password }) {
  const [apt, setApt] = useState({ ...initial, images: initial.images || [] });
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setApt((a) => ({ ...a, [field]: value }));
  }
  function toggleAmenity(key) {
    setApt((a) => ({
      ...a,
      amenities: a.amenities.includes(key) ? a.amenities.filter((x) => x !== key) : [...a.amenities, key],
    }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(apt);
    setSaving(false);
  }

  const inputCls = "text-sm rounded-lg px-3 py-2 border w-full";
  const inputStyle = { borderColor: C.sandDeep };

  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: `1px solid ${C.sandDeep}` }}>
      <input placeholder="Nume apartament" value={apt.name} onChange={(e) => set("name", e.target.value)} className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-3">
        <select value={apt.zone} onChange={(e) => set("zone", e.target.value)} className={inputCls} style={inputStyle}>
          {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <input placeholder="Etichetă (ex: Vedere la mare)" value={apt.tag} onChange={(e) => set("tag", e.target.value)} className={inputCls} style={inputStyle} />
      </div>
      <div className="grid grid-cols-4 gap-3">
        <label className="text-xs" style={{ color: C.seaMid }}>Camere
          <input type="number" min="1" value={apt.rooms} onChange={(e) => set("rooms", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
        <label className="text-xs" style={{ color: C.seaMid }}>Oaspeți
          <input type="number" min="1" value={apt.guests} onChange={(e) => set("guests", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
        <label className="text-xs" style={{ color: C.seaMid }}>Dormitoare
          <input type="number" min="1" value={apt.beds} onChange={(e) => set("beds", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
        <label className="text-xs" style={{ color: C.seaMid }}>m²
          <input type="number" min="1" value={apt.size} onChange={(e) => set("size", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs" style={{ color: C.seaMid }}>Preț / noapte (lei)
          <input type="number" min="1" value={apt.price} onChange={(e) => set("price", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
        <label className="text-xs" style={{ color: C.seaMid }}>Rating (1-5)
          <input type="number" min="1" max="5" step="0.1" value={apt.rating} onChange={(e) => set("rating", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
        <label className="text-xs" style={{ color: C.seaMid }}>Nr. recenzii
          <input type="number" min="0" value={apt.reviews} onChange={(e) => set("reviews", Number(e.target.value))} className={inputCls} style={inputStyle} />
        </label>
      </div>
      <textarea placeholder="Descriere" value={apt.desc} onChange={(e) => set("desc", e.target.value)} rows={3} className={inputCls} style={inputStyle} />
      <div>
        <span className="text-xs uppercase mb-1 block" style={{ color: C.seaMid }}>Facilități</span>
        <div className="flex gap-2 flex-wrap">
          {AMENITY_OPTIONS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => toggleAmenity(a.key)}
              className="text-xs px-3 py-1.5 rounded-full border"
              style={{
                borderColor: C.sandDeep,
                background: apt.amenities.includes(a.key) ? C.seaDeep : "#fff",
                color: apt.amenities.includes(a.key) ? C.cream : C.ink,
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <GalleryUploadField value={apt.images} onChange={(images) => set("images", images)} password={password} />
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} disabled={saving || !apt.name} className="flex-1 rounded-lg text-sm font-semibold py-2.5 flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: C.coral, color: C.cream }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salvează
        </button>
        <button onClick={onCancel} className="rounded-lg text-sm px-4 py-2.5 flex items-center gap-1.5" style={{ background: C.sand, color: C.ink }}>
          <X size={15} /> Anulează
        </button>
      </div>
    </div>
  );
}

/* ---------------- MAIN ADMIN PAGE ---------------- */
export default function Admin() {
  const [password, setPassword] = useState(sessionStorage.getItem("admin_password") || "");
  const [authed, setAuthed] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [site, setSite] = useState({ logoPart1: "", logoPart2: "", phone: "" });
  const [siteSaving, setSiteSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!password) return;
    fetch("/api/admin/site").then((r) => r.json()).then((d) => {
      setSite(d.site);
      setAuthed(true);
    });
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/apartments").then((r) => r.json()).then((d) => {
      setApartments(d.apartments || []);
      setLoading(false);
    });
  }, [authed]);

  function handleLoginSuccess(pw) {
    setPassword(pw);
    setAuthed(true);
    fetch("/api/admin/site").then((r) => r.json()).then((d) => setSite(d.site));
    fetch("/api/admin/apartments").then((r) => r.json()).then((d) => {
      setApartments(d.apartments || []);
      setLoading(false);
    });
  }

  async function saveSite() {
    setSiteSaving(true);
    await fetch("/api/admin/site", { method: "PUT", headers: authHeaders(password), body: JSON.stringify(site) });
    setSiteSaving(false);
  }

  async function addApartment(apt) {
    const res = await fetch("/api/admin/apartments", { method: "POST", headers: authHeaders(password), body: JSON.stringify(apt) });
    const data = await res.json();
    setApartments(data.apartments);
    setAdding(false);
  }

  async function updateApartment(apt) {
    const res = await fetch("/api/admin/apartments", { method: "PUT", headers: authHeaders(password), body: JSON.stringify(apt) });
    const data = await res.json();
    setApartments(data.apartments);
    setEditingId(null);
  }

  async function deleteApartment(id) {
    if (!confirm("Ștergi acest apartament definitiv?")) return;
    const res = await fetch(`/api/admin/apartments?id=${id}`, { method: "DELETE", headers: authHeaders(password) });
    const data = await res.json();
    setApartments(data.apartments);
  }

  if (!authed) return <LoginGate onSuccess={handleLoginSuccess} />;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ background: C.seaDeep }} className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves color={C.cream} size={20} />
          <span style={{ color: C.cream, fontWeight: 600 }}>Administrare LitoralNord</span>
        </div>
        <a href="/" style={{ color: C.sand }} className="text-xs underline">Vezi site-ul</a>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* SITE SETTINGS */}
        <section>
          <h2 style={{ color: C.ink }} className="font-semibold mb-3">Setări generale</h2>
          <div className="rounded-2xl p-5 space-y-3" style={{ background: "#fff", border: `1px solid ${C.sandDeep}` }}>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs" style={{ color: C.seaMid }}>Nume site — partea 1
                <input value={site.logoPart1} onChange={(e) => setSite((s) => ({ ...s, logoPart1: e.target.value }))} className="text-sm rounded-lg px-3 py-2 border w-full" style={{ borderColor: C.sandDeep }} />
              </label>
              <label className="text-xs" style={{ color: C.seaMid }}>Nume site — partea 2 (colorată)
                <input value={site.logoPart2} onChange={(e) => setSite((s) => ({ ...s, logoPart2: e.target.value }))} className="text-sm rounded-lg px-3 py-2 border w-full" style={{ borderColor: C.sandDeep }} />
              </label>
            </div>
            <label className="text-xs" style={{ color: C.seaMid }}>Telefon de contact
              <input value={site.phone} onChange={(e) => setSite((s) => ({ ...s, phone: e.target.value }))} className="text-sm rounded-lg px-3 py-2 border w-full" style={{ borderColor: C.sandDeep }} />
            </label>
            <button onClick={saveSite} disabled={siteSaving} className="rounded-lg text-sm font-semibold px-4 py-2 flex items-center gap-2" style={{ background: C.seaDeep, color: C.cream }}>
              {siteSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Salvează setările
            </button>
          </div>
        </section>

        {/* APARTMENTS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ color: C.ink }} className="font-semibold">Apartamente ({apartments.length})</h2>
            {!adding && (
              <button onClick={() => setAdding(true)} className="text-xs rounded-lg px-3 py-2 flex items-center gap-1.5" style={{ background: C.coral, color: C.cream }}>
                <Plus size={14} /> Adaugă apartament
              </button>
            )}
          </div>

          {adding && (
            <div className="mb-4">
              <AptForm initial={EMPTY_APT} onSave={addApartment} onCancel={() => setAdding(false)} password={password} />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" color={C.seaMid} /></div>
          ) : (
            <div className="space-y-3">
              {apartments.map((apt) =>
                editingId === apt.id ? (
                  <AptForm key={apt.id} initial={apt} onSave={updateApartment} onCancel={() => setEditingId(null)} password={password} />
                ) : (
                  <div key={apt.id} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fff", border: `1px solid ${C.sandDeep}` }}>
                    {apt.images && apt.images[0] ? (
                      <img src={apt.images[0]} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: C.sand }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={{ color: C.ink }} className="font-medium text-sm truncate">{apt.name}</p>
                      <p style={{ color: C.seaMid }} className="text-xs">{apt.zone} · {apt.price} lei/noapte · {(apt.images || []).length} poze</p>
                    </div>
                    <button onClick={() => setEditingId(apt.id)} className="p-2 rounded-lg" style={{ background: C.sand }}>
                      <Pencil size={14} color={C.ink} />
                    </button>
                    <button onClick={() => deleteApartment(apt.id)} className="p-2 rounded-lg" style={{ background: C.sand }}>
                      <Trash2 size={14} color={C.coralDeep} />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
