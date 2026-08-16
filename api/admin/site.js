import { kv } from "@vercel/kv";

const DEFAULT_SITE = { logoPart1: "Litoral", logoPart2: "Nord", phone: "0723 000 111" };

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const site = (await kv.get("site")) || DEFAULT_SITE;
      return res.status(200).json({ site });
    }

    const pass = req.headers["x-admin-password"];
    if (!pass || pass !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Parolă incorectă." });
    }

    if (req.method === "PUT") {
      await kv.set("site", req.body);
      return res.status(200).json({ site: req.body });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Eroare site API:", err);
    return res.status(500).json({ error: "Eroare de server." });
  }
}
