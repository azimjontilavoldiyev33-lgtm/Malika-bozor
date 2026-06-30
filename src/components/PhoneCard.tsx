import Link from 'next/link'
import { narxFormat, joylashuvMatn } from '@/lib/format'
import type { ListingNatija } from '@/lib/types'

export default function PhoneCard({ listing }: { listing: ListingNatija }) {
  const rasm = listing.rasmlar?.[0]

  return (
    <Link
      href={`/telefon/${listing._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white card-shadow transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {rasm ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rasm}
            alt={`${listing.brend} ${listing.model}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-5xl opacity-60">
            📱
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold backdrop-blur ${
            listing.holati === 'yangi'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-amber-500/90 text-white'
          }`}
        >
          {listing.holati === 'yangi' ? 'Yangi' : 'Ishlatilgan'}
        </span>
        {!listing.bor && (
          <span className="absolute right-2 top-2 rounded-full bg-slate-900/75 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            Tugagan
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
          {listing.brend}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
          {listing.model}
          {listing.xotira ? ` · ${listing.xotira}` : ''}
        </h3>
        <p className="mt-1 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-extrabold text-transparent">
          {narxFormat(listing.narx, listing.valyuta)}
        </p>
        <div className="mt-auto border-t border-slate-100 pt-2 text-xs text-slate-500">
          <p className="truncate font-medium text-slate-700">
            {listing.dokon?.nomi}
          </p>
          <p className="truncate">📍 {joylashuvMatn(listing.dokon?.joylashuv)}</p>
        </div>
      </div>
    </Link>
  )
}
