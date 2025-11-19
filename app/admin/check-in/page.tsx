"use client";

import { useState } from "react";

type CheckResult = {
  ok: boolean;
  status: string;
  message: string;
  guestName?: string;
  eventId?: string;
  usedAt?: string;
};

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        status: "error",
        message: "Errore di connessione al server",
      } as CheckResult);
    } finally {
      setLoading(false);
    }
  }

  const color =
    !result
      ? "#fff"
      : result.ok
      ? "#16a34a" // verde
      : result.status === "already_used" || result.status === "not_approved"
      ? "#f97316" // arancione
      : "#ef4444"; // rosso

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "32px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <h1 style={{ fontSize: "26px", marginBottom: "16px" }}>
          Eclipse Noir – Check-in
        </h1>

        <p style={{ marginBottom: "12px", color: "#ccc" }}>
          Incolla o scansiona il codice ricevuto su WhatsApp e premi INVIO.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "8px", marginBottom: "20px" }}
        >
          <input
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Incolla qui il codice"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #444",
              background: "#111",
              color: "#fff",
            }}
          />
          <button
            type="submit"
            disabled={loading || !token.trim()}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              background: loading ? "#444" : "#22c55e",
              color: "#000",
              fontWeight: 600,
              cursor: loading || !token.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Controllo..." : "Check"}
          </button>
        </form>

        {result && (
          <div
            style={{
              borderRadius: "10px",
              border: `1px solid ${color}`,
              padding: "16px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: "8px",
                color,
                fontSize: "18px",
              }}
            >
              {result.message}
            </div>

            {result.guestName && (
              <div>
                <strong>Nome:</strong> {result.guestName}
              </div>
            )}
            {result.eventId && (
              <div>
                <strong>Evento:</strong> {result.eventId}
              </div>
            )}
            {result.usedAt && (
              <div>
                <strong>Usato il:</strong>{" "}
                {new Date(result.usedAt).toLocaleString()}
              </div>
            )}
            {result.status && (
              <div style={{ marginTop: "4px", fontSize: "12px", color: "#aaa" }}>
                Stato tecnico: {result.status}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
