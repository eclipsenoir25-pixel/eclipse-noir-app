import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const PARKING_PRICE_EUR = Number(process.env.PARKING_PRICE_EUR || "8");

// Quota massima posti vendibili via app (30 su 60 totali)
const PARKING_APP_QUOTA = 30;

const COLLECTION_NAME = "parkingbookings";

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY non è impostata nelle variabili d'ambiente.");
}
if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL non è impostata nelle variabili d'ambiente.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" as any,
});

type ParkingPayload = {
  nomeReferente?: string;
  telefonoReferente?: string;
  targa?: string;
  postiRichiesti?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ParkingPayload;

    const nomeReferente = (body.nomeReferente || "").trim();
    const telefonoReferente = (body.telefonoReferente || "").trim();
    const targa = (body.targa || "").trim().toUpperCase();
    const postiRichiesti = Number(body.postiRichiesti || 1);

    if (!nomeReferente || !telefonoReferente || !targa) {
      return NextResponse.json(
        { error: "Nome, telefono e targa sono obbligatori." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(postiRichiesti) || postiRichiesti < 1) {
      return NextResponse.json(
        { error: "Numero posti parcheggio non valido." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Somma posti già venduti/occupati via app (pending + paid)
    const agg = await db
      .collection(COLLECTION_NAME)
      .aggregate<{ totalSpots: number }>([
        {
          $match: {
            statoPagamento: { $in: ["pending", "paid"] },
          },
        },
        {
          $group: {
            _id: null,
            totalSpots: { $sum: "$postiRichiesti" },
          },
        },
      ])
      .toArray();

    const currentParkingSpots = agg[0]?.totalSpots || 0;
    const remainingParkingSpots = PARKING_APP_QUOTA - currentParkingSpots;

    if (postiRichiesti > remainingParkingSpots) {
      return NextResponse.json(
        {
          error:
            remainingParkingSpots <= 0
              ? "Posti parcheggio esauriti."
              : `Sono disponibili solo ${remainingParkingSpots} posti parcheggio.`,
        },
        { status: 400 }
      );
    }

    // Creo prenotazione parking in pending
    const bookingObjectId = new ObjectId();
    const bookingId = bookingObjectId.toHexString();
    const now = new Date();

    await db.collection(COLLECTION_NAME).insertOne({
      _id: bookingObjectId,
      bookingId,
      tipo: "parking",
      nomeReferente,
      telefonoReferente,
      targa,
      postiRichiesti,
      pagamentoEffettuato: false,
      statoPagamento: "pending",
      stripeSessionId: null,
      stripePaymentIntentId: null,
      createdAt: now,
      updatedAt: now,
    });

    const amountTotal = Math.round(PARKING_PRICE_EUR * postiRichiesti * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountTotal,
            product_data: {
              name: `Posto auto – Villa Tre Colli (${postiRichiesti} posti)`,
            },
          },
        },
      ],
      success_url: `${BASE_URL}/parcheggio/success?nome=${encodeURIComponent(
        nomeReferente
      )}&targa=${encodeURIComponent(
        targa
      )}&posti=${postiRichiesti}&codice=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/parcheggio/cancel`,
      metadata: {
        bookingId,
        tipo: "parking",
        nomeReferente,
        telefonoReferente,
        targa,
        postiRichiesti: String(postiRichiesti),
      },
    });

    await db.collection(COLLECTION_NAME).updateOne(
      { _id: bookingObjectId },
      {
        $set: {
          stripeSessionId: session.id,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Errore create-parking-session:", error);
    return NextResponse.json(
      { error: "Errore interno del server durante la creazione della sessione." },
      { status: 500 }
    );
  }
}
