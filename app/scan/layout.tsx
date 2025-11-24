import type { ReactNode } from "react";
import EclipsePanel from "../components/ui/EclipsePanel";

export default function ScanLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex justify-center px-4 py-10">
      <EclipsePanel className="w-full max-w-2xl">
        {children}
      </EclipsePanel>
    </section>
  );
}
