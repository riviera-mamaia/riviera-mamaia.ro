import { kv } from "@vercel/kv";

const SEED = [
  { id: 1, name: "Vila Steaua Mării", zone: "Mamaia Nord", tag: "Vedere la mare", rooms: 2, guests: 4, beds: 2, size: 62, price: 420, rating: 4.9, reviews: 128, images: [], amenities: ["wifi", "parcare", "ac", "bucatarie"], desc: "Apartament luminos la etajul 3, cu balcon larg deschis spre promenadă și mare." },
  { id: 2, name: "Rezidence Faleza", zone: "Mamaia Centru", tag: "La 2 minute de plajă", rooms: 1, guests: 2, beds: 1, size: 38, price: 310, rating: 4.7, reviews: 94, images: [], amenities: ["wifi", "ac", "bucatarie"], desc: "Studio elegant, recent renovat, perfect pentru cupluri." },
  { id: 3, name: "Cazino Residence", zone: "Mamaia Centru", tag: "Zonă animată", rooms: 3, guests: 6, beds: 3, size: 84, price: 590, rating: 4.8, reviews: 201, images: [], amenities: ["wifi", "parcare", "ac", "bucatarie"], desc: "Apartament spațios pe trei camere, potrivit pentru grupuri sau familii extinse." },
  { id: 4, name: "Vila Sat Pescăresc", zone: "Mamaia Sat", tag: "Liniște & natură", rooms: 2, guests: 5, beds: 2, size: 58, price: 350, rating: 4.6, reviews: 67, images: [], amenities: ["wifi", "parcare", "bucatarie"], desc: "Retras de forfotă, cu grădină umbrită și acces facil spre lac și plajă." },
  { id: 5, name: "Nordis Bay", zone: "Mamaia Nord", tag: "Bloc nou, 2024", rooms: 2, guests: 4, beds: 2, size: 55, price: 480, rating: 4.9, reviews: 53, images: [], amenities: ["wifi", "parcare", "ac", "bucatarie"], desc: "Bloc nou cu piscină exterioară și acces privat pe plajă." },
  { id: 6, name: "Perla Mamaia", zone: "Mamaia Sud", tag: "Raport calitate-preț", rooms: 1, guests: 3, beds: 1, size: 34, price: 260, rating: 4.5, reviews: 142, images: [], amenities: ["wifi", "ac"], desc: "Garsonieră practică, curată, la 5 minute de plajă pe jos." },
];

// Aduce fiecare apartament la formatul nou (images: []), păstrând poza veche dacă exista una singură.
function normalize(apt) {
  if (Array.isArray(apt.images)) return apt;
  const images = apt.image ? [apt.image] : [];
  const { image, ...rest } = apt;
  return { ...rest, images };
}

function isAuthed(req) {
  const pass = req.headers["x-admin-password"];
  return !!pass && pass === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      let apartments = await kv.get("apartments");
      if (!apartments) {
        apartments = SEED;
        await kv.set("apartments", apartments);
      }
      apartments = apartments.map(normalize);
      return res.status(200).json({ apartments });
    }

    if (!isAuthed(req)) {
      return res.status(401).json({ error: "Parolă incorectă." });
    }

    if (req.method === "POST") {
      const apartments = ((await kv.get("apartments")) || []).map(normalize);
      const newApt = normalize({ ...req.body, id: Date.now() });
      apartments.push(newApt);
      await kv.set("apartments", apartments);
      return res.status(200).json({ apartments });
    }

    if (req.method === "PUT") {
      const apartments = ((await kv.get("apartments")) || []).map(normalize);
      const idx = apartments.findIndex((a) => String(a.id) === String(req.body.id));
      if (idx === -1) return res.status(404).json({ error: "Apartamentul nu a fost găsit." });
      apartments[idx] = normalize(req.body);
      await kv.set("apartments", apartments);
      return res.status(200).json({ apartments });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      const apartments = ((await kv.get("apartments")) || []).map(normalize);
      const filtered = apartments.filter((a) => String(a.id) !== String(id));
      await kv.set("apartments", filtered);
      return res.status(200).json({ apartments: filtered });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Eroare apartments API:", err);
    return res.status(500).json({ error: "Eroare de server." });
  }
}
