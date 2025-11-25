import Image from "next/image";
import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 text-gray-100 px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-8 text-center">
        {/* Header loghi */}
        <div className="flex justify-center gap-4 items-center mb-4">
          <div className="relative h-12 w-36">
            <Image
              src="/logo/logo-eclipse.png"
              alt="Eclipse Noir"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-gray-400">×</span>
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
              alt="Villa Tre Colli"
              fill
              className="object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.6)]"
            />
          </div>
        </div>

        {/* Titolo */}
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-100">
          Pagamento annullato
        </h1>

        <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto">
          La tua prenotazione per la{" "}
          <span className="font-semibold">Cena Spettacolo</span> non è stata completata:
          il pagamento su Stripe è stato annullato o interrotto.
        </p>

        {/* Box info */}
        <div
          className="
            mt-6
            bg-black/60 
            border border-gray-800
            rounded-3xl
            shadow-[0_0_20px_rgba(0,0,0,0.6)]
            backdrop-blur-xl
            p-6
            text-left
            space-y-4
          "
        >
          <h2 className="text-sm font-semibold text-gray-100">
            Cosa significa adesso
          </h2>

          <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
            <li>
              Nessun tavolo è stato confermato a{" "}
              <span className="font-semibold">Villa Tre Colli</span>.
            </li>
            <li>
              Nessun importo è stato addebitato sulla tua carta.
            </li>
            <li>
              I <span className="font-semibold">posti auto riservati all&apos;Eclipse Noir</span>{" "}
              non risultano assegnati alla tua prenotazione.
            </li>
          </ul>

          <p className="text-xs text-gray-400 pt-2">
            Se hai chiuso per sbaglio la pagina di pagamento o hai avuto un problema di
            connessione, puoi ripetere la procedura in qualunque momento.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/cena-spettacolo"
            className="inline-flex justify-center px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition text-sm font-medium"
          >
            Torna alla prenotazione Cena Spettacolo
          </Link>

          <Link
            href="/"
            className="inline-flex justify-center px-6 py-2 rounded-xl border border-gray-700 text-xs text-gray-300 hover:bg-gray-900 transition"
          >
            Torna alla home
          </Link>

          <p className="text-[0.7rem] text-gray-500 mt-2">
            Se hai dubbi sul pagamento o vuoi assistenza, puoi contattarci su WhatsApp
            dai canali ufficiali di Eclipse Noir o Villa Tre Colli.
          </p>
        </div>
      </div>
    </main>
  );
}
