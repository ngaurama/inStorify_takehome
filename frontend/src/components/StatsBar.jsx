export default function StatsBar({ stats }) {
  const pct =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="mt-1.5 flex items-center gap-2.5">
      <div className="w-18 h-0.5 bg-(--border) rounded-xs overflow-hidden">
        <div
          className="h-full bg-(--accent) rounded-xs transition-[width] duration-500 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <span className="text-sm text-(--text-muted) font-light">
        {stats.completed}/{stats.total}
      </span>
    </div>
  );
}
