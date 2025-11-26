import type { ReactNode } from "react";
import Image from "next/image";
import Header from "../components/Header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-black text-neutral-100">
      {/* MASCHERA GIGANTE */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-30">
        <Image
          src="/logo/eclipse.png"
          alt="Eclipse Noir Mask"
          width={600}
          height={600}
          className="w-[420px] sm:w-[520px] md:w-[620px] h-auto object-contain"
        />
      </div>

      {/* VIGNETTA SCURA */}
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-10
          bg-[radial-gradient(circle,rgba(0,0,0,0)_0%,rgba(0,0,0,0.85)_75%)]
        "
      />

      {/* HEADER ADMIN */}
      <Header />

      {/* CONTENUTO ADMIN */}
      <main className="z-20 flex-grow px-4 py-8 max-w-4xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
