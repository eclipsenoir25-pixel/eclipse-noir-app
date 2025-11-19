import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import twilio from "twilio";
import { ObjectId } from "mongodb";

// ---------- TWILIO ENV ----------
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
const adminNumber = process.env.ECLIPSE_ADMIN_WHATSAPP_TO!;

const client = twilio(accountSid, authToken);

// Normalizza un numero in formato WhatsApp
function normalizeWhatsApp(number: string) {
  let n = number.trim();
  if (!n.startsWith("+")) n = "+39" + n;
  return `whatsapp:${n}`;
}

// Mappa nomi evento completi
const EVENT_DETAILS: Record<string, { title: string; description: string }> = {
  "5 DIC": {
    title: "5 Dicembre – Atto I",
    description:
      "21:30 Live music Kashmir\n23:30 DJ set & spettacolo coreografico \"La Libertà\"",
  },
  "6 DIC": {
    title: "6 Dicembre – Atto II",
    description:
      "23:30 DJ set & Coreografie sensoriali e Visual show \"La Lussuria\"",
  },
  "7 DIC": {
    title: "7 Dicembre – Atto III",
    description:
      "18:00 Aperitivo & Live Official Tribute Band Queen \"Queen of Bulsara\" & DJ set",
  },
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const from = form.get("From")?.toString() || "";
    const bodyRaw = form.get("Body")?.toString() || "";
    const body = bodyRaw.trim().toUpperCase();

    const adminW = normalizeWhatsApp(adminNumber);

    if (from !== adminW) {
      console.log("Messaggio ignorato: non è l'admin");
      return NextResponse.json({ ok: true });
    }

    if (body.startsWith("APPROVA")) {
      const id = body.split(" ")[1];
      return await handleApprove(id, adminW);
    }

    if (body.startsWith("RIFIUTA")) {
      const id = body.split(" ")[1];
      return await handleReject(id, adminW);
    }

    await client.messages.create({
      from: fromNumber,
      to: adminW,
      body: "Usa:\nAPPROVA <ID>\nRIFIUTA <ID>",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

// APPROVAZIONE
async function handleApprove(id: string, adminTo: string) {
  try {
    const { db } = await connectToDatabase();
    const objId = new ObjectId(id);
    const request = await db.collection("requests").findOne({ _id: objId });

    if (!request) {
      await client.messages.create({
        from: fromNumber,
        to: adminTo,
        body: `❌ Nessuna richiesta trovata con ID ${id}`,
      });
      return NextResponse.json({ ok: false });
    }

    const eventInfo = EVENT_DETAILS[request.eventId] || {
      title: request.eventId,
      description: "",
    };

    const qrCodeText = `ECLIPSE_NOIR|ID:${id}|OSPITE:${request.guestName}|EVENTO:${eventInfo.title}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
      qrCodeText
    )}`;

    await db.collection("requests").updateOne(
      { _id: objId },
      {
        $set: {
          status: "approved",
          qrUrl: qrImageUrl,
          code: qrCodeText,
          approvedAt: new Date(),
        },
      }
    );

    // MESSAGGIO PER L’OSPITE
    await client.messages.create({
      from: fromNumber,
      to: normalizeWhatsApp(request.phone),
      body:
        `✨ Benvenuto/a a *Eclipse Noir*\n` +
        `*${eventInfo.title}*\n${eventInfo.description}\n\n` +
        `La tua richiesta è stata accettata.\n\n` +
        `Eclipse Noir è un luogo che rispetta profondamente la *libertà*: ` +
        `qui puoi essere davvero chi vuoi, nel modo che preferisci.\n` +
        `Gay, etero, trans, mascherato, elegante, alternativo… non importa. ` +
        `Conta solo il comportamento: rispetto, educazione e vibrazioni positive.\n\n` +
        `🔞 Ingresso consentito dai 18 anni in su.\n\n` +
        `*Il tuo accesso:*\n` +
        `• Evento: ${eventInfo.title}\n` +
        `• QR Code: in allegato (valido 1 volta)\n\n` +
        `Ci vediamo al buio.\n*Eclipse Noir*`,
      mediaUrl: [qrImageUrl],
    });

    // MESSAGGIO ALL’ADMIN
    await client.messages.create({
      from: fromNumber,
      to: adminTo,
      body: `✔️ APPROVATA\nID: ${id}\nOspite: ${request.guestName}\nEvento: ${eventInfo.title}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Errore approvazione:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// RIFIUTO
async function handleReject(id: string, adminTo: string) {
  try {
    const { db } = await connectToDatabase();
    const objId = new ObjectId(id);

    const request = await db.collection("requests").findOne({ _id: objId });
    if (!request) {
      await client.messages.create({
        from: fromNumber,
        to: adminTo,
        body: `❌ Nessuna richiesta con ID ${id}`,
      });
      return NextResponse.json({ ok: false });
    }

    await db.collection("requests").updateOne(
      { _id: objId },
      { $set: { status: "rejected", rejectedAt: new Date() } }
    );

    await client.messages.create({
      from: fromNumber,
      to: normalizeWhatsApp(request.phone),
      body: `😔 Eclipse Noir – la tua richiesta non è stata approvata.`,
    });

    await client.messages.create({
      from: fromNumber,
      to: adminTo,
      body: `❌ RIFIUTATA\nID: ${id}\nOspite: ${request.guestName}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Errore rifiuto:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
