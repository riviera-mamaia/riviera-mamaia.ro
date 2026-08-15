import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: "Lipsește session_id." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return res.status(200).json({
      status: session.payment_status, // "paid" | "unpaid" | "no_payment_required"
      amount_total: session.amount_total, // în bani
      currency: session.currency,
      metadata: session.metadata,
      customer_email: session.customer_details?.email || null,
    });
  } catch (err) {
    console.error("Eroare la citirea sesiunii:", err);
    return res.status(500).json({ error: "Nu am putut verifica plata." });
  }
}
