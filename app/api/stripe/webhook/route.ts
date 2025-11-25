import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

const DINNER_COLLECTION = "dinnerbookings";
const PARKING_COLLECTION = "parkingbookings";

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY non è impostata nelle variabili d'ambiente.");
}
if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET non è impostata nelle variabili d'ambiente.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("❌ Errore verifica firma Stripe:", err?.message || err);
    return new NextResponse(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    switch (event.type) {
      // PAGAMENTO COMPLETATO
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const tipo = session.metadata?.tipo; // "dinner" | "parking"

        if (!bookingId || !tipo) {
          console.warn("⚠️ Webhook senza bookingId o tipo.");
          break;
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        const collectionName =
          tipo === "dinner"
            ? DINNER_COLLECTION
            : tipo === "parking"
            ? PARKING_COLLECTION
            : null;

        if (!collectionName) {
          console.warn("⚠️ Tipo prenotazione non riconosciuto:", tipo);
          break;
        }

        await db.collection(collectionName).updateOne(
          { bookingId, tipo },
          {
            $set: {
              pagamentoEffettuato: true,
              statoPagamento: "paid",
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId || null,
              updatedAt: new Date(),
              paidAt: new Date(),
            },
          }
        );

        console.log(`✅ Prenotazione ${bookingId} (${tipo}) segnata come PAGATA`);
        break;
      }

      // SESSIONE SCADUTA
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const tipo = session.metadata?.tipo;

        if (!bookingId || !tipo) break;

        const collectionName =
          tipo === "dinner"
            ? DINNER_COLLECTION
            : tipo === "parking"
            ? PARKING_COLLECTION
            : null;

        if (!collectionName) break;

        await db.collection(collectionName).updateOne(
          { bookingId, tipo, statoPagamento: "pending" },
          {
            $set: {
              statoPagamento: "expired",
              updatedAt: new Date(),
            },
          }
        );

        console.log(`⚠️ Sessione scaduta: ${bookingId} (${tipo})`);
        break;
      }

      // PAGAMENTO NON RIUSCITO
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        const session = sessionList.data[0];
        const bookingId = session?.metadata?.bookingId;
        const tipo = session?.metadata?.tipo;

        if (!bookingId || !tipo) break;

        const collectionName =
          tipo === "dinner"
            ? DINNER_COLLECTION
            : tipo === "parking"
            ? PARKING_COLLECTION
            : null;

        if (!collectionName) break;

        await db.collection(collectionName).updateOne(
          { bookingId, tipo },
          {
            $set: {
              statoPagamento: "canceled",
              updatedAt: new Date(),
            },
          }
        );

        console.log(`❌ Pagamento fallito: ${bookingId} (${tipo})`);
        break;
      }

      default:
        console.log("Evento Stripe non gestito:", event.type);
        break;
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Errore gestione webhook:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
