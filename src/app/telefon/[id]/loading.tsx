export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-6">
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="mt-3 flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="h-24 w-24 shrink-0 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-16 rounded bg-slate-100" />
          <div className="h-5 w-2/3 rounded bg-slate-100" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  )
}
