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
    <header className="flex flex-col items-center py-6 bg-transparent z-50 relative">
      {/* LOGO SENZA GLOW */}
      <div className="flex flex-col items-center">
        <Image
          src="/logo/eclipse.png"
          width={130}
          height={130}
          alt="Eclipse Noir Logo"
          className="h-[130px] w-[130px] object-contain"
        />
      </div>

      {/* NAVBAR */}
      <nav className="mt-6 flex gap-8">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm tracking-widest uppercase transition-all ${
              pathname === l.href
                ? "text-[#d4af37] font-semibold"
                : "text-white/80 hover:text-[#d4af37]"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
