"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// QR Code (solo lato client)
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

type RequestItem = {
  _id: string;
  guestName: string;
  phone: string;
  eventId: string;
  status: string;
  // se l'API già restituisce un codice QR dedicato, lo leggiamo qui
  code?: string;
};

type QrModalState = {
  open: boolean;
  request: RequestItem | null;
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [qrModal, setQrModal] = useState<QrModalState>({
    open: false,
    request: null,
  });

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
        prev.map((r) =>
          r._id === id ? { ...r, status: "approved" } : r
        )
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
        prev.map((r) =>
          r._id === id ? { ...r, status: "rejected" } : r
        )
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

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto text-neutral-100">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#d4af37] mb-2">
        Richieste Eclipse Noir
      </h1>
      <p className="text-sm text-neutral-400 mb-6">
        Gestione richieste ospiti, approvazione e QR per l&apos;ingresso.
      </p>

      {requests.length === 0 && (
        <p className="text-neutral-400 text-sm">Nessuna richiesta.</p>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req._id}
            className="rounded-xl border border-[#d4af37]/30 bg-black/60 px-4 py-3 sm:px-5 sm:py-4 shadow-[0_0_20px_rgba(0,0,0,0.7)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              {/* Info ospite */}
              <div className="space-y-1">
                <div className="text-sm text-neutral-400 uppercase tracking-[0.2em]">
                  Ospite
                </div>
                <div className="text-lg font-semibold">{req.guestName}</div>
                <div className="text-sm text-neutral-300">
                  <span className="text-neutral-500">Telefono: </span>
                  {req.phone}
                </div>
                <div className="text-sm text-neutral-300">
                  <span className="text-neutral-500">Evento: </span>
                  {req.eventId}
                </div>
                <div className="text-xs text-neutral-500">
                  ID richiesta: {req._id}
                </div>
              </div>

              {/* Stato + azioni */}
              <div className="flex flex-col items-start sm:items-end gap-2 min-w-[160px]">
                {/* Stato */}
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Stato
                  </span>
                  <span
                    className={`
                      text-xs px-2 py-1 rounded-full border
                      ${
                        req.status === "approved"
                          ? "border-emerald-500/60 text-emerald-300 bg-emerald-900/20"
                          : req.status === "rejected"
                          ? "border-red-500/60 text-red-300 bg-red-900/20"
                          : "border-neutral-500/60 text-neutral-300 bg-neutral-900/40"
                      }
                    `}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>

                {/* Bottoni azione */}
                <div className="flex flex-wrap gap-2 justify-end">
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
