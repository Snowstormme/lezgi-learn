export default function LessonLoading() {
  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col justify-between animate-pulse">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl border-2 border-border bg-card" />
          <div className="h-4 flex-1 rounded-full bg-card" />
          <div className="h-7 w-14 shrink-0 rounded-xl border-2 border-border bg-card" />
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-8 w-3/4 rounded-xl bg-card" />
          <div className="h-24 rounded-2xl border-2 border-border bg-card" />
        </div>

        <div className="space-y-3 pt-2">
          <div className="h-14 rounded-2xl border-2 border-b-4 border-border bg-card" />
          <div className="h-14 rounded-2xl border-2 border-b-4 border-border bg-card" />
          <div className="h-14 rounded-2xl border-2 border-b-4 border-border bg-card" />
          <div className="h-14 rounded-2xl border-2 border-b-4 border-border bg-card" />
        </div>
      </div>

      <div className="mt-8 pt-4">
        <div className="h-14 rounded-2xl border-2 border-b-4 border-border bg-card" />
      </div>
    </div>
  );
}
