"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// QR Code (solo lato client)
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

type RequestItem = {
  _id: string;
  guestName: string;
  phone: string;
  eventId: string;
  status: string; // "pending" | "approved" | "rejected" (in pratica)
  code?: string; // opzionale: se in futuro l'API restituisce un codice QR specifico
};

type QrModalState = {
  open: boolean;
  request: RequestItem | null;
};

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [qrModal, setQrModal] = useState<QrModalState>({
    open: false,
    request: null,
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  async function loadRequests() {
    const res = await fetch("/api/requests/list");
    const data = await res.json();
    setRequests(data.requests || []);
  }

  async function approveRequest(id: string) {
    const res = await fetch("/api/requests/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.ok) {
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "approved" } : r))
      );
    }

    loadRequests();
  }

  async function rejectRequest(id: string) {
    const res = await fetch("/api/requests/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.ok) {
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
      );
    }

    loadRequests();
  }

  function openQrModal(req: RequestItem) {
    setQrModal({
      open: true,
      request: req,
    });
  }

  function closeQrModal() {
    setQrModal({
      open: false,
      request: null,
    });
  }

  useEffect(() => {
    loadRequests();
  }, []);

  // Ricaviamo la lista di eventi unici per il filtro
  const eventOptions = useMemo(() => {
    const set = new Set<string>();
    requests.forEach((r) => {
      if (r.eventId) set.add(r.eventId);
    });
    return Array.from(set);
  }, [requests]);

  // Applichiamo filtri + ricerca
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus =
        statusFilter === "all" ? true : req.status === statusFilter;

      const matchesEvent =
        eventFilter === "all" ? true : req.eventId === eventFilter;

      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        req.guestName.toLowerCase().includes(normalizedSearch) ||
        req.phone.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesEvent && matchesSearch;
    });
  }, [requests, statusFilter, eventFilter, search]);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto text-neutral-100">
      {/* HEADER PAGINA */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#d4af37]">
            Richieste Eclipse Noir
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gestione richieste ospiti, approvazione e QR per l&apos;ingresso.
          </p>
        </div>

        {/* PICCOLO RIEPILOGO NUMERI */}
        <div className="flex flex-wrap gap-3 text-xs sm:text-[11px]">
          <span className="px-3 py-1.5 rounded-full border border-neutral-600 bg-black/40">
            Totali:{" "}
            <span className="font-semibold text-neutral-100">
              {requests.length}
            </span>
          </span>
          <span className="px-3 py-1.5 rounded-full border border-emerald-600/70 bg-emerald-900/20 text-emerald-200">
            Approved:{" "}
            {
              requests.filter((r) => r.status === "approved")
                .length
            }
          </span>
          <span className="px-3 py-1.5 rounded-full border border-yellow-600/70 bg-yellow-900/20 text-yellow-100">
            Pending:{" "}
            {
              requests.filter((r) => r.status === "pending")
                .length
            }
          </span>
          <span className="px-3 py-1.5 rounded-full border border-red-600/70 bg-red-900/25 text-red-200">
            Rejected:{" "}
            {
              requests.filter((r) => r.status === "rejected")
                .length
            }
          </span>
        </div>
      </div>

      {/* FILTRI + RICERCA */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-wrap">
          {/* Filtro stato */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Stato
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-black/70 border border-neutral-700 rounded-full px-3 py-1.5 text-xs outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            >
              <option value="all">Tutti</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Filtro evento */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Evento
            </span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="bg-black/70 border border-neutral-700 rounded-full px-3 py-1.5 text-xs outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            >
              <option value="all">Tutti</option>
              {eventOptions.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ricerca */}
        <div className="flex flex-col gap-1 w-full lg:w-72">
          <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            Ricerca
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-black/70 border border-neutral-700 rounded-full px-3 py-2 text-xs outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            placeholder="Cerca per nome o telefono"
          />
        </div>
      </div>

      {/* LISTA RICHIESTE */}
      {filteredRequests.length === 0 ? (
        <p className="text-neutral-400 text-sm">
          Nessuna richiesta trovata con i filtri attuali.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="rounded-xl border border-[#d4af37]/30 bg-black/60 px-4 py-3 sm:px-5 sm:py-4 shadow-[0_0_20px_rgba(0,0,0,0.7)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Info ospite */}
                <div className="space-y-1">
                  <div className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                    Ospite
                  </div>
                  <div className="text-lg font-semibold">
                    {req.guestName}
                  </div>
                  <div className="text-sm text-neutral-300">
                    <span className="text-neutral-500">Telefono: </span>
                    {req.phone}
                  </div>
                  <div className="text-sm text-neutral-300">
                    <span className="text-neutral-500">Evento: </span>
                    {req.eventId}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    ID richiesta: {req._id}
                  </div>
                </div>

                {/* Stato + azioni */}
                <div className="flex flex-col items-start sm:items-end gap-2 min-w-[180px]">
                  {/* Stato */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                      Stato
                    </span>
                    <span
                      className={`
                        text-[11px] px-2 py-1 rounded-full border
                        ${
                          req.status === "approved"
                            ? "border-emerald-500/60 text-emerald-300 bg-emerald-900/20"
                            : req.status === "rejected"
                            ? "border-red-500/60 text-red-300 bg-red-900/20"
                            : "border-yellow-500/60 text-yellow-200 bg-yellow-900/20"
                        }
                      `}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Bottoni */}
                  <div className="flex flex-wrap gap-2 justify-end mt-1">
                    <button
                      onClick={() => approveRequest(req._id)}
                      className="
                        text-xs px-3 py-1.5 rounded-full
                        bg-emerald-500 text-black font-semibold
                        hover:bg-emerald-400 transition
                      "
                    >
                      Approva
                    </button>

                    <button
                      onClick={() => rejectRequest(req._id)}
                      className="
                        text-xs px-3 py-1.5 rounded-full
                        bg-red-600 text-white font-semibold
                        hover:bg-red-500 transition
                      "
                    >
                      Rifiuta
                    </button>

                    <button
                      onClick={() => openQrModal(req)}
                      disabled={req.status !== "approved"}
                      className={`
                        text-xs px-3 py-1.5 rounded-full border
                        ${
                          req.status === "approved"
                            ? "border-[#d4af37]/80 text-[#d4af37] hover:bg-[#d4af37]/10"
                            : "border-neutral-600 text-neutral-500 opacity-60 cursor-not-allowed"
                        }
                        transition
                      `}
                    >
                      Mostra QR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE QR A SCHERMO INTERO */}
      {qrModal.open && qrModal.request && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeQrModal}
          />

          {/* Contenuto modale */}
          <div
            className="
              relative z-50 w-full max-w-sm mx-4
              rounded-2xl border border-[#d4af37]/60 bg-black/90
              px-6 py-5 shadow-[0_0_40px_rgba(0,0,0,0.95)]
            "
          >
            <div className="text-xs tracking-[0.25em] uppercase text-[#d4af37]/80 text-center mb-2">
              Eclipse Noir
            </div>

            <h2 className="text-center text-lg font-semibold text-neutral-50">
              QR per l&apos;ingresso
            </h2>
            <p className="mt-1 text-center text-xs text-neutral-400">
              Ospite:{" "}
              <span className="font-semibold text-neutral-200">
                {qrModal.request.guestName}
              </span>
              <br />
              Evento:{" "}
              <span className="text-neutral-200">
                {qrModal.request.eventId}
              </span>
            </p>

            <div className="mt-4 flex justify-center">
              <div className="bg-white p-3 rounded-xl">
                <QRCode
                  value={
                    qrModal.request.code && qrModal.request.code.trim()
                      ? qrModal.request.code.trim()
                      : qrModal.request._id
                  }
                  size={220}
                />
              </div>
            </div>

            <p className="mt-3 text-[11px] text-neutral-400 text-center">
              Mostra questo QR all&apos;ospite su WhatsApp, oppure fallo
              scansionare all&apos;ingresso da Eclipse Noir.
            </p>

            <button
              onClick={closeQrModal}
              className="
                mt-5 w-full rounded-full px-4 py-2.5 text-sm font-semibold
                bg-[#d4af37] text-black
                tracking-wide uppercase
                hover:bg-[#f3cd63] transition
              "
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
