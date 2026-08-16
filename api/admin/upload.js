import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: { sizeLimit: "8mb" },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const pass = req.headers["x-admin-password"];
  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Parolă incorectă." });
  }

  try {
    const { filename, dataUrl } = req.body || {};
    if (!filename || !dataUrl) {
      return res.status(400).json({ error: "Lipsește poza." });
    }

    const [meta, base64] = dataUrl.split(",");
    const contentType = meta.split(";")[0].split(":")[1] || "image/jpeg";
    const buffer = Buffer.from(base64, "base64");

    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const blob = await put(`apartamente/${Date.now()}-${safeName}`, buffer, {
      access: "public",
      contentType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error("Eroare upload:", err);
    return res.status(500).json({ error: "Nu am putut încărca poza. Încearcă una mai mică." });
  }
}
