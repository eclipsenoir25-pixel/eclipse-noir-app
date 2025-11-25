import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900 text-gray-100 px-4 py-10 flex justify-center">
      <Suspense
        fallback={
          <div className="text-center text-gray-300">
            Caricamento dettagli prenotazione...
          </div>
        }
      >
        <SuccessClient />
      </Suspense>
    </main>
  );
}
