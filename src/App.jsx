import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin, Users, BedDouble, Star, Wifi, Car, UtensilsCrossed, Wind,
  ArrowLeft, CreditCard, ShieldCheck, Ticket, Waves,
  Sun, Phone, Check, Loader2, XCircle
} from "lucide-react";
import Admin from "./Admin.jsx";

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

const AMENITY_META = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  parcare: { icon: Car, label: "Parcare" },
  ac: { icon: Wind, label: "Aer condiționat" },
  bucatarie: { icon: UtensilsCrossed, label: "Bucătărie" },
};
const GRADIENTS = [["#1C6E8C", "#0E3A4C"], ["#3E93A8", "#12242B"], ["#FF6B4A", "#0E3A4C"], ["#7FC8A9", "#0E3A4C"], ["#1C6E8C", "#3E93A8"], ["#E8542F", "#12242B"]];

function fmtRON(n) {
  return n.toLocaleString("ro-RO") + " lei";
}
function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const diff = Math.round((new Date(b) - new Date(a)) / 86400000);
  return diff > 0 ? diff : 0;
}
function RatingStamp({ rating }) {
  return (
    <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px dashed ${C.cream}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(18,36,43,0.55)", color: C.cream }}>
      <Star size={13} fill={C.coral} color={C.coral} />
      <span style={{ ...fontMono, fontSize: 12, marginTop: 2 }}>{rating}</span>
    </div>
  );
}

