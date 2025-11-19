"use client";

import { useEffect, useState } from "react";

type RequestItem = {
  _id: string;
  guestName: string;
  phone: string;
  eventId: string;
  status: string;
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);

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
      // aggiorna lo stato in memoria senza aspettare il reload
      setRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: "approved" } : r
        )
      );
    }

    // e in ogni caso ricarica dal server
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

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div style={{ padding: "32px", color: "white" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Richieste Eclipse Noir
      </h1>

      {requests.length === 0 && <p>Nessuna richiesta.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {requests.map((req) => (
          <li
            key={req._id}
            style={{
              padding: "16px",
              marginBottom: "12px",
              border: "1px solid #666",
              borderRadius: "8px",
              background: "#111",
            }}
          >
            <div><strong>Nome:</strong> {req.guestName}</div>
            <div><strong>Telefono:</strong> {req.phone}</div>
            <div><strong>Evento:</strong> {req.eventId}</div>
            <div><strong>Status:</strong> {req.status}</div>
            <div><strong>ID:</strong> {req._id}</div>

            <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
              <button
                onClick={() => approveRequest(req._id)}
                style={{
                  padding: "8px 14px",
                  background: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Approva
              </button>

              <button
                onClick={() => rejectRequest(req._id)}
                style={{
                  padding: "8px 14px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Rifiuta
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
