import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Tolov } from '@/models/Tolov'
import TolovForm from '@/components/TolovForm'
import { narxFormat, obunaFaolmi, obunaKunlari, sanaFormat } from '@/lib/format'
import { tarifNomi, type Tarif } from '@/lib/tariflar'

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

export default async function TolovSahifa({
  searchParams,
}: {
  searchParams: Promise<{ holat?: string }>
}) {
  const { holat } = await searchParams
  const user = await getCurrentUser()
  await dbConnect()
  const shop = await Shop.findById(user!.shopId).lean()
  const tolovlar = await Tolov.find({ shopId: user!.shopId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  const obunaTugashi = shop?.obunaTugashi
    ? new Date(shop.obunaTugashi).toISOString()
    : null
  const faol = obunaFaolmi(obunaTugashi)
  const kun = obunaKunlari(obunaTugashi)
  const tarif = (shop?.tarif ?? 'boshlangich') as Tarif

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Obunani to&apos;lash</h2>
        <p className="mt-1 text-sm text-slate-500">
          To&apos;lov tasdiqlangach e&apos;lonlaringiz mijozlarga ko&apos;rinadi.
        </p>
      </div>

      {/* To'lovdan qaytgandagi xabar */}
      {holat === 'natija' && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
          To&apos;lov qabul qilindi. Tasdiqlangach obunangiz avtomatik yangilanadi —
          bu sahifani biroz vaqtdan so&apos;ng yangilang.
        </div>
      )}

      {/* Joriy obuna holati */}
      <div
        className={`rounded-2xl border p-4 ${
          faol ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
        }`}
      >
        <p className="text-sm">
          Joriy tarif: <b>{tarifNomi(shop?.tarif)}</b> ·{' '}
          {faol
            ? `obuna ${sanaFormat(obunaTugashi)} gacha (${kun} kun)`
            : 'obuna faol emas'}
        </p>
      </div>

      {/* To'lov formasi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <TolovForm
          joriyTarif={tarif}
          karta={process.env.NEXT_PUBLIC_TOLOV_KARTA ?? ''}
          egasi={process.env.NEXT_PUBLIC_TOLOV_KARTA_EGASI ?? ''}
        />
      </div>

      {/* To'lovlar tarixi */}
      {tolovlar.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-600">
            To&apos;lovlar tarixi
          </p>
          <div className="space-y-2">
            {tolovlar.map((t) => {
              const belgi = HOLAT_BELGI[t.holati]
              return (
                <div
                  key={String(t._id)}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {tarifNomi(t.tarif)} · {t.oy} oy
                    </p>
                    <p className="text-xs text-slate-400">
                      {PROVIDER_NOMI[t.provider] ?? t.provider} ·{' '}
                      {sanaFormat(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{narxFormat(t.summa)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${belgi.rang}`}
                    >
                      {belgi.matn}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
