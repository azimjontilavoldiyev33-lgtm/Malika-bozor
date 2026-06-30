'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
  const searchParams = useSearchParams()

  // Boshlang'ich holatni URL'dan o'qiymiz (havola ulashilsa/orqaga qaytilsa saqlanadi)
  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [brend, setBrend] = useState(() => searchParams.get('brend') ?? '')
  const [holati, setHolati] = useState(() => searchParams.get('holati') ?? '')
  const [narxMin, setNarxMin] = useState(() => searchParams.get('narxMin') ?? '')
  const [narxMax, setNarxMax] = useState(() => searchParams.get('narxMax') ?? '')
  const [sort, setSort] = useState(() => searchParams.get('sort') ?? 'yangi')
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1)

  const [data, setData] = useState<QidiruvJavob | null>(null)
  const [yuklanmoqda, setYuklanmoqda] = useState(false)

  const natijaRef = useRef<HTMLDivElement>(null)
  const birinchiRef = useRef(true)

  const filtrBor = Boolean(q || brend || holati || narxMin || narxMax)
  const narxXato =
    Boolean(narxMin && narxMax) && Number(narxMin) > Number(narxMax)

  const joriyParams = useCallback(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (brend) params.set('brend', brend)
    if (holati) params.set('holati', holati)
    if (narxMin) params.set('narxMin', narxMin)
    if (narxMax) params.set('narxMax', narxMax)
    if (sort !== 'yangi') params.set('sort', sort)
    if (page > 1) params.set('page', String(page))
    return params
  }, [q, brend, holati, narxMin, narxMax, sort, page])

  const qidir = useCallback(async () => {
    if (narxXato) return // noto'g'ri narx oralig'ida so'rov yubormaymiz
    setYuklanmoqda(true)
    try {
      const res = await fetch(`/api/listings?${joriyParams().toString()}`)
      const json = await res.json()
      setData(json)
    } catch {
      setData({ natijalar: [], jami: 0, page: 1, sahifalar: 0 })
    } finally {
      setYuklanmoqda(false)
    }
  }, [joriyParams, narxXato])

  // Filtr o'zgarsa sahifani 1 ga qaytaramiz
  useEffect(() => {
    setPage(1)
  }, [q, brend, holati, narxMin, narxMax, sort])

  // Qidiruvni debounce bilan ishga tushiramiz + URL'ni yangilaymiz
  useEffect(() => {
    const t = setTimeout(() => {
      const qs = joriyParams().toString()
      router.replace(qs ? `/?${qs}` : '/', { scroll: false })
      qidir()
    }, 350)
    return () => clearTimeout(t)
  }, [qidir, joriyParams, router])

  // Sahifa o'zgarganda natijalar tepasiga olib boramiz (birinchi yuklashdan tashqari)
  useEffect(() => {
    if (birinchiRef.current) {
      birinchiRef.current = false
      return
    }
    natijaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  function tozala() {
    setQ('')
    setBrend('')
    setHolati('')
    setNarxMin('')
    setNarxMax('')
    setSort('yangi')
  }

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
            aria-label="Telefon qidirish"
            className="w-full bg-transparent py-3.5 text-sm outline-none"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              aria-label="Qidiruvni tozalash"
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
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
          aria-label="Holati bo'yicha filtr"
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
          aria-label="Eng kam narx"
          className={`w-28 rounded-lg border bg-white px-3 py-2 text-sm ${
            narxXato ? 'border-red-300' : 'border-slate-200'
          }`}
        />
        <input
          value={narxMax}
          onChange={(e) => setNarxMax(e.target.value.replace(/\D/g, ''))}
          placeholder="Narx gacha"
          inputMode="numeric"
          aria-label="Eng yuqori narx"
          className={`w-28 rounded-lg border bg-white px-3 py-2 text-sm ${
            narxXato ? 'border-red-300' : 'border-slate-200'
          }`}
        />
        {filtrBor && (
          <button
            onClick={tozala}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
          >
            ✕ Tozalash
          </button>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Saralash"
          className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {SARALASH.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {narxXato && (
        <p className="mt-2 text-sm text-red-600">
          &quot;Narx dan&quot; qiymati &quot;Narx gacha&quot;dan katta bo&apos;lmasligi kerak.
        </p>
      )}

      {/* Natijalar */}
      <div ref={natijaRef} className="mt-4 scroll-mt-20">
        {data && (
          <p className="mb-3 text-sm text-slate-500" aria-live="polite">
            {yuklanmoqda ? 'Qidirilmoqda...' : `${data.jami} ta e'lon topildi`}
          </p>
        )}

        {yuklanmoqda && !data ? (
          <SkeletonGrid />
        ) : data && data.natijalar.length > 0 ? (
          <div
            className={`grid animate-fade-up grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 lg:grid-cols-4 ${
              yuklanmoqda ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {data.natijalar.map((l) => (
              <PhoneCard key={l._id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-4xl">🔍</p>
            <p className="mt-2">Hech narsa topilmadi</p>
            <p className="text-sm">Boshqa nom yoki filtr bilan urinib ko&apos;ring</p>
            {filtrBor && (
              <button
                onClick={tozala}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-slate-50"
              >
                Filtrlarni tozalash
              </button>
            )}
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
