import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST() {
  try {
    const { db } = await connectToDatabase();

    const now = new Date();

    const result = await db.collection("requests").insertOne({
      guestName: "Test User",
      phone: "+393000000000",
      eventId: "test-event",
      status: "pending",
      createdAt: now,
    });

    return NextResponse.json({
      ok: true,
      message: "Documento inserito nel DB",
      insertedId: result.insertedId,
    });
  } catch (error: any) {
    console.error("Errore DB:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Errore nel collegamento al DB",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
