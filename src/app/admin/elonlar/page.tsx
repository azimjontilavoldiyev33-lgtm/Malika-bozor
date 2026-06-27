import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'
import '@/models/Shop'
import { narxFormat } from '@/lib/format'
import ElonModeratsiya from '@/components/ElonModeratsiya'

interface AdminElon {
  _id: string
  brend: string
  model: string
  xotira?: string
  narx: number
  valyuta: 'UZS' | 'USD'
  faol: boolean
  holati: 'yangi' | 'ishlatilgan'
  rasmlar: string[]
  shopId?: { nomi?: string }
}

export default async function AdminElonlar() {
  await dbConnect()
  const elonlarDoc = await Listing.find({})
    .populate('shopId', 'nomi')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()
  const elonlar = JSON.parse(JSON.stringify(elonlarDoc)) as AdminElon[]

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">E&apos;lonlar ({elonlar.length})</h2>

      <div className="space-y-2">
        {elonlar.map((e) => (
          <div
            key={e._id}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${
              e.faol ? 'border-slate-200' : 'border-amber-200 bg-amber-50/40'
            }`}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-xl">
              {e.rasmlar?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.rasmlar[0]}
                  alt={e.model}
                  className="h-full w-full object-cover"
                />
              ) : (
                '📱'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {e.model}
                {e.xotira ? ` · ${e.xotira}` : ''}
                {!e.faol && (
                  <span className="ml-1 text-xs font-normal text-amber-600">
                    (yashirilgan)
                  </span>
                )}
              </p>
              <p className="text-sm font-bold text-slate-700">
                {narxFormat(e.narx, e.valyuta)}
              </p>
              <p className="truncate text-xs text-slate-500">
                🏪 {e.shopId?.nomi ?? 'Noma\'lum do\'kon'}
              </p>
            </div>
            <ElonModeratsiya listingId={e._id} faol={e.faol} />
          </div>
        ))}
        {elonlar.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-slate-500">
            Hozircha e&apos;lonlar yo&apos;q
          </p>
        )}
      </div>
    </div>
  )
}
