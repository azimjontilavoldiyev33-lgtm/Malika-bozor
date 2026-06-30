'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import RasmYuklash from './RasmYuklash'

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
  'Boshqa',
]

export interface ElonBoshlangich {
  _id?: string
  brend?: string
  model?: string
  xotira?: string
  rang?: string
  holati?: 'yangi' | 'ishlatilgan'
  narx?: number
  valyuta?: 'UZS' | 'USD'
  rasmlar?: string[]
  tavsif?: string
  bor?: boolean
}

export default function ElonForm({ boshlangich }: { boshlangich?: ElonBoshlangich }) {
  const router = useRouter()
  const tahrir = Boolean(boshlangich?._id)

  const [form, setForm] = useState({
    brend: boshlangich?.brend ?? 'Apple',
    model: boshlangich?.model ?? '',
    xotira: boshlangich?.xotira ?? '',
    rang: boshlangich?.rang ?? '',
    holati: boshlangich?.holati ?? 'yangi',
    narx: boshlangich?.narx?.toString() ?? '',
    valyuta: boshlangich?.valyuta ?? 'UZS',
    tavsif: boshlangich?.tavsif ?? '',
    bor: boshlangich?.bor ?? true,
  })
  const [rasmlar, setRasmlar] = useState<string[]>(boshlangich?.rasmlar ?? [])
  const [xato, setXato] = useState('')
  const [yuklanmoqda, setYuklanmoqda] = useState(false)
  const xatoRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (xato) xatoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [xato])

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function topshir(e: React.FormEvent) {
    e.preventDefault()
    setXato('')
    setYuklanmoqda(true)
    const payload = {
      brend: form.brend,
      model: form.model,
      xotira: form.xotira || undefined,
      rang: form.rang || undefined,
      holati: form.holati,
      narx: Number(form.narx),
      valyuta: form.valyuta,
      rasmlar,
      tavsif: form.tavsif || undefined,
      bor: form.bor,
    }
    try {
      const res = await fetch(
        tahrir ? `/api/listings/${boshlangich!._id}` : '/api/listings',
        {
          method: tahrir ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const json = await res.json()
      if (!res.ok) {
        setXato(json.xato ?? 'Xatolik yuz berdi')
        return
      }
      router.push('/kabinet/elonlar')
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
        <p
          ref={xatoRef}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {xato}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ef-brend" className="mb-1 block text-sm font-medium">Brend</label>
          <select
            id="ef-brend"
            value={form.brend}
            onChange={(e) => set('brend', e.target.value)}
            className={inp}
          >
            {BRENDLAR.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ef-holati" className="mb-1 block text-sm font-medium">Holati</label>
          <select
            id="ef-holati"
            value={form.holati}
            onChange={(e) =>
              set('holati', e.target.value as 'yangi' | 'ishlatilgan')
            }
            className={inp}
          >
            <option value="yangi">Yangi</option>
            <option value="ishlatilgan">Ishlatilgan</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ef-model" className="mb-1 block text-sm font-medium">Model *</label>
        <input
          id="ef-model"
          value={form.model}
          onChange={(e) => set('model', e.target.value)}
          placeholder="iPhone 15 Pro"
          className={inp}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ef-xotira" className="mb-1 block text-sm font-medium">Xotira</label>
          <input
            id="ef-xotira"
            value={form.xotira}
            onChange={(e) => set('xotira', e.target.value)}
            placeholder="256GB"
            className={inp}
          />
        </div>
        <div>
          <label htmlFor="ef-rang" className="mb-1 block text-sm font-medium">Rang</label>
          <input
            id="ef-rang"
            value={form.rang}
            onChange={(e) => set('rang', e.target.value)}
            placeholder="Qora"
            className={inp}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label htmlFor="ef-narx" className="mb-1 block text-sm font-medium">Narx *</label>
          <input
            id="ef-narx"
            value={form.narx ? Number(form.narx).toLocaleString('ru-RU') : ''}
            onChange={(e) => set('narx', e.target.value.replace(/\D/g, ''))}
            placeholder="12 500 000"
            inputMode="numeric"
            className={inp}
            required
          />
        </div>
        <div>
          <label htmlFor="ef-valyuta" className="mb-1 block text-sm font-medium">Valyuta</label>
          <select
            id="ef-valyuta"
            value={form.valyuta}
            onChange={(e) => set('valyuta', e.target.value as 'UZS' | 'USD')}
            className={inp}
          >
            <option value="UZS">so&apos;m</option>
            <option value="USD">$</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ef-rasmlar" className="mb-1 block text-sm font-medium">Rasmlar</label>
        <RasmYuklash value={rasmlar} onChange={setRasmlar} />
      </div>

      <div>
        <label htmlFor="ef-tavsif" className="mb-1 block text-sm font-medium">Tavsif</label>
        <textarea
          id="ef-tavsif"
          value={form.tavsif}
          onChange={(e) => set('tavsif', e.target.value)}
          rows={3}
          placeholder="Qo'shimcha ma'lumot..."
          className={inp}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.bor}
          onChange={(e) => set('bor', e.target.checked)}
          className="h-4 w-4"
        />
        Omborda bor
      </label>

      <button
        disabled={yuklanmoqda}
        className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {yuklanmoqda
          ? 'Saqlanmoqda...'
          : tahrir
            ? 'O\'zgarishni saqlash'
            : 'E\'lon qo\'shish'}
      </button>
    </form>
  )
}
