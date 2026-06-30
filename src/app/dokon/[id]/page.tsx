import { notFound } from 'next/navigation'
import mongoose from 'mongoose'
import type { Metadata } from 'next'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Listing } from '@/models/Listing'
import PhoneCard from '@/components/PhoneCard'
import KorishKuzat from '@/components/KorishKuzat'
import KuzatilganLink from '@/components/KuzatilganLink'
import OrqagaTugma from '@/components/OrqagaTugma'
import {
  joylashuvMatn,
  yandexNavigator,
  googleNavigator,
  xaritaEmbed,
  obunaFaolmi,
  telegramHavola,
} from '@/lib/format'
import type { ListingNatija } from '@/lib/types'

export const revalidate = 60 // 60s keshlash (tezlik uchun)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) return { title: "Do'kon — Malika Bozor" }
  await dbConnect()
  const shop = await Shop.findById(id).lean()
  if (!shop) return { title: 'Topilmadi — Malika Bozor' }
  return {
    title: `${shop.nomi} — Malika Bozor`,
    description: `${shop.nomi} (${joylashuvMatn(shop.joylashuv)}) — telefonlar, narxlar va joylashuv.`,
  }
}

export default async function DokonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()

  await dbConnect()
  const shopDoc = await Shop.findById(id).lean()
  if (
    !shopDoc ||
    shopDoc.holati !== 'tasdiqlangan' ||
    !obunaFaolmi(shopDoc.obunaTugashi)
  )
    notFound()
  const shop = JSON.parse(JSON.stringify(shopDoc))

  const elonlarDoc = await Listing.find({ shopId: id, faol: true })
    .sort({ createdAt: -1 })
    .lean()
  const elonlar = JSON.parse(JSON.stringify(elonlarDoc)) as ListingNatija[]
  // PhoneCard do'kon ma'lumotini kutadi
  const elonlarKartochka = elonlar.map((e) => ({ ...e, dokon: shop }))

  const geo = shop.geo

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Do'kon sahifasi ko'rilishini qayd qilamiz */}
      <KorishKuzat shopId={shop._id} tur="dokonKorish" />
      <OrqagaTugma />

      {/* Do'kon sarlavhasi */}
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-xl font-bold">{shop.nomi}</h1>
        <p className="mt-1 text-slate-600">📍 {joylashuvMatn(shop.joylashuv)}</p>
        {shop.ishVaqti && (
          <p className="mt-1 text-sm text-slate-500">🕐 {shop.ishVaqti}</p>
        )}

        {/* Aloqa tugmalari */}
        <div className="mt-4 flex flex-wrap gap-2">
          {shop.telefon && (
            <KuzatilganLink
              shopId={shop._id}
              tur="qongiroq"
              href={`tel:${shop.telefon}`}
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              📞 Qo&apos;ng&apos;iroq
            </KuzatilganLink>
          )}
          {shop.telegram && (
            <KuzatilganLink
              shopId={shop._id}
              tur="telegram"
              href={telegramHavola(shop.telegram)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              ✈️ Telegram
            </KuzatilganLink>
          )}
          {geo && (
            <>
              <KuzatilganLink
                shopId={shop._id}
                tur="yolKorsatma"
                href={yandexNavigator(geo.lat, geo.lng)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                🧭 Yo&apos;l ko&apos;rsat (Yandex)
              </KuzatilganLink>
              <KuzatilganLink
                shopId={shop._id}
                tur="yolKorsatma"
                href={googleNavigator(geo.lat, geo.lng)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                🧭 Google Maps
              </KuzatilganLink>
            </>
          )}
        </div>
      </div>

      {/* Xarita */}
      {geo && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <iframe
            src={xaritaEmbed(geo.lat, geo.lng)}
            className="h-64 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Do'kon joylashuvi"
          />
        </div>
      )}

      {/* Do'kon telefonlari */}
      <h2 className="mt-6 mb-3 text-lg font-semibold">
        Do&apos;kon telefonlari ({elonlar.length})
      </h2>
      {elonlarKartochka.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {elonlarKartochka.map((l) => (
            <PhoneCard key={l._id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
          Hozircha e&apos;lonlar yo&apos;q
        </p>
      )}
    </div>
  )
}
