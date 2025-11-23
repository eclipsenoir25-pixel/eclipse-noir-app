import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
const adminNumber = process.env.ECLIPSE_ADMIN_WHATSAPP_TO!;

const client = twilio(accountSid, authToken);

// Normalizza numero ospite/admin (aggiunge +39 e whatsapp:)
function normalizeWhatsApp(number: string) {
  let n = number.trim();
  if (!n.startsWith("+")) n = "+39" + n;
  return `whatsapp:${n}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guestName, phone, eventId, arrivalTime, companions } = body;

    if (!guestName || !phone || !eventId) {
      return NextResponse.json(
        { ok: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Salvataggio su MongoDB (PRIMA DI TUTTO, è la cosa più importante)
    const { db } = await connectToDatabase();

    const result = await db.collection("requests").insertOne({
      guestName,
      phone,
      eventId,
      arrivalTime,
      companions: companions || [],
      status: "pending",
      createdAt: new Date(),
    });

    const insertedId = result.insertedId.toString();

    // 2️⃣ Invio WhatsApp ALL’ADMIN (ma NON blocca il salvataggio se fallisce)
    try {
      await client.messages.create({
        from: fromNumber, // es: "whatsapp:+14155238886"
        to: normalizeWhatsApp(adminNumber),
        body:
          `📩 *Nuova richiesta lista Eclipse Noir*\n\n` +
          `👤 Nome: ${guestName}\n` +
          `📞 Telefono: ${phone}\n` +
          `🎟️ Evento: ${eventId}\n` +
          `⏰ Arrivo: ${arrivalTime || "non indicato"}\n` +
          `🆔 ID: ${insertedId}\n\n` +
          `👉 Rispondi:\n` +
          `APPROVA ${insertedId}\n` +
          `RIFIUTA ${insertedId}`,
      });
    } catch (err) {
      console.error("❌ Errore WhatsApp ADMIN:", err);
      // NON facciamo throw: il DB è già ok, il resto è solo notifica
    }

    // 3️⃣ Invio WhatsApp ALL’OSPITE (anche questo non deve bloccare il DB)
    try {
      await client.messages.create({
        from: fromNumber,
        to: normalizeWhatsApp(phone),
        body:
          `🖤 *Eclipse Noir*\n` +
          `La tua richiesta è stata ricevuta.\n` +
          `Attendi la conferma dalla direzione.`,
      });
    } catch (err) {
      console.error("❌ Errore WhatsApp OSPITE:", err);
      // Anche qui: logghiamo e basta
    }

    // 4️⃣ Risposta OK: a questo punto la richiesta ESISTE garantito
    return NextResponse.json(
      { ok: true, message: "Richiesta registrata", id: insertedId },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Errore create request (bloccante):", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
