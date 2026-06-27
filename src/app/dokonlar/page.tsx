import Link from 'next/link'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { joylashuvMatn } from '@/lib/format'

export const revalidate = 60 // 60s keshlash (tezlik uchun)

export default async function DokonlarPage() {
  await dbConnect()
  const shopsDoc = await Shop.find({
    holati: 'tasdiqlangan',
    obunaTugashi: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean()
  const shops = JSON.parse(JSON.stringify(shopsDoc))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-xl font-bold">Do&apos;konlar</h1>
      <p className="mt-1 text-sm text-slate-500">{shops.length} ta do&apos;kon</p>

      <div className="mt-4 space-y-2">
        {shops.map(
          (s: {
            _id: string
            nomi: string
            joylashuv?: { blok?: string; qator?: string; dokonRaqami?: string }
            telefon?: string
          }) => (
            <Link
              key={s._id}
              href={`/dokon/${s._id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold">{s.nomi}</p>
                <p className="text-xs text-slate-500">
                  📍 {joylashuvMatn(s.joylashuv)}
                </p>
              </div>
              <span className="text-indigo-600">→</span>
            </Link>
          ),
        )}
        {shops.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
            Hozircha tasdiqlangan do&apos;konlar yo&apos;q
          </p>
        )}
      </div>
    </div>
  )
}
