"use client";

import { useState } from "react";
import EclipsePanel from "../components/ui/EclipsePanel";

type DinnerStatus = "idle" | "loading" | "success" | "error";

export default function CenaSpettacoloPage() {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState<number>(2);
  const [arrivalTime, setArrivalTime] = useState("");
  const [notes, setNotes] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<DinnerStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const MAX_SEATS = 90; // per ora solo testo informativo

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!privacy) {
      setStatus("error");
      setMessage("Devi accettare il trattamento dei dati personali.");
      return;
    }

    if (!guestName.trim() || !phone.trim() || !guests) {
      setStatus("error");
      setMessage("Compila nome, telefono e numero di ospiti.");
      return;
    }

    const payload = {
      guestName: guestName.trim(),
      phone: phone.trim(),
      eventId: "CENA SPETTACOLO – VILLA TRE COLLI",
      arrivalTime,
      dinnerGuests: guests,
      notes: notes.trim(),
      type: "dinner", // etichetta per distinguerla lato admin se serve
    };

    try {
      setStatus("loading");
      setMessage("Invio prenotazione in corso...");

      const res = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        setStatus("success");
        setMessage(
          "Prenotazione ricevuta. Verrai ricontattato da Villa Tre Colli per la conferma."
        );
        setGuestName("");
        setPhone("");
        setGuests(2);
        setArrivalTime("");
        setNotes("");
        setPrivacy(false);
      } else {
        setStatus("error");
        setMessage(data.message || "Si è verificato un errore.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Errore di comunicazione col server.");
    }
  }

  const statusColor =
    status === "success"
      ? "border-emerald-500/60 bg-emerald-900/30 text-emerald-100"
      : status === "error"
      ? "border-red-500/60 bg-red-900/30 text-red-100"
      : "border-neutral-600/60 bg-neutral-900/40 text-neutral-200";

  return (
    <section className="flex justify-center px-4 py-10">
      <EclipsePanel className="w-full max-w-2xl">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <div className="text-xs tracking-[0.3em] uppercase text-[#d4af37]/80">
            Villa Tre Colli · Cena Spettacolo
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#f5f5f5]">
            Cena Spettacolo &amp; Eclipse Noir
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            Un percorso esclusivo: cena con dj set e vocalist a Villa Tre Colli,
            poi ingresso privilegiato a <span className="text-[#d4af37]">Eclipse Noir</span>.
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Posti limitati a circa {MAX_SEATS} coperti. Prenotazione obbligatoria.
          </p>
        </div>

        {/* INFO MENU */}
        <div className="mb-6 rounded-xl border border-[#d4af37]/40 bg-black/60 px-4 py-3 text-sm text-neutral-200">
          <div className="text-xs uppercase tracking-[0.25em] text-[#d4af37]/80 mb-1">
            Menù Cena Spettacolo
          </div>
          <p>
            <span className="font-semibold text-[#d4af37]">
              35€ a persona
            </span>{" "}
            · Antipasto · Primo · Secondo · Acqua, vino e Prosecco inclusi
            <span className="text-neutral-400">
              {" "}
              (bibite extra e superalcolici esclusi).
            </span>
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            Incluso: tavolo riservato, atmosfera con dj set e vocalist,
            ingresso privilegiato a Eclipse Noir con posto auto riservato.
          </p>
        </div>

        {/* MESSAGGIO STATO */}
        {status !== "idle" && message && (
          <div
            className={`mb-4 rounded-lg border px-3 py-2 text-sm ${statusColor}`}
          >
            {message}
          </div>
        )}

        {/* FORM PRENOTAZIONE */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Nome e cognome referente*
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/70 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              placeholder="Es. Mario Rossi"
            />
          </div>

          {/* Telefono */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Numero di telefono (WhatsApp)*
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/70 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              placeholder="Es. 3801234567"
            />
          </div>

          {/* Numero ospiti */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Numero totale di ospiti a cena*
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/70 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              Indica il numero totale di persone, te compreso.
            </p>
          </div>

          {/* Orario arrivo */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Orario di arrivo indicativo
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/70 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Note particolari (intolleranze, richieste...)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/70 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              rows={3}
              placeholder="Es. intolleranze, compleanno, richiesta tavolo..."
            />
          </div>

          {/* Privacy */}
          <div className="mt-2">
            <label className="flex items-start gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={privacy}
                onChange={() => setPrivacy(!privacy)}
                className="mt-[2px]"
              />
              <span>
                Dichiaro di aver letto e accettato l’informativa sul
                trattamento dei dati personali e autorizzo Villa Tre Colli
                e Eclipse Noir a contattarmi per comunicazioni relative
                alla cena spettacolo e all&apos;evento serale.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="
              mt-4 w-full rounded-full bg-gradient-to-r
              from-[#d4af37] to-[#f3cd63]
              text-black font-semibold py-3 text-sm tracking-wide
              hover:from-[#f3cd63] hover:to-[#ffe58a]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {status === "loading"
              ? "Invio prenotazione..."
              : "INVIA RICHIESTA CENA SPETTACOLO"}
          </button>

          <p className="mt-3 text-[11px] text-neutral-500 text-center">
            La prenotazione sarà confermata dalla direzione di Villa Tre
            Colli in base alla disponibilità dei posti.
          </p>
        </form>
      </EclipsePanel>
    </section>
  );
}
