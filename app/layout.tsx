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
        <div className="relative min-h-screen overflow-hidden bg-black">

          {/* LOGO DI DEBUG */}
          <img
            src="/logo/logo-eclipse.png"
            alt="Eclipse Noir"
            className="pointer-events-none select-none fixed top-4 left-4 h-[160px] w-auto z-0 border-2 border-red-500 bg-white"
          />

          {/* Contenuto dell'app */}
          <div className="relative z-10">{children}</div>

        </div>
      </body>
    </html>
  );
}