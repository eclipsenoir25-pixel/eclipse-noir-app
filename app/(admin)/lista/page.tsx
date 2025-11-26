"use client";

import { useState } from "react";
import EclipsePanel from "../../components/ui/EclipsePanel";
import EclipseButton from "../../components/ui/EclipseButton";

type Companion = {
  nome: string;
  telefono: string;
};

export default function ListaPage() {
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventId, setEventId] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function addCompanion() {
    if (companions.length >= 10) return;
    setCompanions([...companions, { nome: "", telefono: "" }]);
  }

  function updateCompanion(index: number, field: keyof Companion, value: string) {
    const copy = [...companions];
    copy[index][field] = value;
    setCompanions(copy);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!privacy) {
      setErrorMsg("Devi accettare il trattamento dei dati personali.");
      return;
    }

    if (!guestName.trim() || !phone.trim() || !eventId.trim()) {
      setErrorMsg("Compila almeno nome, telefono ed evento.");
      return;
    }

    const payload = {
      guestName: guestName.trim(),
      phone: phone.trim(),
      eventId: eventId.trim(),
      arrivalTime,
      companions: companions
        .filter((c) => c.nome.trim() && c.telefono.trim())
        .map((c) => ({
          nome: c.nome.trim(),
          telefono: c.telefono.trim(),
        })),
    };

    try {
      setLoading(true);
      const res = await fetch("/api/requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.ok) {
        setSuccessMsg(
          "Richiesta inviata. Riceverai un WhatsApp di conferma dalla direzione."
        );
        setGuestName("");
        setPhone("");
        setEventId("");
        setArrivalTime("");
        setPrivacy(false);
        setCompanions([]);
      } else {
        setErrorMsg(json.message || "Si è verificato un errore.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Errore di comunicazione col server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-start justify-center px-4 py-10">
      <EclipsePanel className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="text-xs tracking-[0.3em] uppercase text-[#d4af37]/80">
            Eclipse Noir
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#d4af37]">
            Richiesta di accesso in lista
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            Compila il form per richiedere l’accesso agli atti I, II e III
            dell&apos;inaugurazione.
          </p>
        </div>

        {/* Messaggi di stato */}
        {successMsg && (
          <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Nome e cognome*
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/60 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
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
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/60 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              placeholder="Es. 3801234567"
            />
          </div>

          {/* Evento */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Evento*
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/60 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            >
              <option value="">Seleziona evento</option>
              <option value="5 DIC">5 Dicembre – Atto I</option>
              <option value="6 DIC">6 Dicembre – Atto II</option>
              <option value="7 DIC">7 Dicembre – Atto III</option>
            </select>
          </div>

          {/* Orario */}
          <div>
            <label className="block text-xs font-medium tracking-wide text-neutral-300 mb-1">
              Orario di arrivo indicativo
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full rounded-lg border border-[#d4af37]/40 bg-black/60 px-3 py-2 text-sm outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            />
          </div>

          {/* Accompagnatori */}
          <div className="pt-3 border-t border-neutral-700/60 mt-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-[#d4af37]">
                Accompagnatori (max 10)
              </h2>
              <button
                type="button"
                onClick={addCompanion}
                disabled={companions.length >= 10}
                className="text-xs border border-[#d4af37]/60 text-[#d4af37] rounded-full px-3 py-1 hover:bg-[#d4af37]/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Aggiungi
              </button>
            </div>

            {companions.length === 0 && (
              <p className="text-xs text-neutral-500">
                Aggiungi gli accompagnatori che verranno con te, se presenti.
              </p>
            )}

            <div className="space-y-3 mt-2">
              {companions.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-neutral-700/80 bg-black/40 px-3 py-2"
                >
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Nome e cognome
                    </label>
                    <input
                      value={c.nome}
                      onChange={(e) =>
                        updateCompanion(i, "nome", e.target.value)
                      }
                      className="w-full rounded-md border border-neutral-600 bg-black/60 px-2 py-1 text-xs outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Telefono
                    </label>
                    <input
                      value={c.telefono}
                      onChange={(e) =>
                        updateCompanion(i, "telefono", e.target.value)
                      }
                      className="w-full rounded-md border border-neutral-600 bg-black/60 px-2 py-1 text-xs outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="mt-4">
            <label className="flex items-start gap-2 text-xs text-neutral-300">
              <input
                type="checkbox"
                checked={privacy}
                onChange={() => setPrivacy(!privacy)}
                className="mt-[2px]"
              />
              <span>
                Dichiaro di aver letto e accettato l’informativa sul trattamento
                dei dati personali e autorizzo Eclipse Noir a contattarmi per
                comunicazioni relative agli eventi.
              </span>
            </label>
          </div>

          {/* Submit */}
          <EclipseButton type="submit" disabled={loading} className="mt-4 w-full">
            {loading ? "Invio in corso..." : "INVIA RICHIESTA"}
          </EclipseButton>
        </form>
      </EclipsePanel>
    </div>
  );
}
