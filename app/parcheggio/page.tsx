"use client";

import { useState } from "react";

export default function ParcheggioPage() {
  const [nomeReferente, setNomeReferente] = useState("");
  const [telefonoReferente, setTelefonoReferente] = useState("");
  const [targa, setTarga] = useState("");
  const [postiRichiesti, setPostiRichiesti] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/parking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeReferente,
          telefonoReferente,
          targa,
          postiRichiesti,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Errore durante la creazione della prenotazione.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("URL di pagamento non ricevuto.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Errore imprevisto. Riprova tra poco.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4 text-center">
        Prenota il tuo posto auto 🅿️
      </h1>
      <p className="mb-6 text-center opacity-80">
        Posti auto disponibili: quota dedicata all&apos;app (max 30).
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 border rounded-xl p-6"
      >
        <div>
          <label className="block mb-1 text-sm font-medium">Nome referente</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={nomeReferente}
            onChange={(e) => setNomeReferente(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Telefono referente</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={telefonoReferente}
            onChange={(e) => setTelefonoReferente(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Targa veicolo</label>
          <input
            className="w-full border rounded-lg px-3 py-2 uppercase"
            value={targa}
            onChange={(e) => setTarga(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Numero posti</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={postiRichiesti}
            onChange={(e) => setPostiRichiesti(Number(e.target.value))}
          >
            <option value={1}>1 posto</option>
            <option value={2}>2 posti</option>
            <option value={3}>3 posti</option>
          </select>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg px-4 py-2 font-semibold border"
        >
          {loading ? "Reindirizzamento a Stripe..." : "Procedi al pagamento"}
        </button>
      </form>
    </main>
  );
}
