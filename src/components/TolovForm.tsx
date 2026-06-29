'use client'

import { useState } from 'react'
import { narxFormat } from '@/lib/format'
import {
  TARIF_RUYXATI,
  TARIFLAR,
  limitMatn,
  type Tarif,
} from '@/lib/tariflar'

const OYLAR = [
  { oy: 1, belgi: '1 oy' },
  { oy: 3, belgi: '3 oy' },
  { oy: 12, belgi: '12 oy' },
]

export default function TolovForm({ joriyTarif }: { joriyTarif: Tarif }) {
  const [tarif, setTarif] = useState<Tarif>(joriyTarif)
  const [oy, setOy] = useState(1)
  const [yuklanmoqda, setYuklanmoqda] = useState<'payme' | 'click' | null>(null)
  const [xato, setXato] = useState('')

  const summa = TARIFLAR[tarif].narx * oy

  async function tola(provider: 'payme' | 'click') {
    setXato('')
    setYuklanmoqda(provider)
    try {
      const res = await fetch('/api/tolov/yarat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarif, oy, provider }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setXato(data.xato ?? 'To\'lovni boshlab bo\'lmadi')
        setYuklanmoqda(null)
        return
      }
      // Provayder checkout sahifasiga yo'naltiramiz
      window.location.href = data.url
    } catch {
      setXato('Tarmoq xatosi. Qayta urinib ko\'ring.')
      setYuklanmoqda(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Tarif tanlash */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-600">Tarifni tanlang</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TARIF_RUYXATI.map((t) => {
            const tanlangan = t === tarif
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTarif(t)}
                className={`rounded-2xl border p-4 text-left transition ${
                  tanlangan
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="font-bold">{TARIFLAR[t].nomi}</p>
                <p className="mt-1 text-sm text-slate-500">{limitMatn(t)} e&apos;lon</p>
                <p className="mt-2 text-sm font-semibold text-indigo-600">
                  {narxFormat(TARIFLAR[t].narx)}/oy
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Muddat */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-600">Muddat</p>
        <div className="flex gap-2">
          {OYLAR.map((o) => (
            <button
              key={o.oy}
              type="button"
              onClick={() => setOy(o.oy)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                o.oy === oy
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {o.belgi}
            </button>
          ))}
        </div>
      </div>

      {/* Jami */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white">
        <span className="text-sm text-slate-300">
          {TARIFLAR[tarif].nomi} · {oy} oy
        </span>
        <span className="text-xl font-bold">{narxFormat(summa)}</span>
      </div>

      {xato && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{xato}</p>
      )}

      {/* To'lov tugmalari */}
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => tola('payme')}
          disabled={yuklanmoqda !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#33ccff] px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {yuklanmoqda === 'payme' ? 'Yo\'naltirilmoqda…' : 'Payme orqali to\'lash'}
        </button>
        <button
          type="button"
          onClick={() => tola('click')}
          disabled={yuklanmoqda !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0066ff] px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {yuklanmoqda === 'click' ? 'Yo\'naltirilmoqda…' : 'Click orqali to\'lash'}
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        To&apos;lov tasdiqlangach obunangiz avtomatik uzaytiriladi.
      </p>
    </div>
  )
}
