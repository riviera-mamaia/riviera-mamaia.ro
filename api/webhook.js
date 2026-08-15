import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe trebuie să primească body-ul brut (neparsat) ca să poată verifica semnătura
export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  } catch (err) {
    console.error("Semnătură webhook invalidă:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // Aici e locul sigur, verificat de server, unde confirmi rezervarea:
    // - salvează rezervarea într-o bază de date (ex: Supabase, PlanetScale, MongoDB)
    // - trimite un email de confirmare cu detaliile
    // - blochează datele respective în calendarul apartamentului
    console.log("✅ Rezervare plătită:", {
      email: session.customer_details?.email,
      suma: session.amount_total / 100,
      moneda: session.currency,
      detalii: session.metadata,
    });
  }

  return res.status(200).json({ received: true });
}
