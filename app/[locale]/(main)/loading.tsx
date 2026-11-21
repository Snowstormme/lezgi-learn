export default function MainSectionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-[76px] rounded-2xl border-2 border-b-4 border-[#B92B1C] bg-primary/80" />
      <div className="space-y-4">
        <div className="h-20 rounded-2xl border-2 border-border bg-card" />
        <div className="h-20 rounded-2xl border-2 border-border bg-card" />
        <div className="h-20 rounded-2xl border-2 border-border bg-card" />
        <div className="h-20 rounded-2xl border-2 border-border bg-card" />
      </div>
    </div>
  );
}
