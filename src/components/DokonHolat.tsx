'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ShopStatus } from '@/models/Shop'

export default function DokonHolat({
  shopId,
  holati,
}: {
  shopId: string
  holati: ShopStatus
}) {
  const router = useRouter()
  const [yuklanmoqda, setYuklanmoqda] = useState(false)

  async function ozgartir(yangi: ShopStatus) {
    setYuklanmoqda(true)
    const res = await fetch(`/api/shops/${shopId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holati: yangi }),
    })
    setYuklanmoqda(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex gap-1">
      {holati !== 'tasdiqlangan' && (
        <button
          onClick={() => ozgartir('tasdiqlangan')}
          disabled={yuklanmoqda}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          ✓ Tasdiqlash
        </button>
      )}
      {holati !== 'bloklangan' && (
        <button
          onClick={() => ozgartir('bloklangan')}
          disabled={yuklanmoqda}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          ⛔ Bloklash
        </button>
      )}
      {holati === 'bloklangan' && (
        <button
          onClick={() => ozgartir('kutilmoqda')}
          disabled={yuklanmoqda}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-50"
        >
          ↩️ Tiklash
        </button>
      )}
    </div>
  )
}
