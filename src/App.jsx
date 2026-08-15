import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin, Users, BedDouble, Star, Wifi, Car, UtensilsCrossed, Wind,
  ArrowLeft, CreditCard, ShieldCheck, Ticket, Waves,
  Sun, Phone, Check, Loader2, XCircle
} from "lucide-react";

/* ---------------------------------------------------------
   TOKENS
--------------------------------------------------------- */
const C = {
  seaDeep: "#0E3A4C",
  seaMid: "#1C6E8C",
  seaLight: "#3E93A8",
  sand: "#F3E7C9",
  sandDeep: "#E8D6A8",
  coral: "#FF6B4A",
  coralDeep: "#E8542F",
  foam: "#7FC8A9",
  ink: "#12242B",
  cream: "#FBF6EA",
};
const fontDisplay = { fontFamily: "'Fraunces', serif" };
const fontMono = { fontFamily: "'Space Mono', monospace" };

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */
const APARTMENTS = [
  { id: 1, name: "Vila Steaua Mării", zone: "Mamaia Nord", tag: "Vedere la mare", rooms: 2, guests: 4, beds: 2, size: 62, price: 420, rating: 4.9, reviews: 128, grad: ["#1C6E8C", "#0E3A4C"], amenities: ["wifi", "parcare", "ac", "bucatarie"], desc: "Apartament luminos la etajul 3, cu balcon larg deschis spre promenadă și mare. Bucătărie complet utilată, ideal pentru familii care vor liniște, dar aproape de plajă." },
  { id: 2, name: "Rezidence Faleza", zone: "Mamaia Centru", tag: "La 2 minute de plajă", rooms: 1, guests: 2, beds: 1, size: 38, price: 310, rating: 4.7, reviews: 94, grad: ["#3E93A8", "#12242B"], amenities: ["wifi", "ac", "bucatarie"], desc: "Studio elegant, recent renovat, perfect pentru cupluri. Faleza și terasele animate sunt chiar la ușă." },
  { id: 3, name: "Cazino Residence", zone: "Mamaia Centru", tag: "Zonă animată", rooms: 3, guests: 6, beds: 3, size: 84, price: 590, rating: 4.8, reviews: 201, grad: ["#FF6B4A", "#0E3A4C"], amenities: ["wifi", "parcare", "ac", "bucatarie"], desc: "Apartament spațios pe trei camere, potrivit pentru grupuri sau familii extinse. Aproape de cluburile de plajă și restaurante." },
  { id: 4, name: "Vila Sat Pescăresc", zone: "Mamaia Sat", tag: "Liniște & natură", rooms: 2, guests: 5, beds: 2, size: 58, price: 350, rating: 4.6, reviews: 67, grad: ["#7FC8A9", "#0E3A4C"], amenities: ["wifi", "parcare", "bucatarie"], desc: "Retras de forfotă, cu grădină umbrită și acces facil spre lac și plajă. Bun pentru un sejur relaxat, departe de aglomerație." },
  { id: 5, name: "Nordis Bay", zone: "Mamaia Nord", tag: "Bloc nou, 2024", rooms: 2, guests: 4, beds: 2, size: 55, price: 480, rating: 4.9, reviews: 53, grad: ["#1C6E8C", "#3E93A8"], amenities: ["wifi", "parcare", "ac", "bucatarie"], desc: "Bloc nou cu piscină exterioară și acces privat pe plajă. Finisaje premium, ideal pentru un sejur de familie fără compromisuri." },
  { id: 6, name: "Perla Mamaia", zone: "Mamaia Sud", tag: "Raport calitate-preț", rooms: 1, guests: 3, beds: 1, size: 34, price: 260, rating: 4.5, reviews: 142, grad: ["#E8542F", "#12242B"], amenities: ["wifi", "ac"], desc: "Garsonieră practică, curată, la 5 minute de plajă pe jos. Opțiune bună pentru un sejur scurt și accesibil." },
];

