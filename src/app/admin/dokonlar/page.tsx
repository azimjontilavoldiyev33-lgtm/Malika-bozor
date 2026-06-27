import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { joylashuvMatn } from '@/lib/format'
import DokonHolat from '@/components/DokonHolat'
import ObunaBoshqaruv from '@/components/ObunaBoshqaruv'
import type { ShopStatus } from '@/models/Shop'
import type { Tarif } from '@/lib/tariflar'

const HOLAT: Record<ShopStatus, { matn: string; rang: string }> = {
  kutilmoqda: { matn: 'Kutilmoqda', rang: 'bg-amber-100 text-amber-700' },
  tasdiqlangan: { matn: 'Tasdiqlangan', rang: 'bg-emerald-100 text-emerald-700' },
  bloklangan: { matn: 'Bloklangan', rang: 'bg-red-100 text-red-700' },
}

interface AdminShop {
  _id: string
  nomi: string
  telefon?: string
  holati: ShopStatus
  obunaTugashi: string | null
  tarif: Tarif
  joylashuv?: { blok?: string; qator?: string; dokonRaqami?: string }
}

export default async function AdminDokonlar() {
  await dbConnect()
  // Kutilayotganlar tepada, keyin qolganlari
  const shopsDoc = await Shop.find({})
    .sort({ holati: 1, createdAt: -1 })
    .lean()
  const shops = JSON.parse(JSON.stringify(shopsDoc)) as AdminShop[]

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Do&apos;konlar ({shops.length})</h2>

      <div className="space-y-2">
        {shops.map((s) => (
          <div
            key={s._id}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{s.nomi}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${HOLAT[s.holati].rang}`}
                  >
                    {HOLAT[s.holati].matn}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  📍 {joylashuvMatn(s.joylashuv)}
                </p>
                {s.telefon && (
                  <p className="text-xs text-slate-500">📞 {s.telefon}</p>
                )}
              </div>
            </div>
            <div className="mt-3">
              <DokonHolat shopId={s._id} holati={s.holati} />
            </div>
            <div className="mt-2">
              <ObunaBoshqaruv
                shopId={s._id}
                obunaTugashi={s.obunaTugashi}
                tarif={s.tarif}
              />
            </div>
          </div>
        ))}
        {shops.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
            Hozircha do&apos;konlar yo&apos;q
          </p>
        )}
      </div>
    </div>
  )
}
