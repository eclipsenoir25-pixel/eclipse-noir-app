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
      {/* LOGO GROSSO CON GLOW */}
      <div className="flex flex-col items-center mb-4">
        <div className="rounded-full bg-black/50 p-3 shadow-[0_0_50px_rgba(212,175,55,0.8)]">
          <Image
            src="/logo/eclipse.png"
            width={140}
            height={140}
            alt="Eclipse Noir Logo"
            className="h-[140px] w-[140px] object-contain"
            priority
          />
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