const AMENITY_META = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parcare: { icon: Car, label: "Parcare" },
  ac: { icon: Wind, label: "Aer condiționat" },
  bucatarie: { icon: UtensilsCrossed, label: "Bucătărie" },
};

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */
function fmtRON(n) {
  return n.toLocaleString("ro-RO") + " lei";
}
function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const diff = Math.round((new Date(b) - new Date(a)) / 86400000);
  return diff > 0 ? diff : 0;
}
function WaveDivider({ fill = C.cream }) {
  return (
    <div style={{ lineHeight: 0 }}>
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ width: "100%", height: "70px", display: "block" }}>
        <path d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,40 L1440,90 L0,90 Z" fill={fill} />
      </svg>
    </div>
  );
}
function RatingStamp({ rating }) {
  return (
    <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px dashed ${C.cream}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(18,36,43,0.55)", color: C.cream }}>
      <Star size={13} fill={C.coral} color={C.coral} />
      <span style={{ ...fontMono, fontSize: 12, marginTop: 2 }}>{rating}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   LISTING CARD
--------------------------------------------------------- */
function ListingCard({ apt, onOpen }) {
  return (
    <button onClick={() => onOpen(apt)} style={{ textAlign: "left", background: "#fff", border: `1px solid ${C.sandDeep}` }}
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 focus:outline-none focus-visible:ring-2">
      <div style={{ height: 190, background: `linear-gradient(135deg, ${apt.grad[0]}, ${apt.grad[1]})`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          <Waves style={{ position: "absolute", bottom: 10, left: 10, width: 90, height: 90 }} color={C.cream} />
          <Sun style={{ position: "absolute", top: 14, right: 18, width: 44, height: 44 }} color={C.cream} />
        </div>
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{ ...fontMono, background: C.coral, color: C.cream }} className="text-xs px-2 py-1 rounded-full">{apt.tag}</span>
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 12 }}><RatingStamp rating={apt.rating} /></div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.seaMid }}><MapPin size={13} /> {apt.zone}</div>
        <h3 style={{ ...fontDisplay, color: C.ink }} className="text-lg font-semibold leading-snug">{apt.name}</h3>
        <div className="flex items-center gap-3 text-xs mt-2" style={{ color: C.ink, opacity: 0.7 }}>
          <span className="flex items-center gap-1"><Users size={13} />{apt.guests} oaspeți</span>
          <span className="flex items-center gap-1"><BedDouble size={13} />{apt.beds} dormitor{apt.beds > 1 ? "e" : ""}</span>
          <span>{apt.size} m²</span>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div><span style={{ ...fontDisplay, color: C.seaDeep }} className="text-xl font-bold">{fmtRON(apt.price)}</span><span className="text-xs" style={{ color: C.ink, opacity: 0.6 }}> / noapte</span></div>
          <span className="text-xs font-medium" style={{ color: C.coralDeep }}>Vezi detalii →</span>
        </div>
      </div>
    </button>
  );
}

