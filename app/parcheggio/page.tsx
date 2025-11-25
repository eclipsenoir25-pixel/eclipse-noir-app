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
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Sfondo con immagine + maschera */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('/villa-tre-colli-bg.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/95" />

      {/* Contenuto */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Logo + titolo */}
        <div className="w-full max-w-xl mb-8 flex flex-col items-center">
          {/* Logo: cambia src con il tuo file reale (es. /logo-eclipse.svg) */}
          <img
            src="/logo-eclipse.png"
            alt="Eclipse Noir"
            className="h-14 mb-4 object-contain"
          />
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-300 mb-2 text-center">
            Villa Tre Colli · Evento Eclipse Noir
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-center">
            Prenota il tuo posto auto
          </h1>
          <p className="mt-3 text-center text-sm md:text-base text-neutral-300 max-w-lg">
            Parcheggio interno riservato, coperto da sicurezza.  
            <span className="font-semibold"> 8€ a posto</span>, quota dedicata alle prenotazioni via app
            (max 30 posti totali).
          </p>
        </div>

        {/* Card form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-neutral-950/80 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-5"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-neutral-300">
                Nome referente
              </label>
              <input
                className="w-full border border-white/15 bg-black/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/60"
                value={nomeReferente}
                onChange={(e) => setNomeReferente(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-neutral-300">
                Telefono referente
              </label>
              <input
                className="w-full border border-white/15 bg-black/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/60"
                value={telefonoReferente}
                onChange={(e) => setTelefonoReferente(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-neutral-300">
                Targa veicolo
              </label>
              <input
                className="w-full border border-white/15 bg-black/40 rounded-xl px-3 py-2 text-sm uppercase outline-none focus:border-white/60"
                value={targa}
                onChange={(e) => setTarga(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-neutral-300">
                Numero posti
              </label>
              <select
                className="w-full border border-white/15 bg-black/40 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/60"
                value={postiRichiesti}
                onChange={(e) => setPostiRichiesti(Number(e.target.value))}
              >
                <option value={1}>1 posto (8€)</option>
                <option value={2}>2 posti (16€)</option>
                <option value={3}>3 posti (24€)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 text-sm md:text-base font-semibold bg-white text-black hover:bg-neutral-200 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Reindirizzamento a Stripe..." : "Procedi al pagamento con Stripe"}
          </button>

          <p className="text-[11px] text-neutral-400 mt-2 text-center">
            Completando il pagamento ricevi conferma immediata del posto auto.
            Mostra il codice prenotazione all&apos;ingresso.
          </p>
        </form>
      </main>
    </div>
  );
}
