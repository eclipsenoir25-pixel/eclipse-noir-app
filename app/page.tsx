"use client";

import Image from "next/image";

async function sendTestMessage() {
  const response = await fetch("/api/send-whatsapp", {
    method: "POST",
  });

  const data = await response.json();

  console.log("RISPOSTA API:", data);

  alert(
    data.ok
      ? "OK: " + data.message
      : "ERRORE: " + data.message +
        (data.env ? "\n\n" + JSON.stringify(data.env, null, 2) : "")
  );
}

// Test: inserisce un documento finto in "requests"
async function createTestRequest() {
  const response = await fetch("/api/test-db", {
    method: "POST",
  });

  const data = await response.json();
  alert(data.message || "Fatto.");
}

// Gestore del form "Richiesta reale"
async function handleCreateRealRequest(event: any) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const guestName = formData.get("guestName");
  const phone = formData.get("phone");
  const eventId = formData.get("eventId");

  const response = await fetch("/api/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guestName, phone, eventId }),
  });

  const data = await response.json();

  alert(data.message || "OK");

  if (data.ok) {
    // reset form
    event.target.reset();
  }
}

function TestWhatsAppButton() {
  return (
    <button
      onClick={sendTestMessage}
      style={{
        padding: "12px 20px",
        background: "green",
        color: "white",
        borderRadius: "8px",
        marginTop: "24px",
        cursor: "pointer",
        border: "none",
      }}
    >
      Invia messaggio WhatsApp di test
    </button>
  );
}

function CreateRequestButton() {
  return (
    <button
      onClick={createTestRequest}
      style={{
        padding: "12px 20px",
        background: "black",
        color: "white",
        borderRadius: "8px",
        marginTop: "16px",
        cursor: "pointer",
        border: "none",
      }}
    >
      Crea richiesta di test nel DB
    </button>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-16 px-8 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-4">
          Eclipse Noir – pannello di test
        </h1>

        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 mb-2">
          Qui testeremo:
        </p>
        <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 mb-4">
          <li>invio messaggi WhatsApp tramite Twilio</li>
          <li>generazione e invio QR code</li>
          <li>flusso richieste → approvazioni</li>
        </ul>

        <TestWhatsAppButton />
        <CreateRequestButton />

        {/* FORM RICHIESTA REALE */}
        <section
          style={{
            marginTop: "32px",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Crea richiesta reale
          </h2>

          <form
            onSubmit={handleCreateRealRequest}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <input
              name="guestName"
              placeholder="Nome e cognome"
              required
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <input
              name="phone"
              placeholder="Telefono (WhatsApp)"
              required
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <input
              name="eventId"
              placeholder="ID evento (es. opening-5-dic)"
              required
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "12px 20px",
                background: "#7c3aed",
                color: "white",
                borderRadius: "8px",
                marginTop: "4px",
                cursor: "pointer",
                border: "none",
              }}
            >
              Salva richiesta nel DB
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
