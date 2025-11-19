import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guestName, phone, eventId } = body;

    // Controllo minimo dati
    if (!guestName || !phone || !eventId) {
      return NextResponse.json(
        { ok: false, message: "Dati mancanti (nome, telefono, evento)" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const now = new Date();

    const doc = {
      guestName,
      phone,
      eventId,
      status: "pending", // in attesa di approvazione
      createdAt: now,
    };

    const result = await db.collection("requests").insertOne(doc);

    return NextResponse.json({
      ok: true,
      message: "Richiesta salvata nel DB",
      id: result.insertedId,
    });
  } catch (error: any) {
    console.error("Errore API /requests:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Errore server nel salvataggio richiesta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
