export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-20 rounded-2xl border border-slate-200 bg-white" />
      <div className="h-16 rounded-2xl border border-slate-200 bg-white" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl border border-slate-200 bg-white" />
        <div className="h-24 rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  )
}
