import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY as string;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY non è impostata nelle variabili d'ambiente.");
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20" as any,
});

type SuccessPageProps = {
  searchParams: {
    session_id?: string;
  };
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 text-gray-100 space-y-3">
          <h1 className="text-xl font-semibold">Pagamento ricevuto</h1>
          <p className="text-sm text-gray-300">
            Pagamento completato. Se non visualizzi il riepilogo, contatta la struttura
            per conferma della prenotazione.
          </p>
        </div>
      </div>
    );
  }

  let guests: string | undefined;
  let carSlots: string | undefined;
  let customerName: string | undefined;
  let amountTotal: number | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    });

    guests = session.metadata?.numeroOspiti || session.metadata?.guests;
    carSlots = session.metadata?.postiAuto || session.metadata?.carSlots;
    amountTotal = session.amount_total;
    customerName =
      (session.customer_details?.name as string | undefined) ||
      session.metadata?.nomeReferente;
  } catch (error) {
    console.error("Errore nel recupero della sessione Stripe:", error);
  }

  const totalFormatted =
    amountTotal !== null
      ? (amountTotal / 100).toFixed(2).replace(".", ",")
      : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 text-gray-100 space-y-4">
        <h1 className="text-2xl font-semibold">Prenotazione confermata ✅</h1>

        <p className="text-sm text-gray-300">
          Grazie{customerName ? `, ${customerName}` : ""}! Il pagamento è andato a buon
          fine e la tua prenotazione per la Cena Spettacolo è confermata.
        </p>

        <div className="text-sm space-y-1 border border-gray-800 rounded-xl p-3 bg-gray-900/60">
          {guests && (
            <p>
              Ospiti totali: <span className="font-semibold">{guests}</span>
            </p>
          )}
          {carSlots && (
            <p>
              Posti auto assegnati:{" "}
              <span className="font-semibold">{carSlots}</span>
            </p>
          )}
          {totalFormatted && (
            <p>
              Totale pagato:{" "}
              <span className="font-semibold text-green-400">
                € {totalFormatted}
              </span>
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Riceverai a breve una conferma via email da Stripe e, se previsto,
          un messaggio da Villa Tre Colli con i dettagli organizzativi
          (orario di arrivo, regole parcheggio, ecc.).
        </p>

        <a
          href="/"
          className="inline-flex mt-2 items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-sm font-medium transition"
        >
          Torna alla home
        </a>
      </div>
    </div>
  );
}