function AptMedia({ apt, height, children }) {
  const hasImage = apt.image && apt.image.trim().length > 0;
  const grad = GRADIENTS[apt.id % GRADIENTS.length] || GRADIENTS[0];
  return (
    <div style={{ height, position: "relative", overflow: "hidden", background: hasImage ? "#0E3A4C" : `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}>
      {hasImage ? (
        <img src={apt.image} alt={apt.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          <Waves style={{ position: "absolute", bottom: 10, left: 10, width: height * 0.45, height: height * 0.45 }} color={C.cream} />
          <Sun style={{ position: "absolute", top: 14, right: 18, width: height * 0.22, height: height * 0.22 }} color={C.cream} />
        </div>
      )}
      {hasImage && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.25))" }} />}
      {children}
    </div>
  );
}

function ListingCard({ apt, onOpen }) {
  return (
    <button onClick={() => onOpen(apt)} style={{ textAlign: "left", background: "#fff", border: `1px solid ${C.sandDeep}` }}
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 focus:outline-none focus-visible:ring-2">
      <AptMedia apt={apt} height={190}>
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{ ...fontMono, background: C.coral, color: C.cream }} className="text-xs px-2 py-1 rounded-full">{apt.tag}</span>
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 12 }}><RatingStamp rating={apt.rating} /></div>
      </AptMedia>
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

function Header({ onHome, site }) {
  return (
    <header className="w-full sticky top-0 z-30" style={{ background: C.seaDeep }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <button onClick={onHome} className="flex items-center gap-2">
          <Waves color={C.foam} size={22} />
          <span style={{ ...fontDisplay, color: C.cream }} className="text-lg font-semibold tracking-wide">{site.logoPart1}<span style={{ color: C.coral }}>{site.logoPart2}</span></span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs" style={{ ...fontMono, color: C.sand }}><Phone size={13} /> {site.phone}</div>
      </div>
    </header>
  );
}

function Home({ apartments, site, onOpen }) {
  const [zoneFilter, setZoneFilter] = useState("Toate zonele");
  const zones = ["Toate zonele", ...new Set(apartments.map(a => a.zone))];
  const filtered = apartments.filter(a => zoneFilter === "Toate zonele" || a.zone === zoneFilter);

  return (
    <div>
      <section style={{ background: `linear-gradient(180deg, ${C.seaDeep} 0%, ${C.seaMid} 65%, ${C.seaLight} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 30, right: "8%", width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${C.coral} 0%, ${C.coral}00 70%)`, opacity: 0.7 }} />
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-24 relative">
          <p style={{ ...fontMono, color: C.foam }} className="text-xs tracking-[0.2em] uppercase mb-3">{site.logoPart1} {site.logoPart2} · Mamaia</p>
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
        {filtered.length === 0 ? (
          <p style={{ color: C.ink, opacity: 0.6 }} className="text-sm">Nu există cazări în această zonă momentan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(apt => <ListingCard key={apt.id} apt={apt} onOpen={onOpen} />)}
          </div>
        )}
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

function Detail({ apt, onBack, onBook }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(Math.min(2, apt.guests));
  const nights = nightsBetween(checkIn, checkOut);
  const total = nights * apt.price;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-5" style={{ color: C.seaMid }}><ArrowLeft size={16} /> Toate cazările</button>
      <div className="rounded-2xl overflow-hidden mb-6">
        <AptMedia apt={apt} height={280}>
          <div style={{ position: "absolute", top: 16, left: 16 }}><span style={{ ...fontMono, background: C.coral, color: C.cream }} className="text-xs px-3 py-1.5 rounded-full">{apt.tag}</span></div>
        </AptMedia>
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
            {(apt.amenities || []).map(a => {
              const meta = AMENITY_META[a]; if (!meta) return null; const Icon = meta.icon;
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
          apartmentName: booking.apt.name, zone: booking.apt.zone, checkIn: booking.checkIn,
          checkOut: booking.checkOut, nights: booking.nights, guests: booking.guests,
          totalRon: booking.total, guestEmail: email, guestName: name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Eroare la inițierea plății.");
      window.location.href = data.url;
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
              <p className="text-sm mt-1" style={{ color: C.ink, opacity: 0.7 }}>La pasul următor ești dus pe pagina de plată oficială Stripe. Site-ul nostru nu vede și nu stochează niciodată datele cardului.</p>
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

function Confirmation({ sessionId, onHome }) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    fetch(`/api/session-status?session_id=${sessionId}`).then(r => r.json()).then(d => {
      if (d.status === "paid") { setData(d); setState("paid"); } else setState("unpaid");
    }).catch(() => setState("error"));
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

export default function App() {
  const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  const [view, setView] = useState("home");
  const [activeApt, setActiveApt] = useState(null);
  const [booking, setBooking] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [site, setSite] = useState({ logoPart1: "Litoral", logoPart2: "Nord", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);

    if (!isAdmin) {
      const params = new URLSearchParams(window.location.search);
      if (window.location.pathname === "/success" && params.get("session_id")) {
        setSessionId(params.get("session_id"));
        setView("confirmation");
      } else if (window.location.pathname === "/cancel") {
        setView("home");
      }
      Promise.all([
        fetch("/api/admin/apartments").then(r => r.json()),
        fetch("/api/admin/site").then(r => r.json()),
      ]).then(([aptData, siteData]) => {
        setApartments(aptData.apartments || []);
        setSite(siteData.site || site);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
    return () => document.head.removeChild(link);
  }, []);

  if (isAdmin) return <Admin />;

  function goHome() {
    window.history.replaceState({}, "", "/");
    setView("home"); setBooking(null); setActiveApt(null); setSessionId(null);
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin" color={C.seaMid} /></div>;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.cream, minHeight: "100vh" }}>
      <Header onHome={goHome} site={site} />
      {view === "home" && <Home apartments={apartments} site={site} onOpen={(apt) => { setActiveApt(apt); setView("detail"); }} />}
      {view === "detail" && activeApt && <Detail apt={activeApt} onBack={() => setView("home")} onBook={(b) => { setBooking(b); setView("checkout"); }} />}
      {view === "checkout" && booking && <Checkout booking={booking} onBack={() => setView("detail")} />}
      {view === "confirmation" && <Confirmation sessionId={sessionId} onHome={goHome} />}
      <footer className="text-center text-xs py-8" style={{ color: C.ink, opacity: 0.5 }}>© 2026 {site.logoPart1}{site.logoPart2} · Mamaia, România</footer>
    </div>
  );
}
