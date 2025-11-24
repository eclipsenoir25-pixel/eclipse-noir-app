"use client";

const STATUS_STYLES = {
  success: {
    border: "border-emerald-500",
    bg: "bg-emerald-900/40",
    text: "text-emerald-200",
    label: "APPROVATO",
  },
  error: {
    border: "border-red-500",
    bg: "bg-red-900/40",
    text: "text-red-200",
    label: "NEGATO",
  },
  warning: {
    border: "border-amber-500",
    bg: "bg-amber-900/40",
    text: "text-amber-100",
    label: "ATTENZIONE",
  },
};

export default function ScanResultModal({
  open,
  status = "success", // "success" | "error" | "warning"
  title,
  message,
  onClose,
}) {
  if (!open) return null;

  const style = STATUS_STYLES[status] ?? STATUS_STYLES.success;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Overlay scuro */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modale */}
      <div
        className={`
          relative z-50 w-full max-w-sm mx-4
          rounded-2xl border-2 ${style.border}
          ${style.bg} shadow-[0_0_30px_rgba(0,0,0,0.9)]
          px-6 py-5
        `}
      >
        {/* Label in alto */}
        <div className="text-xs tracking-[0.25em] uppercase text-[#d4af37]/80 text-center mb-2">
          Eclipse Noir
        </div>

        {/* Stato */}
        <div className="text-center mb-3">
          <div className={`text-[11px] uppercase tracking-[0.2em] ${style.text}`}>
            {style.label}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-[#f5f5f5]">
            {title}
          </h2>
        </div>

        {/* Messaggio */}
        {message && (
          <p className={`text-sm text-center ${style.text} mb-5`}>
            {message}
          </p>
        )}

        {/* Bottone OK */}
        <button
          onClick={onClose}
          className="
            w-full rounded-full px-4 py-2.5 text-sm font-semibold
            bg-[#d4af37] text-black
            tracking-wide uppercase
            hover:bg-[#f3cd63] transition
          "
        >
          OK
        </button>
      </div>
    </div>
  );
}
