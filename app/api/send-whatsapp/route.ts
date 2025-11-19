import { NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
const toNumber = process.env.TEST_WHATSAPP_TO;

export async function POST() {
  // 🔍 Primo: controlliamo cosa vede davvero Next
  console.log("DEBUG ENV:", {
    accountSid,
    hasAuthToken: !!authToken,
    fromNumber,
    toNumber,
  });

  // Se manca qualcosa, non chiamiamo nemmeno Twilio
  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    return NextResponse.json(
      {
        ok: false,
        message: "Variabili Twilio non configurate correttamente.",
        env: {
          accountSid,
          hasAuthToken: !!authToken,
          fromNumber,
          toNumber,
        },
      },
      { status: 500 }
    );
  }

  // Se qui ci arriviamo, le ENV ci sono -> ora chiamiamo Twilio
  const client = twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
      body: "🔥 Messaggio di test da Eclipse Noir – se lo leggi, Twilio funziona.",
    });

    return NextResponse.json({
      ok: true,
      sid: message.sid,
      message: "WhatsApp inviato con successo",
    });
  } catch (error: any) {
    console.error("Errore Twilio:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Errore nell'invio WhatsApp",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
