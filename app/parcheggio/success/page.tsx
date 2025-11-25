import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function ParcheggioSuccessPage() {
  return (
    <Suspense fallback={<div>Caricamento della tua prenotazione parcheggio...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
