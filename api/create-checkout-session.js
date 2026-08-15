import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      apartmentName,
      zone,
      checkIn,
      checkOut,
      nights,
      guests,
      totalRon,
      guestEmail,
      guestName,
    } = req.body || {};

    if (!apartmentName || !totalRon || Number(totalRon) <= 0 || !nights) {
      return res.status(400).json({ error: "Date de rezervare invalide." });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: guestEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "ron",
            unit_amount: Math.round(Number(totalRon) * 100), // Stripe folosește bani (subunitate), nu lei
            product_data: {
              name: `${apartmentName} — ${zone}`,
              description: `${checkIn} → ${checkOut} · ${nights} nopți · ${guests} oaspeți`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        apartmentName,
        zone,
        checkIn,
        checkOut,
        nights: String(nights),
        guests: String(guests),
        guestName: guestName || "",
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Eroare Stripe:", err);
    return res.status(500).json({ error: "Nu am putut iniția plata. Încearcă din nou." });
  }
}
