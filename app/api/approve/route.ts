import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!;

const client = twilio(accountSid, authToken);

function normalizePhone(phone: string) {
  const trimmed = phone.replace(/\s+/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  return "+39" + trimmed;
}

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

    const request = await db
      .collection("requests")
      .findOne({ _id: new ObjectId(id) });

    if (!request) {
      return NextResponse.json(
        { ok: false, message: "Richiesta non trovata" },
        { status: 404 }
      );
    }

    if (request.status === "approved") {
      return NextResponse.json(
        { ok: false, message: "Richiesta già approvata" },
        { status: 400 }
      );
    }

    // 1️⃣ Genera token univoco
    const token = randomUUID();

    // 2️⃣ Invia WhatsApp SOLO TESTO per ora
    const toNumber = normalizePhone(request.phone);

    const msgText =
      `✅ Richiesta approvata per l'evento: ${request.eventId}\n\n` +
      `Nome: ${request.guestName}\n` +
      `Telefono: ${request.phone}\n\n` +
      `Questo è il tuo codice di ingresso (monouso):\n` +
      `${token}\n\n` +
      `Mostralo all'ingresso. Il codice è valido per UNA sola entrata.`;

    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      body: msgText,
      // niente mediaUrl per ora: Twilio vuole URL reale, non base64
    });

    // 3️⃣ Aggiorna la richiesta nel DB
    await db.collection("requests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "approved",
          qrToken: token,
          approvedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      message: "Richiesta approvata e codice inviato su WhatsApp",
    });
  } catch (error: any) {
    console.error("Errore API /requests/approve:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Errore nell'approvazione della richiesta",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
