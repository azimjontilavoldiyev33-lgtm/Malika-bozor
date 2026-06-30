'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Leaflet faqat brauzerda ishlaydi — SSR'siz yuklaymiz
const JoylashuvXarita = dynamic(() => import('./JoylashuvXarita'), {
  ssr: false,
  loading: () => (
    <div className="grid h-64 w-full place-items-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
      Xarita yuklanmoqda…
    </div>
  ),
})

export interface ShopBoshlangich {
  _id: string
  nomi?: string
  telefon?: string
  telegram?: string
  ishVaqti?: string
  joylashuv?: { blok?: string; qator?: string; dokonRaqami?: string }
  geo?: { lat?: number; lng?: number }
}

export default function SozlamaForm({ shop }: { shop: ShopBoshlangich }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nomi: shop.nomi ?? '',
    telefon: shop.telefon ?? '',
    telegram: shop.telegram ?? '',
    ishVaqti: shop.ishVaqti ?? '',
    blok: shop.joylashuv?.blok ?? '',
    qator: shop.joylashuv?.qator ?? '',
    dokonRaqami: shop.joylashuv?.dokonRaqami ?? '',
    lat: shop.geo?.lat?.toString() ?? '',
    lng: shop.geo?.lng?.toString() ?? '',
  })
  const [xato, setXato] = useState('')
  const [xabar, setXabar] = useState('')
  const [yuklanmoqda, setYuklanmoqda] = useState(false)
  // "Tozalash" bosilganda xaritani qayta yuklash uchun (marker ham o'chsin)
  const [xaritaKey, setXaritaKey] = useState(0)

  // Muvaffaqiyat xabari 3 soniyadan keyin o'chsin
  useEffect(() => {
    if (!xabar) return
    const t = setTimeout(() => setXabar(''), 3000)
    return () => clearTimeout(t)
  }, [xabar])

  function s<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function topshir(e: React.FormEvent) {
    e.preventDefault()
    setXato('')
    setXabar('')
    setYuklanmoqda(true)
    const payload: Record<string, unknown> = {
      nomi: form.nomi,
      telefon: form.telefon,
      telegram: form.telegram || undefined,
      ishVaqti: form.ishVaqti || undefined,
      joylashuv: {
        blok: form.blok,
        qator: form.qator,
        dokonRaqami: form.dokonRaqami,
      },
    }
    if (form.lat && form.lng) {
      payload.geo = { lat: Number(form.lat), lng: Number(form.lng) }
    }
    try {
      const res = await fetch(`/api/shops/${shop._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setXato(json.xato ?? 'Xatolik')
        return
      }
      setXabar('Saqlandi ✅')
      router.refresh()
    } catch {
      setXato('Server bilan bog\'lanib bo\'lmadi')
    } finally {
      setYuklanmoqda(false)
    }
  }

  const inp =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400'

  return (
    <form onSubmit={topshir} className="space-y-4">
      {xato && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{xato}</p>
      )}
      {xabar && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {xabar}
        </p>
      )}

      <div>
        <label htmlFor="s-nomi" className="mb-1 block text-sm font-medium">Do&apos;kon nomi</label>
        <input id="s-nomi" value={form.nomi} onChange={(e) => s('nomi', e.target.value)} className={inp} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="s-telefon" className="mb-1 block text-sm font-medium">Telefon</label>
          <input id="s-telefon" type="tel" inputMode="tel" autoComplete="tel" value={form.telefon} onChange={(e) => s('telefon', e.target.value)} className={inp} />
        </div>
        <div>
          <label htmlFor="s-telegram" className="mb-1 block text-sm font-medium">Telegram</label>
          <input id="s-telegram" value={form.telegram} onChange={(e) => s('telegram', e.target.value)} placeholder="@username" className={inp} />
        </div>
      </div>

      <div>
        <label htmlFor="s-ishVaqti" className="mb-1 block text-sm font-medium">Ish vaqti</label>
        <input id="s-ishVaqti" value={form.ishVaqti} onChange={(e) => s('ishVaqti', e.target.value)} placeholder="09:00 - 19:00" className={inp} />
      </div>

      <fieldset className="rounded-2xl border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium">Bozordagi joylashuv</legend>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="s-blok" className="mb-1 block text-xs text-slate-500">Blok</label>
            <input id="s-blok" value={form.blok} onChange={(e) => s('blok', e.target.value)} placeholder="B" className={inp} />
          </div>
          <div>
            <label htmlFor="s-qator" className="mb-1 block text-xs text-slate-500">Qator</label>
            <input id="s-qator" value={form.qator} onChange={(e) => s('qator', e.target.value)} placeholder="3" className={inp} />
          </div>
          <div>
            <label htmlFor="s-dokonRaqami" className="mb-1 block text-xs text-slate-500">Do&apos;kon №</label>
            <input id="s-dokonRaqami" value={form.dokonRaqami} onChange={(e) => s('dokonRaqami', e.target.value)} placeholder="12" className={inp} />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-slate-200 p-3">
        <legend className="px-1 text-sm font-medium">
          Do&apos;kon joylashuvi (xaritada)
        </legend>
        <p className="mb-2 text-xs text-slate-500">
          Do&apos;koningizda turib &quot;Joriy joylashuvim&quot; tugmasini bosing —
          mijozlar xaritadan sizni topadi.
        </p>
        <JoylashuvXarita
          key={xaritaKey}
          lat={form.lat ? Number(form.lat) : undefined}
          lng={form.lng ? Number(form.lng) : undefined}
          onChange={(la, ln) =>
            setForm((f) => ({
              ...f,
              lat: la.toFixed(6),
              lng: ln.toFixed(6),
            }))
          }
        />
        {form.lat && form.lng ? (
          <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs">
            <span className="text-emerald-700">
              ✅ Belgilandi: {form.lat}, {form.lng}
            </span>
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, lat: '', lng: '' }))
                setXaritaKey((k) => k + 1)
              }}
              className="font-medium text-red-600 hover:underline"
            >
              Tozalash
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">
            Joylashuv hali belgilanmagan (ixtiyoriy).
          </p>
        )}
      </fieldset>

      <button
        disabled={yuklanmoqda}
        className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {yuklanmoqda ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </form>
  )
}
