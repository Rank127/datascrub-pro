export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-800 rounded" />
          <div className="h-4 w-64 bg-slate-800/60 rounded" />
        </div>
        <div className="h-9 w-24 bg-slate-800 rounded" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-800/40 rounded-lg border border-slate-800" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-64 bg-slate-800/30 rounded-lg border border-slate-800" />
    </div>
  );
}
