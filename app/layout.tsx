import type { Metadata } from "next";
import { Cinzel, Poppins } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Eclipse Noir",
  description: "Eclipse Noir – gestione ingressi, lista ospiti e controllo QR.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body
        className={`${poppins.variable} ${cinzel.variable} bg-black text-neutral-100 antialiased`}
      >
        <div className="min-h-screen bg-black">
          {/* HEADER CON LOGO - DEBUG VISIBILE */}
          <header className="w-full border-b border-neutral-800 bg-black/90 px-4 py-3 flex items-center gap-3">
            <img
              src="/logo/logo-eclipse.png"
              alt="Eclipse Noir"
              className="h-16 w-auto border-2 border-red-500 bg-white"
            />
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.3em] uppercase text-neutral-400">
                Eclipse Noir
              </span>
              <span className="text-[11px] text-neutral-500">
                Sistema ingressi · lista ospiti · QR access
              </span>
            </div>
          </header>

          {/* CONTENUTO PAGINE */}
          <main className="relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
