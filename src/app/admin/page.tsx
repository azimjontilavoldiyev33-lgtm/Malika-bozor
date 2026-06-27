import Link from 'next/link'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Listing } from '@/models/Listing'
import { User } from '@/models/User'

export default async function AdminBosh() {
  await dbConnect()
  const [
    dokonlarJami,
    kutilayotgan,
    tasdiqlangan,
    bloklangan,
    elonlarJami,
    foydalanuvchilar,
  ] = await Promise.all([
    Shop.countDocuments({}),
    Shop.countDocuments({ holati: 'kutilmoqda' }),
    Shop.countDocuments({ holati: 'tasdiqlangan' }),
    Shop.countDocuments({ holati: 'bloklangan' }),
    Listing.countDocuments({}),
    User.countDocuments({}),
  ])

  const kartalar = [
    { son: dokonlarJami, matn: 'Jami do\'konlar', rang: 'text-slate-900' },
    { son: tasdiqlangan, matn: 'Tasdiqlangan', rang: 'text-emerald-600' },
    { son: kutilayotgan, matn: 'Kutilmoqda', rang: 'text-amber-600' },
    { son: bloklangan, matn: 'Bloklangan', rang: 'text-red-600' },
    { son: elonlarJami, matn: 'Jami e\'lonlar', rang: 'text-indigo-600' },
    { son: foydalanuvchilar, matn: 'Foydalanuvchilar', rang: 'text-slate-900' },
  ]

  return (
    <div className="space-y-4">
      {kutilayotgan > 0 && (
        <Link
          href="/admin/dokonlar"
          className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100"
        >
          <p className="font-medium text-amber-800">
            ⏳ {kutilayotgan} ta do&apos;kon tasdiqlashni kutmoqda →
          </p>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {kartalar.map((k) => (
          <div
            key={k.matn}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className={`text-3xl font-bold ${k.rang}`}>{k.son}</p>
            <p className="text-sm text-slate-500">{k.matn}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
