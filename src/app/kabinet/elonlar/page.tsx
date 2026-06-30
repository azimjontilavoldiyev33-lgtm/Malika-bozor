'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { narxFormat } from '@/lib/format'

interface Elon {
  _id: string
  brend: string
  model: string
  xotira?: string
  holati: 'yangi' | 'ishlatilgan'
  narx: number
  valyuta: 'UZS' | 'USD'
  faol: boolean
  bor: boolean
  rasmlar: string[]
}

export default function ElonlarimPage() {
  const [elonlar, setElonlar] = useState<Elon[]>([])
  const [yuklanmoqda, setYuklanmoqda] = useState(true)
  const [ochirilmoqda, setOchirilmoqda] = useState<string | null>(null)
  const [tasdiqId, setTasdiqId] = useState<string | null>(null) // o'chirishni tasdiqlash kutilayotgan e'lon

  async function yukla() {
    setYuklanmoqda(true)
    const res = await fetch('/api/kabinet/elonlar')
    const json = await res.json()
    setElonlar(json.elonlar ?? [])
    setYuklanmoqda(false)
  }

  useEffect(() => {
    yukla()
  }, [])

  async function ochir(id: string) {
    setTasdiqId(null)
    setOchirilmoqda(id)
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    if (res.ok) setElonlar((e) => e.filter((x) => x._id !== id))
    setOchirilmoqda(null)
  }

  if (yuklanmoqda) {
    return <p className="text-slate-500">Yuklanmoqda...</p>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">E&apos;lonlarim ({elonlar.length})</h2>
        <Link
          href="/kabinet/elon/yangi"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          ➕ Yangi
        </Link>
      </div>

      {elonlar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">
          <p className="text-4xl">📱</p>
          <p className="mt-2">Hali e&apos;lon qo&apos;shmagansiz</p>
          <Link
            href="/kabinet/elon/yangi"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            ➕ Birinchi e&apos;lonni qo&apos;shish
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {elonlar.map((e) => (
            <div
              key={e._id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-2xl">
                {e.rasmlar?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.rasmlar[0]}
                    alt={e.model}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  '📱'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {e.model}
                  {e.xotira ? ` · ${e.xotira}` : ''}
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {narxFormat(e.narx, e.valyuta)}
                </p>
                <div className="mt-0.5 flex gap-2 text-xs">
                  <span className={e.holati === 'yangi' ? 'text-emerald-600' : 'text-amber-600'}>
                    {e.holati === 'yangi' ? 'Yangi' : 'Ishlatilgan'}
                  </span>
                  {!e.bor && <span className="text-slate-400">· Tugagan</span>}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {tasdiqId === e._id ? (
                  <>
                    <button
                      onClick={() => ochir(e._id)}
                      disabled={ochirilmoqda === e._id}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {ochirilmoqda === e._id ? '…' : 'Ha, o\'chir'}
                    </button>
                    <button
                      onClick={() => setTasdiqId(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50"
                    >
                      Yo&apos;q
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/kabinet/elon/${e._id}/tahrir`}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50"
                    >
                      ✏️ Tahrir
                    </Link>
                    <button
                      onClick={() => setTasdiqId(e._id)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      🗑️ O&apos;chir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
