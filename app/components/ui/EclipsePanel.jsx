export default function EclipsePanel({ children, className = "" }) {
  return (
    <div
      className={`
        border border-[#d4af37]/40 rounded-xl 
        bg-black/40 backdrop-blur-sm 
        p-6 shadow-[0_0_12px_rgba(212,175,55,0.1)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
