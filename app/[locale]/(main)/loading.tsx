export default function MainTabLoading() {
  return (
    <div
      className="animate-tab-enter space-y-4 py-1"
      aria-busy="true"
      aria-label="Загрузка раздела"
    >
      <div className="space-y-2">
        <div className="h-7 w-44 animate-pulse rounded-xl bg-secondary" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-secondary/70" />
      </div>
      <div className="h-32 w-full animate-pulse rounded-2xl border-2 border-border bg-card/70" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-2xl border-2 border-border bg-card/60" />
        <div className="h-24 animate-pulse rounded-2xl border-2 border-border bg-card/60" />
      </div>
      <div className="h-28 w-full animate-pulse rounded-2xl border-2 border-border bg-card/50" />
    </div>
  );
}
