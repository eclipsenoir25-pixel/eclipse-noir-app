// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Quando un utente apre il dominio principale,
  // lo mandiamo direttamente alla pagina lista
  redirect("/lista");
}
