import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl">🔍</p>
      <h1 className="mt-4 text-2xl font-bold">Sahifa topilmadi</h1>
      <p className="mt-2 text-slate-500">
        Bu sahifa o&apos;chirilgan, ko&apos;chirilgan yoki manzil noto&apos;g&apos;ri
        kiritilgan bo&apos;lishi mumkin.
      </p>
      <div className="mt-6 flex gap-2">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          🏠 Bosh sahifa
        </Link>
        <Link
          href="/dokonlar"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          🏪 Do&apos;konlar
        </Link>
      </div>
    </div>
  )
}