function Header({ onHome }) {
  return (
    <header className="w-full sticky top-0 z-30" style={{ background: C.seaDeep }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <button onClick={onHome} className="flex items-center gap-2">
          <Waves color={C.foam} size={22} />
          <span style={{ ...fontDisplay, color: C.cream }} className="text-lg font-semibold tracking-wide">Litoral<span style={{ color: C.coral }}>Nord</span></span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs" style={{ ...fontMono, color: C.sand }}><Phone size={13} /> 0723 000 111</div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------
   HOME
--------------------------------------------------------- */
function Home({ onOpen }) {
  const [zoneFilter, setZoneFilter] = useState("Toate zonele");
  const zones = ["Toate zonele", ...new Set(APARTMENTS.map(a => a.zone))];
  const filtered = APARTMENTS.filter(a => zoneFilter === "Toate zonele" || a.zone === zoneFilter);

  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${C.seaDeep} 0%, ${C.seaMid} 65%, ${C.seaLight} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 30, right: "8%", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${C.coral} 0%, ${C.coral}00 70%)`, opacity: 0.7 }} />
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-24 relative">
          <p style={{ ...fontMono, color: C.foam }} className="text-xs tracking-[0.2em] uppercase mb-3">Litoral Nord · Mamaia</p>
          <h1 style={{ ...fontDisplay, color: C.cream }} className="text-4xl sm:text-5xl font-semibold leading-[1.05] max-w-xl">Vacanța ta la mare, rezervată în câteva minute.</h1>
          <p style={{ color: C.sand }} className="mt-4 max-w-md text-[15px] leading-relaxed">Apartamente verificate în Mamaia, plată online securizată prin Stripe și confirmare instant.</p>
        </div>
        <div className="max-w-4xl mx-auto px-5" style={{ position: "relative", marginTop: -40 }}>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: C.cream, boxShadow: "0 20px 40px rgba(14,58,76,0.25)" }}>
            <span className="text-xs" style={{ color: C.seaMid, ...fontMono }}>Filtrează:</span>
            <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} className="text-sm rounded-lg px-2 py-2 border flex-1" style={{ borderColor: C.sandDeep, color: C.ink }}>
              {zones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 style={{ ...fontDisplay, color: C.ink }} className="text-2xl font-semibold">{filtered.length} cazări disponibile</h2>
          <span className="text-xs" style={{ color: C.seaMid, ...fontMono }}>Prețuri afișate / noapte</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(apt => <ListingCard key={apt.id} apt={apt} onOpen={onOpen} />)}
        </div>
      </section>

      <section style={{ background: C.sand }} className="py-10 mt-6">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3"><ShieldCheck size={20} color={C.seaDeep} /><div><b style={{ color: C.ink }}>Plată securizată prin Stripe</b><p style={{ color: C.ink, opacity: 0.7 }}>Cardul tău e procesat direct de Stripe, niciodată de serverul nostru.</p></div></div>
          <div className="flex items-start gap-3"><Check size={20} color={C.seaDeep} /><div><b style={{ color: C.ink }}>Confirmare instant</b><p style={{ color: C.ink, opacity: 0.7 }}>Primești biletul de rezervare imediat după plată.</p></div></div>
          <div className="flex items-start gap-3"><Ticket size={20} color={C.seaDeep} /><div><b style={{ color: C.ink }}>Fără taxe ascunse</b><p style={{ color: C.ink, opacity: 0.7 }}>Prețul afișat e prețul final plătit la rezervare.</p></div></div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------
   DETAIL
--------------------------------------------------------- */
function Detail({ apt, onBack, onBook }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const nights = nightsBetween(checkIn, checkOut);
  const total = nights * apt.price;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-5" style={{ color: C.seaMid }}><ArrowLeft size={16} /> Toate cazările</button>
      <div style={{ height: 280, background: `linear-gradient(135deg, ${apt.grad[0]}, ${apt.grad[1]})`, position: "relative" }} className="rounded-2xl overflow-hidden mb-6">
        <div style={{ position: "absolute", inset: 0, opacity: 0.2 }}>
          <Waves style={{ position: "absolute", bottom: -10, left: 20, width: 220, height: 220 }} color={C.cream} />
          <Sun style={{ position: "absolute", top: 24, right: 40, width: 70, height: 70 }} color={C.cream} />
        </div>
        <div style={{ position: "absolute", top: 16, left: 16 }}><span style={{ ...fontMono, background: C.coral, color: C.cream }} className="text-xs px-3 py-1.5 rounded-full">{apt.tag}</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1 text-xs mb-1" style={{ color: C.seaMid }}><MapPin size={13} /> {apt.zone}</div>
          <h1 style={{ ...fontDisplay, color: C.ink }} className="text-3xl font-semibold">{apt.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: C.ink }}><Star size={15} fill={C.coral} color={C.coral} /> {apt.rating} · {apt.reviews} recenzii</div>
          <div className="flex items-center gap-5 mt-4 text-sm" style={{ color: C.ink, opacity: 0.75 }}>
            <span className="flex items-center gap-1"><Users size={15} />{apt.guests} oaspeți</span>
            <span className="flex items-center gap-1"><BedDouble size={15} />{apt.beds} dormitor{apt.beds > 1 ? "e" : ""}</span>
            <span>{apt.size} m²</span>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed" style={{ color: C.ink, opacity: 0.85 }}>{apt.desc}</p>
          <h3 style={{ ...fontDisplay, color: C.ink }} className="text-lg font-semibold mt-7 mb-3">Facilități</h3>
          <div className="grid grid-cols-2 gap-3">
            {apt.amenities.map(a => {
              const meta = AMENITY_META[a]; const Icon = meta.icon;
              return <div key={a} className="flex items-center gap-2 text-sm rounded-lg px-3 py-2" style={{ background: C.sand, color: C.ink }}><Icon size={16} color={C.seaDeep} /> {meta.label}</div>;
            })}
          </div>
        </div>

        <div>
          <div className="rounded-2xl p-5 sticky top-20" style={{ background: "#fff", border: `1px solid ${C.sandDeep}`, boxShadow: "0 10px 30px rgba(14,58,76,0.08)" }}>
            <div className="flex items-baseline gap-1 mb-4"><span style={{ ...fontDisplay, color: C.seaDeep }} className="text-2xl font-bold">{fmtRON(apt.price)}</span><span className="text-xs" style={{ color: C.ink, opacity: 0.6 }}>/ noapte</span></div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="flex flex-col"><span className="text-[10px] uppercase mb-1" style={{ color: C.seaMid, ...fontMono }}>Check-in</span><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="text-sm rounded-lg px-2 py-2 border" style={{ borderColor: C.sandDeep }} /></label>
              <label className="flex flex-col"><span className="text-[10px] uppercase mb-1" style={{ color: C.seaMid, ...fontMono }}>Check-out</span><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="text-sm rounded-lg px-2 py-2 border" style={{ borderColor: C.sandDeep }} /></label>
            </div>
            <label className="flex flex-col mb-4"><span className="text-[10px] uppercase mb-1" style={{ color: C.seaMid, ...fontMono }}>Oaspeți</span>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="text-sm rounded-lg px-2 py-2 border" style={{ borderColor: C.sandDeep }}>
                {Array.from({ length: apt.guests }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} pers.</option>)}
              </select>
            </label>
            {nights > 0 && (
              <div className="text-sm mb-4 space-y-1" style={{ color: C.ink }}>
                <div className="flex justify-between"><span style={{ opacity: 0.7 }}>{fmtRON(apt.price)} × {nights} nopți</span><span>{fmtRON(total)}</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t" style={{ borderColor: C.sandDeep }}><span>Total</span><span>{fmtRON(total)}</span></div>
              </div>
            )}
            <button disabled={nights <= 0} onClick={() => onBook({ apt, checkIn, checkOut, guests, nights, total })}
              className="w-full rounded-lg text-sm font-semibold py-3 flex items-center justify-center gap-2 disabled:opacity-40" style={{ background: C.coral, color: C.cream }}>
              {nights > 0 ? "Rezervă și plătește" : "Alege datele sejurului"}
            </button>
            <p className="text-[11px] text-center mt-2" style={{ color: C.ink, opacity: 0.55 }}>Nu ești taxat până la ultimul pas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CHECKOUT — redirects to real Stripe Checkout
--------------------------------------------------------- */
function Checkout({ booking, onBack }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailOk = /\S+@\S+\.\S+/.test(email);

  async function handlePay() {
    if (!emailOk || name.trim().length < 2) {
      setError("Completează numele și un email valid.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartmentName: booking.apt.name,
          zone: booking.apt.zone,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          guests: booking.guests,
          totalRon: booking.total,
          guestEmail: email,
          guestName: name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Eroare la inițierea plății.");
      window.location.href = data.url; // redirect către pagina de plată Stripe
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-5" style={{ color: C.seaMid }}><ArrowLeft size={16} /> Înapoi la cazare</button>
      <h1 style={{ ...fontDisplay, color: C.ink }} className="text-2xl font-semibold mb-6">Finalizează rezervarea</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${C.sandDeep}` }}>
            <h3 style={{ ...fontDisplay, color: C.ink }} className="font-semibold mb-4">Date de contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Nume și prenume" value={name} onChange={e => setName(e.target.value)} className="text-sm rounded-lg px-3 py-2.5 border sm:col-span-2" style={{ borderColor: C.sandDeep }} />
              <input placeholder="Email (primești biletul aici)" value={email} onChange={e => setEmail(e.target.value)} className="text-sm rounded-lg px-3 py-2.5 border sm:col-span-2" style={{ borderColor: C.sandDeep }} />
            </div>
          </div>

          <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "#fff", border: `1px solid ${C.sandDeep}` }}>
            <CreditCard size={20} color={C.seaDeep} className="mt-0.5" />
            <div>
              <h3 style={{ ...fontDisplay, color: C.ink }} className="font-semibold">Plată securizată prin Stripe</h3>
              <p className="text-sm mt-1" style={{ color: C.ink, opacity: 0.7 }}>
                La pasul următor ești dus pe pagina de plată oficială Stripe, unde introduci datele cardului.
                Site-ul nostru nu vede și nu stochează niciodată aceste date.
              </p>
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: C.coralDeep }}>{error}</p>}
        </div>

        <div>
          <div className="rounded-2xl p-5 sticky top-20" style={{ background: C.seaDeep, color: C.cream }}>
            <h3 style={{ ...fontDisplay }} className="font-semibold mb-3">{booking.apt.name}</h3>
            <div className="text-xs space-y-1.5 opacity-90 mb-4" style={fontMono}>
              <div className="flex justify-between"><span>Check-in</span><span>{booking.checkIn}</span></div>
              <div className="flex justify-between"><span>Check-out</span><span>{booking.checkOut}</span></div>
              <div className="flex justify-between"><span>Oaspeți</span><span>{booking.guests}</span></div>
              <div className="flex justify-between"><span>Nopți</span><span>{booking.nights}</span></div>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/20 mb-5"><span style={fontDisplay}>Total</span><span style={fontDisplay}>{fmtRON(booking.total)}</span></div>
            <button onClick={handlePay} disabled={loading} className="w-full rounded-lg text-sm font-semibold py-3 flex items-center justify-center gap-2" style={{ background: C.coral, color: C.cream }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Se conectează la Stripe…</> : `Continuă spre plată — ${fmtRON(booking.total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CONFIRMATION — verifies real session with the backend
--------------------------------------------------------- */
function Confirmation({ sessionId, onHome }) {
  const [state, setState] = useState("loading"); // loading | paid | unpaid | error
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    fetch(`/api/session-status?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === "paid") { setData(d); setState("paid"); }
        else setState("unpaid");
      })
      .catch(() => setState("error"));
  }, [sessionId]);

  const code = useMemo(() => "MMA-" + sessionId?.slice(-8).toUpperCase(), [sessionId]);

  if (state === "loading") {
    return <div className="max-w-2xl mx-auto px-5 py-24 flex flex-col items-center"><Loader2 className="animate-spin" size={28} color={C.seaMid} /><p className="mt-3 text-sm" style={{ color: C.ink }}>Confirmăm plata cu Stripe…</p></div>;
  }
  if (state !== "paid") {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 flex flex-col items-center text-center">
        <XCircle color={C.coralDeep} size={32} />
        <h1 style={{ ...fontDisplay, color: C.ink }} className="text-xl font-semibold mt-3">Nu am putut confirma plata</h1>
        <p className="text-sm mt-2" style={{ color: C.ink, opacity: 0.7 }}>Dacă banii au fost reținuți, ne revenim automat — altfel poți relua rezervarea.</p>
        <button onClick={onHome} className="mt-6 text-sm font-semibold rounded-lg px-5 py-3" style={{ background: C.sand, color: C.ink }}>Înapoi la cazări</button>
      </div>
    );
  }

  const m = data.metadata;
  return (
    <div className="max-w-2xl mx-auto px-5 py-14 flex flex-col items-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.foam }}><Check color={C.ink} /></div>
      <h1 style={{ ...fontDisplay, color: C.ink }} className="text-2xl font-semibold mb-1">Plată confirmată</h1>
      <p className="text-sm mb-8" style={{ color: C.ink, opacity: 0.7 }}>Biletul tău de rezervare a fost trimis la {data.customer_email}</p>

      <div className="w-full rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 40px rgba(14,58,76,0.2)" }}>
        <div style={{ background: C.seaDeep, color: C.cream }} className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p style={{ ...fontMono }} className="text-[10px] tracking-[0.2em] opacity-70 uppercase">Bilet de cazare</p>
              <h2 style={{ ...fontDisplay }} className="text-xl font-semibold mt-1">{m.apartmentName}</h2>
              <p className="text-xs opacity-80 mt-1 flex items-center gap-1"><MapPin size={12} />{m.zone}, Mamaia</p>
            </div>
            <Ticket color={C.coral} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6" style={fontMono}>
            <div><p className="text-[10px] opacity-60 uppercase">Check-in</p><p className="text-sm mt-1">{m.checkIn}</p></div>
            <div><p className="text-[10px] opacity-60 uppercase">Check-out</p><p className="text-sm mt-1">{m.checkOut}</p></div>
            <div><p className="text-[10px] opacity-60 uppercase">Oaspeți</p><p className="text-sm mt-1">{m.guests}</p></div>
          </div>
        </div>
        <div style={{ borderTop: `2px dashed ${C.sandDeep}` }} />
        <div style={{ background: "#fff" }} className="p-6 flex items-center justify-between">
          <div><p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.seaMid, ...fontMono }}>Cod rezervare</p><p style={{ ...fontDisplay, color: C.ink }} className="text-lg font-bold">{code}</p></div>
          <div className="text-right"><p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.seaMid, ...fontMono }}>Total plătit</p><p style={{ ...fontDisplay, color: C.coralDeep }} className="text-lg font-bold">{fmtRON(data.amount_total / 100)}</p></div>
        </div>
      </div>
      <button onClick={onHome} className="mt-8 text-sm font-semibold rounded-lg px-5 py-3" style={{ background: C.sand, color: C.ink }}>Înapoi la cazări</button>
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT
--------------------------------------------------------- */
export default function App() {
  const [view, setView] = useState("home");
  const [activeApt, setActiveApt] = useState(null);
  const [booking, setBooking] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);

    // Detectează întoarcerea de la Stripe (success / cancel)
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === "/success" && params.get("session_id")) {
      setSessionId(params.get("session_id"));
      setView("confirmation");
    } else if (window.location.pathname === "/cancel") {
      setView("home");
    }
    return () => document.head.removeChild(link);
  }, []);

  function goHome() {
    window.history.replaceState({}, "", "/");
    setView("home"); setBooking(null); setActiveApt(null); setSessionId(null);
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.cream, minHeight: "100vh" }}>
      <Header onHome={goHome} />
      {view === "home" && <Home onOpen={(apt) => { setActiveApt(apt); setView("detail"); }} />}
      {view === "detail" && activeApt && <Detail apt={activeApt} onBack={() => setView("home")} onBook={(b) => { setBooking(b); setView("checkout"); }} />}
      {view === "checkout" && booking && <Checkout booking={booking} onBack={() => setView("detail")} />}
      {view === "confirmation" && <Confirmation sessionId={sessionId} onHome={goHome} />}
      <footer className="text-center text-xs py-8" style={{ color: C.ink, opacity: 0.5 }}>© 2026 LitoralNord · Mamaia, România</footer>
    </div>
  );
}
