import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Listing } from '@/models/Listing'
import { Statistika, type IStatistika } from '@/models/Statistika'
import { joylashuvMatn, obunaFaolmi, obunaKunlari, sanaFormat } from '@/lib/format'
import { tarifNomi, limitMatn, elonLimiti } from '@/lib/tariflar'
import { oxirgiKunlar } from '@/lib/stat'

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

  // Bu oygi (30 kun) qiziqish — strategiya bo'yicha qiymatni ko'rsatamiz
  const kun30 = oxirgiKunlar(30)
  const statlar = await Statistika.find({
    shopId: user!.shopId,
    sana: { $gte: kun30[0] },
  }).lean<IStatistika[]>()
  const oyKorish = statlar.reduce(
    (s, d) => s + d.dokonKorish + d.elonKorish,
    0,
  )
  const oyAloqa = statlar.reduce(
    (s, d) => s + d.qongiroq + d.telegram + d.yolKorsatma,
    0,
  )

  const holat = HOLAT_BELGI[shop?.holati ?? 'kutilmoqda']
  const obunaTugashi = shop?.obunaTugashi
    ? new Date(shop.obunaTugashi).toISOString()
    : null
  const obunaFaol = obunaFaolmi(obunaTugashi)
  const obunaKun = obunaKunlari(obunaTugashi)
  const limit = elonLimiti(shop?.tarif)

  return (
    <div className="space-y-4">
      {/* Obuna banneri */}
      <div
        className={`rounded-2xl border p-4 ${
          obunaFaol
            ? obunaKun <= 5
              ? 'border-amber-200 bg-amber-50'
              : 'border-emerald-200 bg-emerald-50'
            : 'border-red-200 bg-red-50'
        }`}
      >
        {obunaFaol ? (
          <>
            <p className="font-medium">
              {obunaKun <= 5 ? '⚠️ Obuna tugayapti' : '✅ Obuna faol'}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {sanaFormat(obunaTugashi)} gacha ({obunaKun} kun qoldi). E&apos;lonlaringiz
              mijozlarga ko&apos;rinib turibdi.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium">
              ⛔ Obuna {obunaTugashi ? 'muddati tugagan' : 'faollashtirilmagan'}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Hozir e&apos;lonlaringiz mijozlarga <b>ko&apos;rinmaydi</b>. Obunani
              faollashtirish uchun admin bilan bog&apos;laning.
            </p>
          </>
        )}
      </div>

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

      {/* Tarif + limit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Tarif: <b className="text-slate-900">{tarifNomi(shop?.tarif)}</b>
          </span>
          <span className="text-sm text-slate-500">
            {elonlarSoni}/{limitMatn(shop?.tarif)} e&apos;lon
          </span>
        </div>
        {limit !== null && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                elonlarSoni >= limit ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, (elonlarSoni / limit) * 100)}%` }}
            />
          </div>
        )}
        {limit !== null && elonlarSoni >= limit && (
          <p className="mt-2 text-xs text-red-600">
            ⚠️ Limit tugadi. Yangi e&apos;lon uchun admindan tarifni oshirishni
            so&apos;rang.
          </p>
        )}
      </div>

      {/* Bu oygi qiziqish (real statistika) */}
      <Link
        href="/kabinet/statistika"
        className="block rounded-2xl border border-indigo-200 bg-indigo-50 p-4 transition hover:bg-indigo-100"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-indigo-900">
            📈 Bu oy mijozlar qiziqishi
          </p>
          <span className="text-xs text-indigo-600">Batafsil →</span>
        </div>
        <div className="mt-2 flex gap-6">
          <div>
            <p className="text-2xl font-bold text-indigo-700">{oyKorish}</p>
            <p className="text-xs text-slate-500">ko&apos;rish</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-700">{oyAloqa}</p>
            <p className="text-xs text-slate-500">aloqa (qo&apos;ng&apos;iroq/yo&apos;l)</p>
          </div>
        </div>
      </Link>

      {/* E'lonlar soni */}
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

      {/* Taklif qilish CTA */}
      <Link
        href="/kabinet/referral"
        className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100"
      >
        <div>
          <p className="text-sm font-medium text-emerald-900">
            🎁 Do&apos;st do&apos;konni taklif qiling
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            U to&apos;lov qilsa — ikkalangizga 1 oy bepul obuna
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-700">Havola →</span>
      </Link>

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
