"use client";

import { useEffect, useMemo, useState } from "react";

type ClientItem = {
  _id: string;
  guestName: string;
  phone: string;
  eventId: string;
  status?: string; // es: "approved", "checked_in", ecc.
  totalCompanions?: number;
  checkedInAt?: string;
};

type StatusFilter = "all" | "approved" | "checked_in" | "other";

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  async function loadClients() {
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error("Errore caricamento clients:", err);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  // eventi unici per filtro
  const eventOptions = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.eventId) set.add(c.eventId);
    });
    return Array.from(set);
  }, [clients]);

  // filtri + ricerca
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const normalizedStatus = (c.status || "").toLowerCase();

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "approved"
          ? normalizedStatus === "approved"
          : statusFilter === "checked_in"
          ? normalizedStatus === "checked_in"
          : normalizedStatus !== "approved" &&
            normalizedStatus !== "checked_in";

      const matchesEvent =
        eventFilter === "all" ? true : c.eventId === eventFilter;

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        c.guestName.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term);

      return matchesStatus && matchesEvent && matchesSearch;
    });
  }, [clients, statusFilter, eventFilter, search]);

  // esportazione CSV (Excel)
  const handleExportCSV = () => {
    if (!filteredClients.length) return;

    const headers = [
      "Nome",
      "Telefono",
      "Evento",
      "Stato",
      "Accompagnatori",
      "Check-in",
    ];

    const rows = filteredClients.map((c) => [
      c.guestName || "",
      c.phone || "",
      c.eventId || "",
      c.status || "",
      c.totalCompanions?.toString() ?? "",
      c.checkedInAt ?? "",
    ]);

    let csvContent = headers.join(";") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(";") + "\n";
    });

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eclipse-noir-clienti.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // stampa / PDF (usa stampa browser -> Salva come PDF)
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto text-neutral-100">
      {/* HEADER PAGINA */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#d4af37]">
            Pannello Ospiti
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Lista ospiti approvati / in ingresso, con filtri e lista
            stampabile.
          </p>
        </div>

        {/* RIEPILOGO NUMERI */}
        <div className="flex flex-wrap gap-3 text-xs sm:text-[11px]">
          <span className="px-3 py-1.5 rounded-full border border-neutral-600 bg-black/40">
            Totali:{" "}
            <span className="font-semibold text-neutral-100">
              {clients.length}
            </span>
          </span>
          <span className="px-3 py-1.5 rounded-full border border-emerald-600/70 bg-emerald-900/20 text-emerald-200">
            Approved:{" "}
            {
              clients.filter(
                (c) =>
                  (c.status || "").toLowerCase() === "approved"
              ).length
            }
          </span>
          <span className="px-3 py-1.5 rounded-full border border-blue-600/70 bg-blue-900/25 text-blue-200">
            Check-in:{" "}
            {
              clients.filter(
                (c) =>
                  (c.status || "").toLowerCase() === "checked_in"
              ).length
            }
          </span>
        </div>
      </div>

      {/* FILTRI + RICERCA + EXPORT */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Filtri */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-wrap">
          {/* Filtro stato */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
              Stato
            </span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="bg-black/70 border border-neutral-700 rounded-full px-3 py-1.5 text-xs outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
            >
              <option value="all">Tutti</option>
              <option value="approved">Approved</option>
              <option value="checked_in">Check-in</option>
              <option value="other">Altri</option>
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

        {/* Search + export */}
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <div className="flex flex-col gap-1">
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

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="
                text-xs px-3 py-1.5 rounded-full
                border border-[#d4af37]/80 text-[#d4af37]
                hover:bg-[#d4af37]/10 transition
              "
            >
              Scarica Excel (CSV)
            </button>
            <button
              onClick={handlePrint}
              className="
                text-xs px-3 py-1.5 rounded-full
                bg-[#d4af37] text-black font-semibold
                hover:bg-[#f3cd63] transition
              "
            >
              Stampa / PDF
            </button>
          </div>
        </div>
      </div>

      {/* LISTA CLIENTI */}
      {filteredClients.length === 0 ? (
        <p className="text-neutral-400 text-sm">
          Nessun ospite trovato con i filtri attuali.
        </p>
      ) : (
        <div className="space-y-4 print:space-y-1">
          {filteredClients.map((c) => {
            const normalizedStatus = (c.status || "").toLowerCase();

            let statusLabel = c.status || "—";
            let statusClass =
              "border-neutral-500/60 text-neutral-300 bg-neutral-900/40";

            if (normalizedStatus === "approved") {
              statusLabel = "APPROVED";
              statusClass =
                "border-emerald-500/60 text-emerald-300 bg-emerald-900/20";
            } else if (normalizedStatus === "checked_in") {
              statusLabel = "CHECK-IN";
              statusClass =
                "border-blue-500/60 text-blue-200 bg-blue-900/25";
            }

            return (
              <div
                key={c._id}
                className="
                  rounded-xl border border-[#d4af37]/25 bg-black/60
                  px-4 py-3 sm:px-5 sm:py-4
                  shadow-[0_0_18px_rgba(0,0,0,0.7)]
                  print:shadow-none print:border print:border-black
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Info ospite */}
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-[0.2em]">
                      Ospite
                    </div>
                    <div className="text-lg font-semibold">
                      {c.guestName}
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">Telefono: </span>
                      {c.phone}
                    </div>
                    <div className="text-sm text-neutral-300">
                      <span className="text-neutral-500">Evento: </span>
                      {c.eventId}
                    </div>
                    {typeof c.totalCompanions === "number" && (
                      <div className="text-sm text-neutral-300">
                        <span className="text-neutral-500">
                          Accompagnatori:{" "}
                        </span>
                        {c.totalCompanions}
                      </div>
                    )}
                    {c.checkedInAt && (
                      <div className="text-[11px] text-neutral-500">
                        Check-in: {c.checkedInAt}
                      </div>
                    )}
                    <div className="text-[11px] text-neutral-500">
                      ID: {c._id}
                    </div>
                  </div>

                  {/* Stato */}
                  <div className="flex flex-col items-start sm:items-end gap-2 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        Stato
                      </span>
                      <span
                        className={`
                          text-[11px] px-2 py-1 rounded-full border
                          ${statusClass}
                        `}
                      >
                        {statusLabel}
                      </span>
                    </div>
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
