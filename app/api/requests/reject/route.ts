import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "ID richiesta mancante" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection("requests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Richiesta non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Richiesta rifiutata",
    });
  } catch (error: any) {
    console.error("Errore API /requests/reject:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Errore nel rifiuto della richiesta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
