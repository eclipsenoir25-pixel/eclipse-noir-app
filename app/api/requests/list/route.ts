import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const requests = await db
      .collection("requests")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ ok: true, requests });
  } catch (error: any) {
    console.error("Errore API list:", error);
    return NextResponse.json(
      { ok: false, message: "Errore nel caricamento richieste" },
      { status: 500 }
    );
  }
}
