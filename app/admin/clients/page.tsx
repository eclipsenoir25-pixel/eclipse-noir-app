"use client";

import { useEffect, useMemo, useState } from "react";

type ClientRow = {
  id: string;
  guestName: string;
  phone: string;
  eventId: string;
  arrivalTime: string;
  status: string;
  createdAt: string | null;
};

export default function ClientsPage() {
  const [data, setData] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/clients");
        const json = await res.json();
        if (json.ok) {
          setData(json.data);
        } else {
          console.error("Errore caricamento clients:", json);
        }
      } catch (err) {
        console.error("Errore fetch /api/admin/clients:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const uniqueEvents = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.eventId) set.add(d.eventId);
    });
    return Array.from(set);
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch =
        !search ||
        row.guestName.toLowerCase().includes(search.toLowerCase()) ||
        row.phone.includes(search);

      const matchesEvent =
        eventFilter === "all" || row.eventId === eventFilter;

      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [data, search, eventFilter, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "APPROVATO";
      case "rejected":
        return "RIFIUTATO";
      default:
        return "IN ATTESA";
    }
  };

  const statusColorClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      default:
        return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      {/* HEADER */}
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 via-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.7)]">
            <span className="text-xs font-semibold tracking-[0.25em] text-black">
              EN
            </span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-[0.25em] uppercase text-amber-300">
              Eclipse Noir
            </h1>
            <p className="text-xs text-neutral-400">
              Dashboard ospiti · lista stampabile
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-xs">
          <a
            href="/admin/requests"
            className="px-3 py-1 rounded-full border border-neutral-700 hover:border-amber-400 hover:text-amber-300 transition"
          >
            Richieste
          </a>
          <a
            href="/admin/clients"
            className="px-3 py-1 rounded-full border border-amber-500 text-amber-300 bg-amber-500/10"
          >
            Database ospiti
          </a>
        </nav>
      </header>

      {/* CONTENUTO */}
      <main className="px-4 md:px-8 py-4 md:py-6">
        {/* FILTRI */}
        <section className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between print:hidden">
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-sm tracking-[0.3em] uppercase text-neutral-500">
              Ospiti in lista
            </h2>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-neutral-400 block mb-1">
                  Cerca per nome o telefono
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
                  placeholder="Es. Carmen, 347..."
                />
              </div>

              <div className="w-full md:w-44">
                <label className="text-xs text-neutral-400 block mb-1">
                  Evento
                </label>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
                >
                  <option value="all">Tutti</option>
                  {uniqueEvents.map((ev) => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-44">
                <label className="text-xs text-neutral-400 block mb-1">
                  Stato
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-amber-400"
                >
                  <option value="all">Tutti</option>
                  <option value="pending">In attesa</option>
                  <option value="approved">Approvati</option>
                  <option value="rejected">Rifiutati</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 md:items-end">
            <div className="text-xs text-neutral-400">
              Totale:{" "}
              <span className="text-amber-300 font-semibold">
                {filtered.length}
              </span>
              {" / "}
              <span className="text-neutral-500">{data.length}</span>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-semibold tracking-[0.25em] uppercase hover:bg-amber-400 transition shadow-[0_0_20px_rgba(212,175,55,0.5)]"
            >
              Stampa lista
            </button>
          </div>
        </section>

        {/* TABELLA */}
        <section className="mt-4 border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-4 py-3 text-left">Ospite</th>
                  <th className="px-4 py-3 text-left">Telefono</th>
                  <th className="px-4 py-3 text-left">Evento</th>
                  <th className="px-4 py-3 text-left">Arrivo</th>
                  <th className="px-4 py-3 text-left">Stato</th>
                  <th className="px-4 py-3 text-left">Richiesta</th>
                  <th className="px-4 py-3 text-left print:hidden">ID</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-neutral-500"
                    >
                      Caricamento ospiti...
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-neutral-500"
                    >
                      Nessun ospite trovato con questi filtri.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filtered.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-neutral-900 hover:bg-neutral-900/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[13px]">
                          {row.guestName || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.phone || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.eventId || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.arrivalTime || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center px-2 py-1 rounded-full border text-[10px] uppercase tracking-[0.15em] " +
                            statusColorClass(row.status)
                          }
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-neutral-500 print:hidden">
                        {row.id}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
