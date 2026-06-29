'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { narxFormat } from '@/lib/format'
import {
  TARIF_RUYXATI,
  TARIFLAR,
  limitMatn,
  type Tarif,
} from '@/lib/tariflar'
import NusxaTugma from '@/components/NusxaTugma'

const OYLAR = [
  { oy: 1, belgi: '1 oy' },
  { oy: 3, belgi: '3 oy' },
  { oy: 12, belgi: '12 oy' },
]

export default function TolovForm({
  joriyTarif,
  karta,
  egasi,
}: {
  joriyTarif: Tarif
  karta: string
  egasi: string
}) {
  const router = useRouter()
  const [tarif, setTarif] = useState<Tarif>(joriyTarif)
  const [oy, setOy] = useState(1)
  const [yuklanmoqda, setYuklanmoqda] = useState(false)
  const [xato, setXato] = useState('')
  const [yuborildi, setYuborildi] = useState(false)

  const summa = TARIFLAR[tarif].narx * oy
  const kartaSozlangan = karta.trim().length > 0

  async function toladim() {
    setXato('')
    setYuklanmoqda(true)
    try {
      const res = await fetch('/api/tolov/karta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarif, oy }),
      })
      const data = await res.json()
      if (!res.ok) {
        setXato(data.xato ?? 'So\'rovni yuborib bo\'lmadi')
        return
      }
      setYuborildi(true)
      router.refresh() // tarix yangilansin
    } catch {
      setXato('Tarmoq xatosi. Qayta urinib ko\'ring.')
    } finally {
      setYuklanmoqda(false)
    }
  }

  if (yuborildi) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
        <p className="text-3xl">✅</p>
        <p className="mt-2 font-semibold text-emerald-800">
          So&apos;rovingiz yuborildi
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Admin to&apos;lovni tekshirib tasdiqlagach, obunangiz avtomatik
          uzaytiriladi. Odatda bu ko&apos;p vaqt olmaydi.
        </p>
      </div>
    )
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
                <p className="mt-1 text-sm text-slate-500">
                  {limitMatn(t)} e&apos;lon
                </p>
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

      {/* To'lov ko'rsatmasi: karta-karta */}
      {kartaSozlangan ? (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm font-medium text-slate-700">
            1. Quyidagi kartaga{' '}
            <b className="text-indigo-700">{narxFormat(summa)}</b> o&apos;tkazing:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <p className="font-mono text-lg font-bold tracking-wider text-slate-900">
                {karta}
              </p>
              {egasi && (
                <p className="text-xs text-slate-500">{egasi}</p>
              )}
            </div>
            <NusxaTugma matn={karta.replace(/\s/g, '')} />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            2. O&apos;tkazgach quyidagi tugmani bosing — admin tekshirib
            tasdiqlaydi.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          To&apos;lov kartasi hali sozlanmagan. Iltimos, admin bilan
          bog&apos;laning.
        </div>
      )}

      {xato && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
          {xato}
        </p>
      )}

      <button
        type="button"
        onClick={toladim}
        disabled={yuklanmoqda || !kartaSozlangan}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {yuklanmoqda ? 'Yuborilmoqda…' : '✅ To\'ladim'}
      </button>

      <p className="text-center text-xs text-slate-400">
        To&apos;lov admin tomonidan tasdiqlangach obunangiz uzaytiriladi.
      </p>
    </div>
  )
}
