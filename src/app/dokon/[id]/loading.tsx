export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-6">
      <div className="h-4 w-20 rounded bg-slate-200" />
      <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="h-6 w-1/2 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 w-28 rounded-xl bg-slate-100" />
          <div className="h-9 w-28 rounded-xl bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 h-64 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  )
}
