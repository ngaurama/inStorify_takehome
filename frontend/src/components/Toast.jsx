export default function Toast({ message, type = 'success' }) {
  return (
    <div 
      className={`
        fixed bottom-6
        right-6 px-4  py-2.5
        rounded-full border
        border-(--border)
        bg-(--bg-card)
        ${type === "error" 
          ? "text-(--high)" 
          : "text-(--text-secondary)"}
        text-xs font-normal
        shadow-(--shadow)
        flex items-center gap-1.5
        animate-[fadeUp_0.2s_ease-out]
      `}
    >
      <span className="text-xs">
        {type === 'error' ? '✕' : '✓'}
      </span>
      {message}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
