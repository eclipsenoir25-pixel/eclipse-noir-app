export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 text-gray-100 space-y-4">
        <h1 className="text-2xl font-semibold">Pagamento annullato ❌</h1>
        <p className="text-sm text-gray-300">
          Hai annullato il pagamento o qualcosa è andato storto durante la procedura.
        </p>
        <p className="text-sm text-gray-300">
          Nessun importo è stato addebitato e i posti non sono stati riservati.
        </p>
        <p className="text-xs text-gray-400">
          Se vuoi riprovare, torna alla pagina di prenotazione e invia di nuovo il modulo.
        </p>
        <div className="flex gap-3">
          <a
            href="/cena-spettacolo"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium transition"
          >
            Torna alla prenotazione
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium transition"
          >
            Vai alla home
          </a>
        </div>
      </div>
    </div>
  );
}
