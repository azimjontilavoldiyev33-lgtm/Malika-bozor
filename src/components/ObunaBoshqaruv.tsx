'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { obunaFaolmi, obunaKunlari, sanaFormat } from '@/lib/format'

export default function ObunaBoshqaruv({
  shopId,
  obunaTugashi,
}: {
  shopId: string
  obunaTugashi: string | null
}) {
  const router = useRouter()
  const [yuklanmoqda, setYuklanmoqda] = useState(false)

  const faol = obunaFaolmi(obunaTugashi)
  const kun = obunaKunlari(obunaTugashi)

  async function uzaytir(oy: number) {
    setYuklanmoqda(true)
    const res = await fetch(`/api/shops/${shopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obunaOy: oy }),
    })
    setYuklanmoqda(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">Obuna</span>
        {faol ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Faol · {kun} kun · {sanaFormat(obunaTugashi)} gacha
          </span>
        ) : (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {obunaTugashi ? 'Muddati tugagan' : 'Obuna yo\'q'}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          onClick={() => uzaytir(1)}
          disabled={yuklanmoqda}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          +1 oy
        </button>
        <button
          onClick={() => uzaytir(3)}
          disabled={yuklanmoqda}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          +3 oy
        </button>
        <button
          onClick={() => uzaytir(12)}
          disabled={yuklanmoqda}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          +1 yil
        </button>
        {faol && (
          <button
            onClick={() => uzaytir(0)}
            disabled={yuklanmoqda}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Bekor
          </button>
        )}
      </div>
    </div>
  )
}
