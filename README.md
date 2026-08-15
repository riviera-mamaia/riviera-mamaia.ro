# LitoralNord — site de rezervări Mamaia cu plată Stripe

## Ce conține proiectul
- `src/` — site-ul (React + Vite)
- `api/create-checkout-session.js` — creează sesiunea de plată Stripe
- `api/session-status.js` — verifică plata pentru pagina de confirmare
- `api/webhook.js` — primește notificarea oficială de la Stripe când plata reușește

Fișierele din `api/` sunt **funcții serverless** — rulează pe server la Vercel, nu în browser. Aici, și numai aici, e sigur să folosești cheia secretă.

---

## Pasul 1 — Instalează dependențele local
Ai nevoie de [Node.js](https://nodejs.org) instalat (versiunea 18+).

```bash
npm install
```

## Pasul 2 — Cheile Stripe
Din [dashboard.stripe.com](https://dashboard.stripe.com) → **Developers → API keys**, copiază:
- **Secret key** (`sk_test_...` pentru test, `sk_live_...` pentru bani reali)

Creează un fișier `.env` (copiază `.env.example`) și pune-o acolo:
```
STRIPE_SECRET_KEY=sk_test_...
```
`STRIPE_WEBHOOK_SECRET` îl completezi la Pasul 5, după ce ai un URL public.

⚠️ Nu pune niciodată cheia secretă în cod, în chat, sau pe GitHub public. `.gitignore` exclude deja `.env`.

## Pasul 3 — Testează local
```bash
npm install -g vercel   # o singură dată
vercel dev
```
Îți deschide site-ul local (de obicei `localhost:3000`) cu funcțiile serverless active. Testează o rezervare cu cardul de test Stripe:
```
Număr:  4242 4242 4242 4242
Data:   orice dată viitoare
CVC:    orice 3 cifre
```

## Pasul 4 — Publică site-ul (gratuit, pe Vercel)
```bash
vercel
```
Urmează pașii din terminal (login cu GitHub/email, confirmă folderul). La final primești un link live, ceva de genul `https://litoral-nord.vercel.app`.

Apoi, în [vercel.com](https://vercel.com) → proiectul tău → **Settings → Environment Variables**, adaugă:
- `STRIPE_SECRET_KEY` = cheia ta secretă
- `STRIPE_WEBHOOK_SECRET` = o completezi la pasul următor

Redeploy după ce adaugi variabilele (`vercel --prod`).

## Pasul 5 — Conectează webhook-ul (confirmă plățile pe server)
1. În Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://domeniul-tau.vercel.app/api/webhook`
3. Selectează evenimentul: `checkout.session.completed`
4. Stripe îți dă un **Signing secret** (`whsec_...`) — pune-l în Vercel ca `STRIPE_WEBHOOK_SECRET`
5. `vercel --prod` din nou ca să se aplice

Acum, când cineva plătește, Stripe trimite automat o confirmare la server — acolo e locul unde poți salva rezervarea într-o bază de date sau trimite email (vezi comentariile din `api/webhook.js`).

## Pasul 6 — Treci de la test la bani reali
Cât timp folosești chei `sk_test_...`, nimeni nu e taxat cu bani reali — perfect pentru verificat tot fluxul.

Când ești gata:
1. Activează contul Stripe (dacă nu e deja) — date firmă/PFA, cont bancar pentru încasări
2. Ia cheia `sk_live_...` din dashboard (mod **Live**, nu Test)
3. Înlocuiește `STRIPE_SECRET_KEY` în Vercel cu cheia live
4. Repetă Pasul 5 pentru un webhook nou în modul Live (webhook-urile de test și live sunt separate)

---

## Ce lipsește pentru un site 100% de producție
Ce ai acum e complet funcțional pentru a lua plăți reale. În plus, ar mai fi util:
- **Bază de date** pentru rezervări reale și disponibilitate (ex: Supabase — gratuit la început)
- **Emailuri automate** de confirmare (ex: Resend sau SendGrid, apelate din `api/webhook.js`)
- **Domeniu propriu** (ex: `litoralnord.ro`) — se leagă din Vercel → Settings → Domains
- **Verificare disponibilitate reală** (ca să nu se suprapună rezervările pe aceleași date)

Spune-mi dacă vrei să continuăm cu oricare dintre astea.
