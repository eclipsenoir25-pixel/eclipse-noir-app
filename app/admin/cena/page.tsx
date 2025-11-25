"use client";

import { useEffect, useMemo, useState } from "react";

type Companion = {
  nome: string;
  telefono: string;
};

type DinnerRequest = {
  _id: string;
  guestName: string;
  phone: string;
  eventId: string;
  status: string;
  arrivalTime?: string;
  notes?: string;
  createdAt?: string;
  companions?: Companion[];
};

export default function AdminDinnerPage() {
  const [requests, setRequests] = useState<DinnerRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const MAX_SEATS = 90;

  async function loadRequests() {
    try {
      setLoading(true);
      const res = await fetch("/api/requests/list");
      const data = await res.json();
      const all: DinnerRequest[] = data.requests || [];

      // solo cena spettacolo
      const dinners = all.filter((r) =>
        (r.eventId || "").includes("CENA SPETTACOLO")
      );

      setRequests(dinners);
    } catch (err) {
      console.error("Errore caricamento cena spettacolo:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const totals = useMemo(() => {
    let totalGuests = 0;
    let totalRequests = requests.length;

    requests.forEach((r) => {
      const compCount = r.companions ? r.companions.length : 0;
      const n = 1 + compCount; // referente + accompagnatori
      totalGuests += n;
    });

    const available = Math.max(MAX_SEATS - totalGuests, 0);

    return {
      totalRequests,
      totalGuests,
      available,
    };
  }, [requests]);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto text-neutral-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#d4af37]">
            Cena Spettacolo – Villa Tre Colli
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Prenotazioni cena con accesso privilegiato a Eclipse Noir.
          </p>
        </div>

        {/* RIEPILOGO POSTI */}
        <div className="flex flex-col items-start sm:items-end gap-1 text-sm">
          <div>
            <span className="text-neutral-400">Posti totali: </span>
            <span className="font-semibold text-neutral-100">
              {MAX_SEATS}
            </span>
          </div>
          <div>
            <span className="text-neutral-400">Posti prenotati: </span>
            <span className="font-semibold text-[#f3cd63]">
              {totals.totalGuests}
            </span>
          </div>
          <div>
            <span className="text-neutral-400">Posti liberi: </span>
            <span
              className={`font-semibold ${
                totals.available <= 0
                  ? "text-red-400"
                  : totals.available <= 10
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {totals.available}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500">
            Prenotazioni: {totals.totalRequests}
          </div>
        </div>
      </div>

      {/* BOTTONI AZIONE */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={loadRequests}
          disabled={loading}
          className="
            text-xs px-3 py-1.5 rounded-full
            border border-neutral-600 text-neutral-200
            hover:bg-neutral-900/60 transition
            disabled:opacity-60 disabled:cursor-wait
          "
        >
          {loading ? "Aggiornamento..." : "Ricarica prenotazioni"}
        </button>

        <button
          onClick={() => window.print()}
          className="
            text-xs px-3 py-1.5 rounded-full
            bg-[#d4af37] text-black font-semibold
            hover:bg-[#f3cd63] transition
          "
        >
          Stampa lista (PDF)
        </button>
      </div>

      {/* LISTA PRENOTAZIONI */}
      {requests.length === 0 ? (
        <p className="text-neutral-400 text-sm">
          Nessuna prenotazione per la cena spettacolo al momento.
        </p>
      ) : (
        <div className="space-y-4 print:space-y-1">
          {requests.map((r) => {
            const compCount = r.companions ? r.companions.length : 0;
            const guests = 1 + compCount;

            return (
              <div
                key={r._id}
                className="
                  rounded-xl border border-[#d4af37]/30 bg-black/70
                  px-4 py-3 sm:px-5 sm:py-4
                  shadow-[0_0_18px_rgba(0,0,0,0.7)]
                  print:shadow-none print:border print:border-black
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Info principale */}
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                      Ospite
                    </div>
                    <div className="text-lg font-semibold">
                      {r.guestName}
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">Telefono: </span>
                      {r.phone}
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">
                        N. ospiti a cena:{" "}
                      </span>
                      {guests}{" "}
                      <span className="text-neutral-400 text-xs">
                        (referente + {compCount} accompagnatori)
                      </span>
                    </div>
                    {r.arrivalTime && (
                      <div className="text-sm text-neutral-300">
                        <span className="text-neutral-500">
                          Orario arrivo:{" "}
                        </span>
                        {r.arrivalTime}
                      </div>
                    )}
                    {r.notes && (
                      <div className="text-sm text-neutral-300 mt-1">
                        <span className="text-neutral-500">Note: </span>
                        {r.notes}
                      </div>
                    )}

                    {r.companions && r.companions.length > 0 && (
                      <div className="mt-2 text-[11px] text-neutral-300">
                        <span className="text-neutral-500">
                          Dettaglio accompagnatori:
                        </span>
                        <ul className="mt-1 list-disc list-inside space-y-0.5">
                          {r.companions.map((c, i) => (
                            <li key={i}>
                              {c.nome} –{" "}
                              <span className="text-neutral-400">
                                {c.telefono}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Stato / info tecniche */}
                  <div className="flex flex-col items-start sm:items-end gap-2 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Stato richiesta
                      </span>
                      <span
                        className={`
                          text-[11px] px-2 py-1 rounded-full border
                          ${
                            r.status === "approved"
                              ? "border-emerald-500/60 text-emerald-300 bg-emerald-900/20"
                              : r.status === "rejected"
                              ? "border-red-500/60 text-red-300 bg-red-900/20"
                              : "border-yellow-500/60 text-yellow-200 bg-yellow-900/20"
                          }
                        `}
                      >
                        {r.status?.toUpperCase() || "PENDING"}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 text-right">
                      ID: {r._id}
                    </div>
                    {r.createdAt && (
                      <div className="text-[11px] text-neutral-500 text-right">
                        Creata: {r.createdAt}
                      </div>
                    )}
                    <p className="text-[11px] text-neutral-400 text-right">
                      Il QR per l&apos;ingresso a Eclipse viene gestito da
                      /admin/requests una volta approvata la richiesta.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
