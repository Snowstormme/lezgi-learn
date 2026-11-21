export default function LessonResultLoading() {
  return (
    <div className="mx-auto max-w-md py-10 animate-pulse">
      <div className="space-y-6 rounded-3xl border-2 border-b-[6px] border-border bg-card p-6">
        <div className="mx-auto h-16 w-16 rounded-2xl border-2 border-border bg-background" />
        <div className="space-y-2">
          <div className="mx-auto h-7 w-2/3 rounded-xl bg-background" />
          <div className="mx-auto h-4 w-1/2 rounded-lg bg-background" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-2xl border-2 border-border bg-background" />
          <div className="h-20 rounded-2xl border-2 border-border bg-background" />
          <div className="h-20 rounded-2xl border-2 border-border bg-background" />
        </div>
        <div className="h-12 rounded-2xl border-2 border-border bg-background" />
      </div>
    </div>
  );
}
