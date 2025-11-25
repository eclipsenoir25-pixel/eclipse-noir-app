"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();

  const nome = searchParams.get("nome") || "—";
  const targa = searchParams.get("targa") || "—";
  const posti = searchParams.get("posti") || "—";
  const codice = searchParams.get("codice") || "—";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Parcheggio confermato ✅
      </h1>

      <div className="w-full max-w-md space-y-3 border rounded-xl p-6">
        <p>
          <strong>Nome referente:</strong> {nome}
        </p>
        <p>
          <strong>Targa veicolo:</strong> {targa}
        </p>
        <p>
          <strong>Posti prenotati:</strong> {posti}
        </p>
        <p>
          <strong>Codice prenotazione:</strong> {codice}
        </p>
      </div>

      <p className="mt-6 text-sm opacity-70 text-center">
        Mostra questo codice all&apos;ingresso del parcheggio.
      </p>
    </main>
  );
}
