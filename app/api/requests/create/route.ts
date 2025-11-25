import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM!;
const adminNumber = process.env.ECLIPSE_ADMIN_WHATSAPP_TO!;

const client = twilio(accountSid, authToken);

// Normalizza numero ospite/admin
function normalizeWhatsApp(number: string) {
  let n = number.trim();
  if (!n.startsWith("+")) n = "+39" + n;
  return `whatsapp:${n}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      guestName,
      phone,
      eventId,
      arrivalTime,
      companions = [],
      notes = "",
      type = "list", // "list" (lista Eclipse) oppure "dinner" (Cena Spettacolo)
    } = body;

    if (!guestName || !phone || !eventId) {
      return NextResponse.json(
        { ok: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const isDinner =
      type === "dinner" ||
      (typeof eventId === "string" &&
        eventId.toUpperCase().includes("CENA SPETTACOLO"));

    // CONTEGGIO PERSONE (referente + accompagnatori)
    const companionsArray = Array.isArray(companions) ? companions : [];
    const totalGuests = 1 + companionsArray.length;

    // POSTI AUTO SPETTANTI PER CENA SPETTACOLO
    // Regola: 1 macchina ogni 5 persone (5=1, 6=2, 10=2, 11=3...)
    const allowedParkingSpots = isDinner
      ? Math.max(1, Math.ceil(totalGuests / 5))
      : 0;

    // 1️⃣ Salvataggio su MongoDB
    const { db } = await connectToDatabase();
    const result = await db.collection("requests").insertOne({
      guestName,
      phone,
      eventId,
      arrivalTime: arrivalTime || null,
      companions: companionsArray,
      notes,
      type: isDinner ? "dinner" : "list",
      totalGuests,
      allowedParkingSpots: isDinner ? allowedParkingSpots : 0,
      status: isDinner ? "confirmed" : "pending", // cena confermata, lista Eclipse in pending
      createdAt: new Date(),
    });

    const insertedId = result.insertedId.toString();

    // -----------------------------
    // 2️⃣ MESSAGGI WHATSAPP
    // -----------------------------

    //
    // 🔥 A) PRENOTAZIONE CENA SPETTACOLO
    //
    if (isDinner) {
      try {
        // Messaggio all'ospite
        await client.messages.create({
          from: fromNumber,
          to: normalizeWhatsApp(phone),
          body:
            `🍽️ *Prenotazione Confermata – Cena Spettacolo*\n\n` +
            `👤 ${guestName}\n` +
            `📞 ${phone}\n` +
            `👥 Ospiti totali: ${totalGuests}\n` +
            `⏰ Arrivo indicativo: ${arrivalTime || "non indicato"}\n` +
            `🚗 Posti auto riservati inclusi: ${allowedParkingSpots}\n\n` +
            (notes
              ? `📝 Note: ${notes}\n\n`
              : "") +
            `La tua prenotazione a *Villa Tre Colli* è confermata.\n` +
            `A fine cena avrai accesso privilegiato a *Eclipse Noir*.\n\n` +
            `🅿️ Per chi non viene a cena e desidera il parcheggio, il costo è di 10€ a posto auto.\n\n` +
            `A presto ✨`,
        });

        // Messaggio all'admin
        await client.messages.create({
          from: fromNumber,
          to: normalizeWhatsApp(adminNumber),
          body:
            `📩 *Nuova prenotazione Cena Spettacolo*\n\n` +
            `👤 Nome: ${guestName}\n` +
            `📞 Telefono: ${phone}\n` +
            `👥 Ospiti totali: ${totalGuests}\n` +
            `🚗 Posti auto inclusi: ${allowedParkingSpots}\n` +
            `⏰ Arrivo: ${arrivalTime || "non indicato"}\n` +
            `📝 Note: ${notes || "—"}\n\n` +
            `🆔 ID: ${insertedId}`,
        });
      } catch (err) {
        console.error("❌ Errore WhatsApp cena:", err);
      }

      return NextResponse.json(
        { ok: true, message: "Prenotazione cena registrata", id: insertedId },
        { status: 200 }
      );
    }

    //
    // 🔥 B) RICHIESTA LISTA ECLIPSE (come prima)
    //
    try {
      await client.messages.create({
        from: fromNumber,
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
      console.error("❌ Errore WhatsApp admin lista:", err);
    }

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
      console.error("❌ Errore WhatsApp ospite lista:", err);
    }

    return NextResponse.json(
      { ok: true, message: "Richiesta registrata", id: insertedId },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Errore create request:", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
