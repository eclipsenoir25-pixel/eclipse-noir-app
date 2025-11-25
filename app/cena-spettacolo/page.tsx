"use client";

import { useState, useEffect } from "react";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const paypalUrl = process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_URL || "";

  // Aggiorna il numero di accompagnatori ogni volta che cambia numeroOspiti
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
    setSuccessMessage(null);

    if (!nomeReferente.trim() || !telefonoReferente.trim()) {
      setError("Nome referente e telefono sono obbligatori.");
      return;
    }

    if (numeroOspiti < 1) {
      setError("Il numero minimo di ospiti è 1.");
      return;
    }

    // Validazione accompagnatori
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
        setError("Risposta inattesa dal server. Nessun URL di pagamento ricevuto.");
      }
    } catch (err) {
      console.error(err);
      setError("Errore di connessione al server. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-900 px-4 py-10">
      <div className="w-full max-w-3xl bg-gray-950 text-gray-100 rounded-2xl shadow-xl border border-gray-800 p-6 md:p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Prenotazione Cena Spettacolo – Villa Tre Colli
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            Compila il modulo, controlla i dati e procedi al pagamento sicuro con Stripe.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dati referente */}
          <section className="space-y-3">
            <h2 className="text-lg font-medium border-b border-gray-800 pb-1">
              Dati referente
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Nome e cognome referente*</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={nomeReferente}
                  onChange={(e) => setNomeReferente(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Telefono referente*</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={telefonoReferente}
                  onChange={(e) => setTelefonoReferente(e.target.value)}
                  required
                />
              </div>
            </div>
          </section>

          {/* Ospiti e accompagnatori */}
          <section className="space-y-3">
            <h2 className="text-lg font-medium border-b border-gray-800 pb-1">
              Ospiti e accompagnatori
            </h2>
            <div className="grid md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm mb-1">
                  Numero totale ospiti (incluso il referente)*
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={numeroOspiti}
                  onChange={(e) => setNumeroOspiti(Number(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="text-sm text-gray-300">
                <p>
                  Accompagnatori da inserire:{" "}
                  <span className="font-semibold">
                    {Math.max(0, numeroOspiti - 1)}
                  </span>
                </p>
                <p className="mt-1">
                  Posti auto assegnati (1 ogni 5 persone, minimo 1):{" "}
                  <span className="font-semibold">{postiAuto}</span>
                </p>
              </div>
            </div>

            {companions.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-300">
                  Inserisci nome, cognome e telefono di ogni accompagnatore
                  (obbligatori).
                </p>
                {companions.map((c, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-3 gap-3 border border-gray-800 rounded-xl p-3 bg-gray-900/60"
                  >
                    <div>
                      <label className="block text-xs mb-1">
                        Nome accompagnatore {index + 1}*
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-700 bg-gray-950 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={c.nome}
                        onChange={(e) =>
                          handleCompanionChange(index, "nome", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Cognome*</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-700 bg-gray-950 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={c.cognome}
                        onChange={(e) =>
                          handleCompanionChange(index, "cognome", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Telefono*</label>
                      <input
                        type="tel"
                        className="w-full rounded-lg border border-gray-700 bg-gray-950 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            )}
          </section>

          {/* Note */}
          <section className="space-y-3">
            <h2 className="text-lg font-medium border-b border-gray-800 pb-1">
              Note (opzionali)
            </h2>
            <textarea
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Allergie, intolleranze, richieste particolari..."
            />
          </section>

          {/* Riepilogo e azioni */}
          <section className="space-y-4 border-t border-gray-800 pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
              <div>
                <p>
                  Totale ospiti:{" "}
                  <span className="font-semibold">{numeroOspiti}</span>
                </p>
                <p>
                  Prezzo per persona:{" "}
                  <span className="font-semibold">
                    € {DINNER_PRICE.toFixed(2).replace(".", ",")}
                  </span>
                </p>
                <p>
                  Totale ordine:{" "}
                  <span className="font-semibold text-green-400">
                    € {totalAmount.toFixed(2).replace(".", ",")}
                  </span>
                </p>
                <p>
                  Posti auto assegnati:{" "}
                  <span className="font-semibold">{postiAuto}</span>
                </p>
              </div>
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto inline-flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-60 px-5 py-2.5 text-sm font-medium transition"
                >
                  {isSubmitting
                    ? "Reindirizzamento al pagamento..."
                    : "Procedi al pagamento con Stripe"}
                </button>
                {paypalUrl && (
                  <div className="text-xs text-gray-400">
                    Preferisci PayPal?{" "}
                    <a
                      href={paypalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Clicca qui per pagare con PayPal
                    </a>
                    {" "}
                    (gestione manuale, posti confermati dopo verifica).
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 border border-red-500/40 bg-red-950/40 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="text-sm text-green-400 border border-green-500/40 bg-green-950/40 rounded-lg px-3 py-2">
                {successMessage}
              </div>
            )}
          </section>
        </form>
      </div>
    </div>
  );
}
