import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const COLLECTION_NAME = "bookings";

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
    console.error("Errore nella verifica del webhook Stripe:", err?.message || err);
    return new NextResponse(
      `Webhook Error: ${err?.message || "impossibile verificare la firma"}`,
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) {
          console.warn(
            "checkout.session.completed ricevuto senza bookingId in metadata."
          );
          break;
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        await collection.updateOne(
          { bookingId, tipo: "dinner" },
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

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) break;

        await collection.updateOne(
          { bookingId, tipo: "dinner", statoPagamento: "pending" },
          {
            $set: {
              statoPagamento: "expired",
              updatedAt: new Date(),
            },
          }
        );

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });
        const session = sessionList.data[0];
        const bookingId = session?.metadata?.bookingId;

        if (bookingId) {
          await collection.updateOne(
            { bookingId, tipo: "dinner" },
            {
              $set: {
                statoPagamento: "canceled",
                updatedAt: new Date(),
              },
            }
          );
        }

        break;
      }

      default: {
        // Altri eventi non gestiti esplicitamente
        break;
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Errore nella gestione del webhook Stripe:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
