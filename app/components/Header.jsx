"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/lista", label: "Lista" },
    { href: "/scan", label: "Scan" },
    { href: "/events", label: "Eventi" },
    { href: "/admin/requests", label: "Richieste" },
  ];

  return (
    <header className="flex flex-col items-center pt-8 pb-6 bg-transparent z-50 relative">
      {/* LOGO GROSSO, CIRCOLARE, CON GLOW */}
      <div className="flex flex-col items-center mb-4">
        <div className="rounded-full p-1 shadow-[0_0_50px_rgba(212,175,55,0.9)] bg-[radial-gradient(circle,rgba(212,175,55,0.8)_0%,rgba(0,0,0,0.95)_70%)]">
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-black">
            <Image
              src="/logo/eclipse.png"
              alt="Eclipse Noir Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="mt-4 flex gap-10">
        {links.map((l) => {
          const active = pathname === l.href;

          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-xs tracking-[0.35em] uppercase transition-all duration-200 ${
                active
                  ? "text-[#d4af37] font-semibold"
                  : "text-white/70 hover:text-[#d4af37]"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
