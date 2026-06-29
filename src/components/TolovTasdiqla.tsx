'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Admin karta to'lovini tasdiqlash/bekor qilish tugmalari.
export default function TolovTasdiqla({ id }: { id: string }) {
  const router = useRouter()
  const [yuklanmoqda, setYuklanmoqda] = useState<'tasdiqla' | 'bekor' | null>(
    null,
  )
  const [xato, setXato] = useState('')

  async function amalBajar(amal: 'tasdiqla' | 'bekor') {
    setXato('')
    setYuklanmoqda(amal)
    try {
      const res = await fetch(`/api/admin/tolov/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setXato(data.xato ?? 'Xatolik')
        setYuklanmoqda(null)
        return
      }
      router.refresh()
    } catch {
      setXato('Tarmoq xatosi')
      setYuklanmoqda(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => amalBajar('tasdiqla')}
          disabled={yuklanmoqda !== null}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {yuklanmoqda === 'tasdiqla' ? '…' : '✓ Tasdiqlash'}
        </button>
        <button
          type="button"
          onClick={() => amalBajar('bekor')}
          disabled={yuklanmoqda !== null}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {yuklanmoqda === 'bekor' ? '…' : 'Bekor'}
        </button>
      </div>
      {xato && <p className="text-xs text-red-500">{xato}</p>}
    </div>
  )
}
