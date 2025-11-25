import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

// ENV
const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string;
const DINNER_PRICE_EUR = Number(process.env.DINNER_PRICE_EUR || "40");

// Capienza totale
const TOTAL_CAPACITY = 90;

// Collection dedicata all’evento
const COLLECTION_NAME = "dinnerbookings";

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY non è impostata nelle variabili d'ambiente.");
}
if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL non è impostata nelle variabili d'ambiente.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" as any,
});

type CompanionPayload = {
  nome: string;
  cognome: string;
  telefono: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      nomeReferente?: string;
      telefonoReferente?: string;
      numeroOspiti?: number;
      accompagnatori?: CompanionPayload[];
      note?: string;
    };

    const nomeReferente = (body.nomeReferente || "").trim();
    const telefonoReferente = (body.telefonoReferente || "").trim();
    const numeroOspiti = Number(body.numeroOspiti || 0);
    const accompagnatori = body.accompagnatori || [];
    const note = (body.note || "").trim();

    if (!nomeReferente || !telefonoReferente) {
      return NextResponse.json(
        { error: "Nome referente e telefono sono obbligatori." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(numeroOspiti) || numeroOspiti < 1) {
      return NextResponse.json(
        { error: "Numero ospiti non valido." },
        { status: 400 }
      );
    }

    // Validazione accompagnatori
    if (numeroOspiti > 1) {
      if (accompagnatori.length !== numeroOspiti - 1) {
        return NextResponse.json(
          {
            error:
              "Il numero di accompagnatori non è coerente con il numero totale di ospiti.",
          },
          { status: 400 }
        );
      }
      for (let i = 0; i < accompagnatori.length; i++) {
        const c = accompagnatori[i];
        if (!c.nome?.trim() || !c.cognome?.trim() || !c.telefono?.trim()) {
          return NextResponse.json(
            {
              error:
                "Nome, cognome e telefono di ogni accompagnatore sono obbligatori.",
            },
            { status: 400 }
          );
        }
      }
    }

    // DB
    const { db } = await connectToDatabase();

    // Calcolo posti già occupati (pending + paid)
    const agg = await db
      .collection(COLLECTION_NAME)
      .aggregate<{ totalGuests: number }>([
        {
          $match: {
            tipo: "dinner",
            statoPagamento: { $in: ["pending", "paid"] },
          },
        },
        {
          $group: {
            _id: null,
            totalGuests: { $sum: "$numeroOspiti" },
          },
        },
      ])
      .toArray();

    const currentGuests = agg[0]?.totalGuests || 0;
    const remainingSeats = TOTAL_CAPACITY - currentGuests;

    if (numeroOspiti > remainingSeats) {
      return NextResponse.json(
        {
          error:
            remainingSeats <= 0
              ? "Posti esauriti per la Cena Spettacolo."
              : `Sono disponibili solo ${remainingSeats} posti. Riduci il numero di ospiti.`,
        },
        { status: 400 }
      );
    }

    // Calcolo posti auto
    const postiAuto = Math.max(1, Math.ceil(numeroOspiti / 5));

    // Creo un ID manuale che sarà la prenotazione in pending
    const bookingObjectId = new ObjectId();
    const bookingId = bookingObjectId.toHexString();

    const now = new Date();

    // SALVIAMO LA PRENOTAZIONE IN STATO "PENDING"
    await db.collection(COLLECTION_NAME).insertOne({
      _id: bookingObjectId,
      bookingId,
      tipo: "dinner",
      nomeReferente,
      telefonoReferente,
      numeroOspiti,
      accompagnatori: accompagnatori.map((c) => ({
        nome: c.nome.trim(),
        cognome: c.cognome.trim(),
        telefono: c.telefono.trim(),
      })),
      note,
      postiAutoAssegnati: postiAuto,
      pagamentoEffettuato: false,
      statoPagamento: "pending", // pending | paid | expired | canceled
      stripeSessionId: null,
      stripePaymentIntentId: null,
      createdAt: now,
      updatedAt: now,
    });

    const amountTotal = Math.round(DINNER_PRICE_EUR * numeroOspiti * 100);

    // CREA LA SESSIONE STRIPE
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
              name: `Cena Spettacolo – Villa Tre Colli (${numeroOspiti} ospiti)`,
            },
          },
        },
      ],
      success_url: `${BASE_URL}/cena-spettacolo/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cena-spettacolo/cancel`,
      metadata: {
        bookingId,
        tipo: "dinner",
        nomeReferente,
        telefonoReferente,
        numeroOspiti: String(numeroOspiti),
        postiAuto: String(postiAuto),
      },
    });

    // Aggiorno la prenotazione con l'ID della sessione
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
    console.error("Errore create-checkout-session:", error);
    return NextResponse.json(
      { error: "Errore interno del server durante la creazione della sessione." },
      { status: 500 }
    );
  }
}
