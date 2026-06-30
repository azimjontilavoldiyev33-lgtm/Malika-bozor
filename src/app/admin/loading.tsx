export default function Loading() {
  return (
    <div className="animate-pulse grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-white" />
      ))}
    </div>
  )
}
