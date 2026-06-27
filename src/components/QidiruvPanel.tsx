'use client'

import { useEffect, useState, useCallback } from 'react'
import PhoneCard from './PhoneCard'
import type { QidiruvJavob } from '@/lib/types'

const BRENDLAR = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Redmi',
  'Realme',
  'Oppo',
  'Honor',
  'Vivo',
  'Infinix',
  'Tecno',
  'Huawei',
  'Nokia',
]

const SARALASH = [
  { value: 'yangi', label: 'Eng yangi' },
  { value: 'narx_asc', label: 'Avval arzon' },
  { value: 'narx_desc', label: 'Avval qimmat' },
]

export default function QidiruvPanel() {
  const [q, setQ] = useState('')
  const [brend, setBrend] = useState('')
  const [holati, setHolati] = useState('')
  const [narxMin, setNarxMin] = useState('')
  const [narxMax, setNarxMax] = useState('')
  const [sort, setSort] = useState('yangi')
  const [page, setPage] = useState(1)

  const [data, setData] = useState<QidiruvJavob | null>(null)
  const [yuklanmoqda, setYuklanmoqda] = useState(false)

  const qidir = useCallback(async () => {
    setYuklanmoqda(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (brend) params.set('brend', brend)
    if (holati) params.set('holati', holati)
    if (narxMin) params.set('narxMin', narxMin)
    if (narxMax) params.set('narxMax', narxMax)
    params.set('sort', sort)
    params.set('page', String(page))
    try {
      const res = await fetch(`/api/listings?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } catch {
      setData({ natijalar: [], jami: 0, page: 1, sahifalar: 0 })
    } finally {
      setYuklanmoqda(false)
    }
  }, [q, brend, holati, narxMin, narxMax, sort, page])

  // Filtr o'zgarsa sahifani 1 ga qaytaramiz
  useEffect(() => {
    setPage(1)
  }, [q, brend, holati, narxMin, narxMax, sort])

  // Qidiruvni debounce bilan ishga tushiramiz
  useEffect(() => {
    const t = setTimeout(qidir, 350)
    return () => clearTimeout(t)
  }, [qidir])

  return (
    <div className="relative z-10 mx-auto max-w-5xl px-4">
      {/* Qidiruv qatori */}
      <div className="-mt-8 rounded-3xl border border-slate-200/80 bg-white p-3 card-shadow">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-indigo-300">
          <span className="text-slate-400">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Telefon nomini yozing... masalan: iPhone 15"
            className="w-full bg-transparent py-3.5 text-sm outline-none"
          />
        </div>

        {/* Brend tezkor tugmalari */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setBrend('')}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              brend === ''
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hammasi
          </button>
          {BRENDLAR.map((b) => (
            <button
              key={b}
              onClick={() => setBrend(b)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                brend === b
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Filtrlar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={holati}
          onChange={(e) => setHolati(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Holati: barchasi</option>
          <option value="yangi">Yangi</option>
          <option value="ishlatilgan">Ishlatilgan</option>
        </select>
        <input
          value={narxMin}
          onChange={(e) => setNarxMin(e.target.value.replace(/\D/g, ''))}
          placeholder="Narx dan"
          inputMode="numeric"
          className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <input
          value={narxMax}
          onChange={(e) => setNarxMax(e.target.value.replace(/\D/g, ''))}
          placeholder="Narx gacha"
          inputMode="numeric"
          className="w-28 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {SARALASH.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Natijalar */}
      <div className="mt-4">
        {data && (
          <p className="mb-3 text-sm text-slate-500">
            {yuklanmoqda ? 'Qidirilmoqda...' : `${data.jami} ta e'lon topildi`}
          </p>
        )}

        {yuklanmoqda && !data ? (
          <SkeletonGrid />
        ) : data && data.natijalar.length > 0 ? (
          <div className="grid animate-fade-up grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.natijalar.map((l) => (
              <PhoneCard key={l._id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-4xl">🔍</p>
            <p className="mt-2">Hech narsa topilmadi</p>
            <p className="text-sm">Boshqa nom yoki filtr bilan urinib ko&apos;ring</p>
          </div>
        )}

        {/* Sahifalash */}
        {data && data.sahifalar > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              ← Oldingi
            </button>
            <span className="text-sm text-slate-500">
              {page} / {data.sahifalar}
            </span>
            <button
              disabled={page >= data.sahifalar}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-40"
            >
              Keyingi →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-square bg-slate-100" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-4 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
