import type { Metadata } from "next";
import { Cinzel, Poppins } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Header from "./components/Header";

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
        className={`${poppins.variable} ${cinzel.variable} bg-black text-neutral-100 antialiased min-h-screen flex flex-col relative overflow-x-hidden`}
      >
        {/* MASCHERA GIGANTE SEMI-TRASPARENTE (30%) */}
        <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-30">
          <Image
            src="/logo/eclipse.png"
            alt="Eclipse Noir Mask"
            width={600}
            height={600}
            className="w-[420px] sm:w-[520px] md:w-[620px] h-auto object-contain"
          />
        </div>

        {/* VIGNETTA SCURA SOPRA LA MASCHERA */}
        <div
          className="
            pointer-events-none
            fixed
            inset-0
            z-10
            bg-[radial-gradient(circle,rgba(0,0,0,0)_0%,rgba(0,0,0,0.85)_75%)]
          "
        ></div>

        {/* HEADER */}
        <Header />

        {/* CONTENUTO PAGINE */}
        <main className="z-20 flex-grow px-4 py-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
