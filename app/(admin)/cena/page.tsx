"use client";

import { useEffect, useMemo, useState } from "react";

type Accompagnatore = {
  nome: string;
  cognome: string;
  telefono: string;
};

type DinnerBooking = {
  _id: string;
  bookingId: string;
  nomeReferente: string;
  telefonoReferente: string;
  numeroOspiti: number;
  accompagnatori?: Accompagnatore[];
  note?: string;
  postiAutoAssegnati: number;
  pagamentoEffettuato: boolean;
  statoPagamento: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const MAX_SEATS = 90;

export default function AdminDinnerPage() {
  const [bookings, setBookings] = useState<DinnerBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid" | "canceled" | "expired">("all");
  const [search, setSearch] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await fetch("/api/dinner/list");
      if (!res.ok) {
        throw new Error("Errore nella risposta API");
      }
      const data = await res.json();
      const list: DinnerBooking[] = data.bookings || [];
      setBookings(list);
    } catch (err) {
      console.error("Errore caricamento prenotazioni cena:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(() => {
    return bookings
      .filter((b) =>
        filterStatus === "all" ? true : (b.statoPagamento || "pending") === filterStatus
      )
      .filter((b) => {
        if (!search.trim()) return true;
        const term = search.trim().toLowerCase();
        return (
          b.nomeReferente.toLowerCase().includes(term) ||
          b.telefonoReferente.toLowerCase().includes(term) ||
          (b.bookingId && b.bookingId.toLowerCase().includes(term))
        );
      });
  }, [bookings, filterStatus, search]);

  const totals = useMemo(() => {
    const totalBookings = bookings.length;
    let totalGuests = 0;
    let totalAuto = 0;
    let paidCount = 0;

    bookings.forEach((b) => {
      totalGuests += b.numeroOspiti || 0;
      totalAuto += b.postiAutoAssegnati || 0;
      if (b.statoPagamento === "paid") paidCount++;
    });

    const availableSeats = Math.max(MAX_SEATS - totalGuests, 0);

    return {
      totalBookings,
      totalGuests,
      totalAuto,
      availableSeats,
      paidCount,
    };
  }, [bookings]);

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusClass(status: string) {
    switch (status) {
      case "paid":
        return "border-emerald-500/60 text-emerald-300 bg-emerald-900/25";
      case "pending":
        return "border-yellow-500/60 text-yellow-200 bg-yellow-900/25";
      case "canceled":
        return "border-red-500/60 text-red-300 bg-red-900/25";
      case "expired":
        return "border-orange-500/60 text-orange-300 bg-orange-900/25";
      default:
        return "border-neutral-500/60 text-neutral-200 bg-neutral-900/40";
    }
  }

  function statusLabel(status: string) {
    switch (status) {
      case "paid":
        return "PAGATO";
      case "pending":
        return "IN ATTESA";
      case "canceled":
        return "ANNULLATO";
      case "expired":
        return "SCADUTO";
      default:
        return status.toUpperCase();
    }
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto text-neutral-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#d4af37]">
            Cena Spettacolo – Villa Tre Colli
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Prenotazioni cena con posto auto garantito all&apos;Eclipse Noir.
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Dashboard collegata alla collection <span className="font-mono">dinnerbookings</span>.
          </p>
        </div>

        {/* RIEPILOGO POSTI */}
        <div className="flex flex-col items-start sm:items-end gap-1 text-sm">
          <div>
            <span className="text-neutral-400">Posti totali: </span>
            <span className="font-semibold text-neutral-100">{MAX_SEATS}</span>
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
                totals.availableSeats <= 0
                  ? "text-red-400"
                  : totals.availableSeats <= 10
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {totals.availableSeats}
            </span>
          </div>
          <div>
            <span className="text-neutral-400">Posti auto assegnati: </span>
            <span className="font-semibold text-neutral-100">
              {totals.totalAuto}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500">
            Prenotazioni totali: {totals.totalBookings} – Pagate: {totals.paidCount}
          </div>
        </div>
      </div>

      {/* FILTRI / AZIONI */}
      <div className="mb-5 flex flex-wrap gap-2 items-center">
        <button
          onClick={loadBookings}
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

        {/* Filtro stato */}
        <div className="flex flex-wrap gap-1 ml-auto text-xs">
          {[
            { value: "all", label: "Tutti" },
            { value: "paid", label: "Pagati" },
            { value: "pending", label: "In attesa" },
            { value: "canceled", label: "Annullati" },
            { value: "expired", label: "Scaduti" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value as any)}
              className={`
                px-3 py-1 rounded-full border text-xs
                ${
                  filterStatus === f.value
                    ? "border-[#d4af37] text-[#f3cd63] bg-[#d4af37]/10"
                    : "border-neutral-700 text-neutral-300 hover:bg-neutral-900/50"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ricerca */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per nome referente, telefono o bookingId..."
          className="
            w-full max-w-sm text-xs px-3 py-2 rounded-full
            bg-neutral-900 border border-neutral-700
            focus:outline-none focus:ring-1 focus:ring-[#d4af37]
          "
        />
      </div>

      {/* LISTA PRENOTAZIONI */}
      {filtered.length === 0 ? (
        <p className="text-neutral-400 text-sm">
          Nessuna prenotazione trovata con i filtri attuali.
        </p>
      ) : (
        <div className="space-y-4 print:space-y-1">
          {filtered.map((b) => {
            const accCount = b.accompagnatori?.length || 0;

            return (
              <div
                key={b._id}
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
                      Referente
                    </div>
                    <div className="text-lg font-semibold">
                      {b.nomeReferente}
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">Telefono: </span>
                      {b.telefonoReferente}
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">
                        N. ospiti a cena:{" "}
                      </span>
                      {b.numeroOspiti}{" "}
                      <span className="text-neutral-400 text-xs">
                        (referente + {Math.max(b.numeroOspiti - 1, 0)} accompagnatori)
                      </span>
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">Posti auto: </span>
                      {b.postiAutoAssegnati}
                    </div>
                    {b.note && (
                      <div className="text-sm text-neutral-300 mt-1">
                        <span className="text-neutral-500">Note: </span>
                        {b.note}
                      </div>
                    )}

                    {accCount > 0 && (
                      <div className="mt-2 text-[11px] text-neutral-300">
                        <span className="text-neutral-500">
                          Dettaglio accompagnatori:
                        </span>
                        <ul className="mt-1 list-disc list-inside space-y-0.5">
                          {b.accompagnatori!.map((c, i) => (
                            <li key={i}>
                              {c.nome} {c.cognome} –{" "}
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
                  <div className="flex flex-col items-start sm:items-end gap-2 min-w-[180px]">
                    <div className="flex flex-col items-start sm:items-end gap-1">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Stato pagamento
                      </span>
                      <span
                        className={`
                          text-[11px] px-2 py-1 rounded-full border
                          ${statusClass(b.statoPagamento)}
                        `}
                      >
                        {statusLabel(b.statoPagamento)}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 text-right">
                      Booking ID: {b.bookingId}
                    </div>
                    <div className="text-[11px] text-neutral-500 text-right">
                      DB _id: {b._id}
                    </div>
                    {b.createdAt && (
                      <div className="text-[11px] text-neutral-500 text-right">
                        Creata: {formatDate(b.createdAt)}
                      </div>
                    )}
                    {b.updatedAt && (
                      <div className="text-[11px] text-neutral-500 text-right">
                        Aggiornata: {formatDate(b.updatedAt)}
                      </div>
                    )}

                    <p className="text-[11px] text-neutral-400 text-right">
                      Accesso Eclipse Noir con posto auto riservato
                      legato a questa prenotazione.
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
