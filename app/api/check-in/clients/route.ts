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

    const data = requests.map((r: any) => ({
      id: r._id.toString(),
      guestName: r.guestName || "",
      phone: r.phone || "",
      eventId: r.eventId || "",
      arrivalTime: r.arrivalTime || "",
      status: r.status || "pending",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Errore API /admin/clients:", error);
    return NextResponse.json(
      { ok: false, message: "Errore server" },
      { status: 500 }
    );
  }
}
