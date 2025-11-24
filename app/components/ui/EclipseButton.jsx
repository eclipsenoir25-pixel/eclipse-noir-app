export default function EclipseButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`
        px-6 py-3 rounded-lg font-semibold uppercase tracking-wider
        bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]
        hover:bg-[#f0c859] transition-all
        ${className}
      `}
    >
      {children}
    </button>
  );
}
