import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { ok: false, status: "error", message: "Token mancante" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const ticket = await db.collection("requests").findOne({ qrToken: token });

    if (!ticket) {
      return NextResponse.json({
        ok: false,
        status: "not_found",
        message: "Codice non valido (nessuna richiesta trovata)",
      });
    }

    // se non è approvato, non entra
    if (ticket.status !== "approved") {
      return NextResponse.json({
        ok: false,
        status: "not_approved",
        message: `Codice non valido: stato attuale ${ticket.status}`,
        guestName: ticket.guestName,
        eventId: ticket.eventId,
      });
    }

    // se già usato, rifiuta
    if (ticket.usedAt) {
      return NextResponse.json({
        ok: false,
        status: "already_used",
        message: "Codice già utilizzato",
        guestName: ticket.guestName,
        eventId: ticket.eventId,
        usedAt: ticket.usedAt,
      });
    }

    // segna come usato ORA
    const now = new Date();

    await db.collection("requests").updateOne(
      { _id: ticket._id },
      {
        $set: {
          usedAt: now,
        },
      }
    );

    return NextResponse.json({
      ok: true,
      status: "valid",
      message: "Ingresso valido – codice marcato come usato",
      guestName: ticket.guestName,
      eventId: ticket.eventId,
      usedAt: now,
    });
  } catch (error: any) {
    console.error("Errore API /check-in:", error);
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        message: "Errore nel check-in",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
