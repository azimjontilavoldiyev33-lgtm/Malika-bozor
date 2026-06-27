import Link from 'next/link'
import { notFound } from 'next/navigation'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'
import '@/models/Shop' // populate uchun ro'yxatdan o'tkazamiz
import { narxFormat, joylashuvMatn } from '@/lib/format'
import type { ListingNatija } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function TelefonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!mongoose.isValidObjectId(id)) notFound()

  await dbConnect()
  const listing = await Listing.findById(id).lean()
  if (!listing) notFound()

  // Shu model bo'yicha barcha tasdiqlangan do'kon narxlari (arzon -> qimmat)
  const taqqoslash = (await Listing.aggregate([
    {
      $match: {
        faol: true,
        model: new RegExp(
          '^' + listing.model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
          'i',
        ),
      },
    },
    {
      $lookup: {
        from: 'shops',
        localField: 'shopId',
        foreignField: '_id',
        as: 'dokon',
      },
    },
    { $unwind: '$dokon' },
    {
      $match: {
        'dokon.holati': 'tasdiqlangan',
        'dokon.obunaTugashi': { $gt: new Date() },
      },
    },
    { $sort: { narx: 1 } },
  ])) as unknown as ListingNatija[]

  const natijalar = JSON.parse(JSON.stringify(taqqoslash)) as ListingNatija[]
  const engArzon = natijalar[0]?.narx ?? listing.narx

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm text-indigo-600 hover:underline">
        ← Orqaga
      </Link>

      {/* Telefon sarlavhasi */}
      <div className="mt-3 flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-4xl">
          {listing.rasmlar?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.rasmlar[0]}
              alt={listing.model}
              className="h-full w-full object-cover"
            />
          ) : (
            '📱'
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-600">{listing.brend}</p>
          <h1 className="text-xl font-bold">
            {listing.model}
            {listing.xotira ? ` · ${listing.xotira}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {natijalar.length} ta do&apos;konda mavjud
          </p>
          {natijalar.length > 0 && (
            <p className="mt-1 text-sm">
              Eng arzon:{' '}
              <span className="font-bold text-emerald-600">
                {narxFormat(engArzon, listing.valyuta)}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Narx solishtirish ro'yxati */}
      <h2 className="mt-6 mb-2 text-lg font-semibold">
        Do&apos;konlar narxi (arzondan qimmatga)
      </h2>
      <div className="space-y-2">
        {natijalar.map((n, i) => (
          <Link
            key={n._id}
            href={`/dokon/${n.dokon._id}`}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-3 transition hover:shadow-md ${
              i === 0 ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
            }`}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-slate-500">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{n.dokon.nomi}</p>
              <p className="truncate text-xs text-slate-500">
                📍 {joylashuvMatn(n.dokon.joylashuv)}
              </p>
              <div className="mt-0.5 flex gap-2 text-xs">
                <span
                  className={
                    n.holati === 'yangi'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }
                >
                  {n.holati === 'yangi' ? 'Yangi' : 'Ishlatilgan'}
                </span>
                {!n.bor && <span className="text-slate-400">· Tugagan</span>}
              </div>
            </div>
            <div className="text-right">
              {i === 0 && (
                <span className="mb-1 block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  Eng arzon
                </span>
              )}
              <p className="font-bold">{narxFormat(n.narx, n.valyuta)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
