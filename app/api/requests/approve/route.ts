import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import twilio from "twilio";

// 👉 Cloudinary qui non ci serve più per il QR, ma puoi anche lasciarlo importato se lo usi altrove

// ------------------------
// TWILIO ENV
// ------------------------
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
const client = twilio(accountSid, authToken);

// Normalizza numero
function normalizeWhatsApp(number: string) {
  let n = number.trim();
  if (!n.startsWith("+")) n = "+39" + n;
  return `whatsapp:${n}`;
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const { db } = await connectToDatabase();
    const request = await db.collection("requests").findOne({ _id: new ObjectId(id) });

    if (!request) {
      return NextResponse.json({ error: "Richiesta non trovata" }, { status: 404 });
    }

    // -----------------------------------------------------
    // 🔥 1) QR CODE TEXT = SOLO L’ID DEL DOCUMENTO
    // -----------------------------------------------------
    const qrCodeText = id;   // <-- SOLO ID

    // -----------------------------------------------------
    // 🔥 2) Generate QR via api.qrserver.com
    // -----------------------------------------------------
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
      qrCodeText
    )}`;

    // -----------------------------------------------------
    // 🔥 3) Save to database
    // -----------------------------------------------------
    await db.collection("requests").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "approved",
          code: qrCodeText,  // <-- salva SOLO l’ID
          qrUrl: qrImage,
          approvedAt: new Date(),
        },
      }
    );

    // -----------------------------------------------------
    // 🔥 4) Send WhatsApp to guest
    // -----------------------------------------------------
    await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: normalizeWhatsApp(request.phone),
      body:
        `✨ *ECLIPSE NOIR – ACCESSO APPROVATO*\n\n` +
        `Mostra questo QR all’ingresso.\n` +
        `È valido *una sola volta*.\n\n` +
        `ID: ${id}`,
      mediaUrl: [qrImage],
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Errore approvazione:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
