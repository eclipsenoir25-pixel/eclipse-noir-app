"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SuccessClient() {
  const params = useSearchParams();

  const nome = params.get("nome") || "—";
  const ospiti = params.get("ospiti") || "—";
  const postiAuto = params.get("postiAuto") || "—";
  const ref =
    params.get("ref") ||
    Math.random().toString(36).substr(2, 8).toUpperCase();

  return (
    <div className="w-full max-w-3xl space-y-8 text-center">
      {/* Header */}
      <div className="flex justify-center gap-4 items-center mb-6">
        <div className="relative h-12 w-36">
          <Image
            src="/logo/logo-eclipse.png"
            alt="Eclipse Noir"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-gray-400">×</span>
        <div className="relative h-12 w-36">
          <Image
            src="/logo/logo-villa-tre-colli.png"
            alt="Villa Tre Colli"
            fill
            className="object-contain drop-shadow-[0_3px_6px_rgba(255,255,255,0.7)]"
          />
        </div>
      </div>

      <h1 className="text-3xl font-semibold text-gray-100">
        Prenotazione Confermata ✔️
      </h1>
      <p className="text-gray-300 max-w-xl mx-auto">
        La tua Cena Spettacolo è ufficialmente registrata.{" "}
        Tavolo confermato a <strong>Villa Tre Colli</strong> e
        <span className="text-purple-300 font-semibold">
          {" "}
          posto auto garantito all’Eclipse Noir{" "}
        </span>
        per il dopo cena.
      </p>

      {/* TICKET */}
      <div
        className="
          relative
          mt-8
          bg-black/60 
          border border-purple-500/30
          rounded-3xl
          shadow-[0_0_25px_rgba(168,85,247,0.25)]
          backdrop-blur-xl
          p-8
          flex flex-col gap-6
          text-left
        "
      >
        {/* Intestazione ticket */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-purple-300 tracking-widest">
            BIGLIETTO ELETTRONICO
          </h2>
          <span className="text-gray-500 text-xs">#{ref}</span>
        </div>

        {/* Dettagli */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Nome referente</p>
            <p className="text-sm font-medium">{nome}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Ospiti totali</p>
            <p className="text-sm font-medium">{ospiti}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Posti auto garantiti</p>
            <p className="text-sm font-medium text-green-400">
              {postiAuto}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Location cena</p>
            <p className="text-sm font-medium">
              Villa Tre Colli · Ariano Irpino
            </p>
          </div>
        </div>

        <hr className="border-gray-800 my-4" />

        {/* Info aggiuntive */}
        <div className="space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed">
            Il DJ set Eclipse Noir inizierà già durante la cena.  
            Dopo cena potrai raggiungere l’Eclipse Noir con i{" "}
            <strong>posti auto riservati e garantiti</strong> per la tua prenotazione.
          </p>
          <p className="text-sm text-gray-400">
            Mostra questo biglietto all’arrivo.
          </p>
        </div>
      </div>

      {/* CTA finale */}
      <div className="mt-8 flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex justify-center px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium"
        >
          Torna alla Home
        </Link>

        <p className="text-xs text-gray-500">
          Se hai dubbi o richieste, contattaci su WhatsApp.
        </p>
      </div>
    </div>
  );
}
