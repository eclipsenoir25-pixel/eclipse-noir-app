import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const docs = await db
      .collection("dinnerbookings")
      .find({ tipo: "dinner" })
      .sort({ createdAt: -1 })
      .toArray();

    const bookings = docs.map((doc: any) => ({
      _id: doc._id?.toString(),
      bookingId: doc.bookingId,
      tipo: doc.tipo,
      nomeReferente: doc.nomeReferente,
      telefonoReferente: doc.telefonoReferente,
      numeroOspiti: doc.numeroOspiti,
      accompagnatori: doc.accompagnatori || [],
      note: doc.note || "",
      postiAutoAssegnati: doc.postiAutoAssegnati,
      pagamentoEffettuato: !!doc.pagamentoEffettuato,
      statoPagamento: doc.statoPagamento || "pending",
      stripeSessionId: doc.stripeSessionId || null,
      stripePaymentIntentId: doc.stripePaymentIntentId || null,
      createdAt: doc.createdAt ? doc.createdAt.toISOString?.() ?? doc.createdAt : null,
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString?.() ?? doc.updatedAt : null,
    }));

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (err) {
    console.error("Errore /api/dinner/list:", err);
    return NextResponse.json(
      { error: "Errore nel recupero delle prenotazioni cena." },
      { status: 500 }
    );
  }
}
