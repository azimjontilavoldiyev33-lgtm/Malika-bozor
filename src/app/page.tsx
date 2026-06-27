import QidiruvPanel from '@/components/QidiruvPanel'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        {/* Dekorativ bloblar */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-10 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            🛍️ Malika bozori onlayn
          </span>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Barcha telefonlar — <span className="text-yellow-300">bitta joyda</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-indigo-100 sm:text-base">
            Telefonni qidiring, do&apos;konlar narxini solishtiring, joylashuvini
            ko&apos;ring. Bozorni aylanmang, aldanmang — vaqtingizni tejang.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              ✅ Narx solishtirish
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              📍 Do&apos;kon joylashuvi
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              🛡️ Aldovsiz xarid
            </span>
          </div>
        </div>
      </section>

      {/* Qidiruv + natijalar */}
      <section className="pb-16">
        <QidiruvPanel />
      </section>
    </div>
  )
}
