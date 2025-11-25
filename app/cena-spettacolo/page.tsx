"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const DINNER_PRICE = Number(process.env.NEXT_PUBLIC_DINNER_PRICE_EUR || "40");

type Companion = {
  nome: string;
  cognome: string;
  telefono: string;
};

export default function CenaSpettacoloPage() {
  const [nomeReferente, setNomeReferente] = useState("");
  const [telefonoReferente, setTelefonoReferente] = useState("");
  const [numeroOspiti, setNumeroOspiti] = useState(2);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paypalUrl = process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_URL || "";

  // allinea numero accompagnatori al numero ospiti
  useEffect(() => {
    const neededCompanions = Math.max(0, numeroOspiti - 1);
    setCompanions((prev) => {
      const copy = [...prev];
      if (copy.length < neededCompanions) {
        while (copy.length < neededCompanions) {
          copy.push({ nome: "", cognome: "", telefono: "" });
        }
      } else if (copy.length > neededCompanions) {
        copy.length = neededCompanions;
      }
      return copy;
    });
  }, [numeroOspiti]);

  const handleCompanionChange = (
    index: number,
    field: keyof Companion,
    value: string
  ) => {
    setCompanions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const postiAuto = Math.max(1, Math.ceil(numeroOspiti / 5));
  const totalAmount = DINNER_PRICE * numeroOspiti;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nomeReferente.trim() || !telefonoReferente.trim()) {
      setError("Nome referente e telefono sono obbligatori.");
      return;
    }

    if (numeroOspiti < 1) {
      setError("Il numero minimo di ospiti è 1.");
      return;
    }

    if (numeroOspiti > 1) {
      for (let i = 0; i < companions.length; i++) {
        const c = companions[i];
        if (!c.nome.trim() || !c.cognome.trim() || !c.telefono.trim()) {
          setError(
            `Compila tutti i campi per l'accompagnatore n. ${i + 1} (nome, cognome, telefono).`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dinner/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeReferente,
          telefonoReferente,
          numeroOspiti,
          accompagnatori: companions,
          note,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          data?.error ||
          "Si è verificato un errore nella creazione della sessione di pagamento.";
        setError(message);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Nessun URL di pagamento ricevuto dal server.");
      }
    } catch (err) {
      console.error(err);
      setError("Errore di connessione al server. Riprova tra qualche minuto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 text-gray-100 px-4 py-10 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* HEADER BRANDING */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-400">
              Eclipse Noir × Villa Tre Colli
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
              Cena Spettacolo – Prenotazione Online
            </h1>
            <p className="text-sm md:text-base text-gray-300 max-w-2xl">
              La Cena Spettacolo ufficiale firmata Eclipse Noir e ospitata nelle sale di
              Villa Tre Colli: cucina arianese rivisitata, atmosfera calda e un dopo cena
              con posto auto garantito all&apos;Eclipse Noir solo per chi prenota qui.
            </p>
          </div>

          {/* LOGHI */}
          <div className="flex items-center gap-4">
            {/* Logo Eclipse Noir */}
            <div className="relative h-10 w-32">
              <Image
                src="/logo/logo-eclipse.png"
                alt="Eclipse Noir"
                fill
                className="object-contain"
              />
            </div>

            <span className="text-sm text-gray-500">×</span>

            {/* Logo Villa Tre Colli – versione EXTRALUSSO */}
            <div
              className="
                relative h-12 w-36 
                rounded-xl 
                bg-white/10 
                backdrop-blur-md
                border border-purple-300/20
                shadow-[0_0_15px_rgba(168,85,247,0.25)]
                p-2
              "
            >
              <Image
                src="/logo/logo-villa-tre-colli.png"
                alt="Villa Tre Colli Agrifood B&B"
                fill
                className="object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.6)]"
              />
            </div>
          </div>
        </header>

        {/* LAYOUT 2 COLONNE */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
          {/* COLONNA SINISTRA – INFO E RIEPILOGO */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-purple-900/50 bg-black/60 p-6 space-y-4 shadow-xl">
              <h2 className="text-lg font-semibold mb-1">L’esperienza</h2>
              <p className="text-sm text-gray-300">
                Villa Tre Colli è la “casa in collina” che tutti vorrebbero per una
                serata speciale: sale curate nei dettagli, luci calde, atmosfera raccolta
                e un’eleganza che mette subito a proprio agio. Un ambiente contemporaneo
                ma accogliente, perfetto per vivere una cena che non è solo cena.
              </p>
              <p className="text-sm text-gray-300">
                In cucina Ariano Irpino diventa Tre Colli Style: prodotti del territorio,
                piatti della tradizione alleggeriti e presentati con gusto, pensati per
                una serata conviviale e non formale. La Cena Spettacolo nasce dalla
                collaborazione con Eclipse Noir: il DJ set parte già dentro Villa Tre
                Colli, l’atmosfera Eclipse prende forma durante la cena e il flusso
                continua nel club.{" "}
                <span className="font-semibold text-purple-200">
                  Chi prenota da questa pagina ha un vantaggio esclusivo: posto auto
                  riservato e garantito all&apos;Eclipse Noir per tutta la serata.
                </span>
              </p>

              <div className="grid gap-3 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-400" />
                  <span>Capienza massima: 90 ospiti complessivi.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                  <span>
                    Per chi prenota la Cena Spettacolo a Villa Tre Colli tramite questa
                    pagina, il posto auto all&apos;Eclipse Noir è garantito: 1 posto auto
                    riservato ogni 5 persone, con un minimo di 1 posto per prenotazione.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-purple-400" />
                  <span>
                    Pagamento sicuro con Stripe (carta, Apple Pay, Google Pay). Nessuna
                    conferma manuale: se il pagamento va a buon fine, la prenotazione è
                    automaticamente registrata e il tuo tavolo è confermato.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[0.7rem] mt-2">
                <span className="rounded-full border border-purple-500/70 px-3 py-1 text-purple-200">
                  Cucina arianese contemporanea
                </span>
                <span className="rounded-full border border-gray-600 px-3 py-1 text-gray-300">
                  Villa Tre Colli · Atmosfera unica
                </span>
                <span className="rounded-full border border-gray-600 px-3 py-1 text-gray-300">
                  Dopo cena Eclipse Noir con posto auto
                </span>
              </div>
            </div>

            {/* RIEPILOGO LIVE */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/80 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-100">
                Riepilogo prenotazione (live)
              </h3>
              <div className="text-sm space-y-1 text-gray-300">
                <p>
                  Ospiti totali:{" "}
                  <span className="font-semibold">{numeroOspiti}</span>
                </p>
                <p>
                  Prezzo a persona:{" "}
                  <span className="font-semibold">
                    € {DINNER_PRICE.toFixed(2).replace(".", ",")}
                  </span>
                </p>
                <p>
                  Totale previsto:{" "}
                  <span className="font-semibold text-green-400">
                    € {totalAmount.toFixed(2).replace(".", ",")}
                  </span>
                </p>
                <p>
                  Posti auto garantiti all&apos;Eclipse Noir:{" "}
                  <span className="font-semibold">{postiAuto}</span>
                </p>
              </div>
              {paypalUrl && (
                <p className="text-[0.7rem] text-gray-400">
                  In alternativa puoi richiedere il pagamento tramite PayPal dal canale
                  ufficiale di Villa Tre Colli; la conferma sarà gestita manualmente.
                </p>
              )}
            </div>
          </section>

          {/* COLONNA DESTRA – FORM SMART */}
          <section className="rounded-3xl border border-gray-800 bg-black/70 p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Dati referente */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-100">
                  1 · Dati referente
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">
                      Nome e cognome referente*
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={nomeReferente}
                      onChange={(e) => setNomeReferente(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">
                      Telefono referente (WhatsApp)*
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={telefonoReferente}
                      onChange={(e) => setTelefonoReferente(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Numero ospiti */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-100">
                  2 · Numero ospiti
                </h2>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">
                      Numero totale ospiti (incluso il referente)*
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={numeroOspiti}
                      onChange={(e) =>
                        setNumeroOspiti(Math.max(1, Number(e.target.value) || 1))
                      }
                      required
                    />
                  </div>
                  <div className="text-xs text-gray-300 space-y-1">
                    <p>
                      Accompagnatori da inserire:{" "}
                      <span className="font-semibold">
                        {Math.max(0, numeroOspiti - 1)}
                      </span>
                    </p>
                    <p>
                      Posti auto garantiti all&apos;Eclipse Noir:{" "}
                      <span className="font-semibold">{postiAuto}</span>{" "}
                      (1 ogni 5 ospiti, minimo 1).
                    </p>
                  </div>
                </div>
              </div>

              {/* Accompagnatori */}
              {companions.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-gray-100">
                    3 · Dati accompagnatori
                  </h2>
                  <p className="text-xs text-gray-400">
                    Inserisci nome, cognome e telefono di ogni accompagnatore. Servono
                    anche per la gestione degli accessi in sala e per l&apos;accoglienza
                    al club dopo cena.
                  </p>
                  <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {companions.map((c, index) => (
                      <div
                        key={index}
                        className="grid md:grid-cols-3 gap-3 border border-gray-800 rounded-2xl p-3 bg-gray-950/80"
                      >
                        <div className="space-y-1">
                          <label className="text-[0.7rem] text-gray-300">
                            Nome {index + 1}*
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-700 bg-black px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={c.nome}
                            onChange={(e) =>
                              handleCompanionChange(index, "nome", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[0.7rem] text-gray-300">
                            Cognome*
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-700 bg-black px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={c.cognome}
                            onChange={(e) =>
                              handleCompanionChange(index, "cognome", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[0.7rem] text-gray-300">
                            Telefono*
                          </label>
                          <input
                            type="tel"
                            className="w-full rounded-lg border border-gray-700 bg-black px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={c.telefono}
                            onChange={(e) =>
                              handleCompanionChange(index, "telefono", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-100">
                  4 · Note per la cucina / sala
                </h2>
                <textarea
                  className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Allergie, intolleranze, richieste particolari, orario di arrivo preferito..."
                />
              </div>

              {/* CTA + ERRORI */}
              <div className="space-y-3 border-t border-gray-800 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 px-4 py-2.5 text-sm font-medium transition"
                >
                  {isSubmitting
                    ? "Reindirizzamento al pagamento..."
                    : "Conferma e vai al pagamento Stripe"}
                </button>

                {error && (
                  <div className="text-xs text-red-300 border border-red-500/40 bg-red-950/40 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <p className="text-[0.7rem] text-gray-500">
                  Evento organizzato da <span className="font-semibold">Eclipse Noir</span>{" "}
                  in collaborazione con{" "}
                  <span className="font-semibold">Villa Tre Colli Agrifood B&B</span>.
                  Prenotando da questa pagina hai diritto ai posti auto riservati
                  all&apos;Eclipse Noir per il dopo cena.
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
