import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Listing } from '@/models/Listing'
import { joylashuvMatn } from '@/lib/format'

const HOLAT_BELGI: Record<string, { matn: string; rang: string }> = {
  kutilmoqda: {
    matn: 'Tasdiqlash kutilmoqda',
    rang: 'bg-amber-100 text-amber-700',
  },
  tasdiqlangan: { matn: 'Tasdiqlangan', rang: 'bg-emerald-100 text-emerald-700' },
  bloklangan: { matn: 'Bloklangan', rang: 'bg-red-100 text-red-700' },
}

export default async function KabinetBosh() {
  const user = await getCurrentUser()
  await dbConnect()
  const shop = await Shop.findById(user!.shopId).lean()
  const elonlarSoni = await Listing.countDocuments({ shopId: user!.shopId })
  const faolSoni = await Listing.countDocuments({
    shopId: user!.shopId,
    faol: true,
  })

  const holat = HOLAT_BELGI[shop?.holati ?? 'kutilmoqda']

  return (
    <div className="space-y-4">
      {/* Holat banneri */}
      {shop?.holati !== 'tasdiqlangan' && (
        <div
          className={`rounded-2xl border p-4 ${
            shop?.holati === 'bloklangan'
              ? 'border-red-200 bg-red-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p className="font-medium">
            {shop?.holati === 'bloklangan'
              ? '⛔ Do\'koningiz bloklangan'
              : '⏳ Do\'koningiz admin tasdiqini kutmoqda'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {shop?.holati === 'bloklangan'
              ? 'Admin bilan bog\'laning.'
              : 'Tasdiqlangach e\'lonlaringiz mijozlarga ko\'rinadi. Hozir e\'lon qo\'shib qo\'yishingiz mumkin.'}
          </p>
        </div>
      )}

      {/* Do'kon kartochkasi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{shop?.nomi}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${holat.rang}`}
          >
            {holat.matn}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          📍 {joylashuvMatn(shop?.joylashuv)}
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-3xl font-bold">{elonlarSoni}</p>
          <p className="text-sm text-slate-500">Jami e&apos;lonlar</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-3xl font-bold text-emerald-600">{faolSoni}</p>
          <p className="text-sm text-slate-500">Faol e&apos;lonlar</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/kabinet/elon/yangi"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          ➕ Yangi e&apos;lon qo&apos;shish
        </Link>
        <Link
          href="/kabinet/sozlama"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
        >
          ⚙️ Do&apos;kon sozlamasi
        </Link>
      </div>
    </div>
  )
}
