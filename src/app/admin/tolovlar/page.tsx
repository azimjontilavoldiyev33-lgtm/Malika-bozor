import { dbConnect } from '@/lib/db'
import { Tolov } from '@/models/Tolov'
import { Shop } from '@/models/Shop'
import { narxFormat, sanaFormat } from '@/lib/format'
import { tarifNomi } from '@/lib/tariflar'
import TolovTasdiqla from '@/components/TolovTasdiqla'

export const dynamic = 'force-dynamic'

const HOLAT_BELGI: Record<string, { matn: string; rang: string }> = {
  kutilmoqda: { matn: 'Kutilmoqda', rang: 'bg-amber-100 text-amber-700' },
  tolangan: { matn: 'To\'langan', rang: 'bg-emerald-100 text-emerald-700' },
  bekor: { matn: 'Bekor', rang: 'bg-red-100 text-red-700' },
}

const PROVIDER_NOMI: Record<string, string> = {
  payme: 'Payme',
  click: 'Click',
  karta: 'Karta',
}

export default async function AdminTolovlar() {
  await dbConnect()
  // Shop modeli populate uchun ro'yxatdan o'tgan bo'lishi kerak
  void Shop
  const tolovlar = await Tolov.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate<{ shopId: { nomi: string } | null }>('shopId', 'nomi')
    .lean()

  const tolangan = tolovlar.filter((t) => t.holati === 'tolangan')
  const jamiDaromad = tolangan.reduce((s, t) => s + t.summa, 0)

  return (
    <div className="space-y-4">
      {/* Statistika */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-emerald-600">
            {narxFormat(jamiDaromad)}
          </p>
          <p className="text-sm text-slate-500">Jami daromad</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold">{tolangan.length}</p>
          <p className="text-sm text-slate-500">To&apos;langan</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold">{tolovlar.length}</p>
          <p className="text-sm text-slate-500">Jami urinish</p>
        </div>
      </div>

      {/* Ro'yxat */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {tolovlar.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Hali to&apos;lovlar yo&apos;q.
          </p>
        ) : (
          <div className="space-y-2">
            {tolovlar.map((t) => {
              const belgi = HOLAT_BELGI[t.holati]
              const shopNomi =
                t.shopId && typeof t.shopId === 'object' && 'nomi' in t.shopId
                  ? t.shopId.nomi
                  : 'Noma\'lum do\'kon'
              return (
                <div
                  key={String(t._id)}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{shopNomi}</p>
                    <p className="text-xs text-slate-400">
                      {tarifNomi(t.tarif)} · {t.oy} oy ·{' '}
                      {PROVIDER_NOMI[t.provider] ?? t.provider} ·{' '}
                      {sanaFormat(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{narxFormat(t.summa)}</span>
                    {t.provider === 'karta' && t.holati === 'kutilmoqda' ? (
                      <TolovTasdiqla id={String(t._id)} />
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${belgi.rang}`}
                      >
                        {belgi.matn}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
