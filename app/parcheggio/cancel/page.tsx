export default function ParcheggioCancelPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4 text-center">
        Pagamento annullato
      </h1>
      <p className="opacity-80 mb-6 text-center">
        La prenotazione del posto auto non è stata completata.
      </p>
      <a
        href="/parcheggio"
        className="border rounded-lg px-4 py-2 font-semibold"
      >
        Torna alla prenotazione parcheggio
      </a>
    </main>
  );
}
