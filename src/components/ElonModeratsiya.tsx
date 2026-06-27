'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ElonModeratsiya({
  listingId,
  faol,
}: {
  listingId: string
  faol: boolean
}) {
  const router = useRouter()
  const [yuklanmoqda, setYuklanmoqda] = useState(false)

  async function faollikOzgartir() {
    setYuklanmoqda(true)
    const res = await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faol: !faol }),
    })
    setYuklanmoqda(false)
    if (res.ok) router.refresh()
  }

  async function ochir() {
    if (!confirm('E\'lonni butunlay o\'chirasizmi?')) return
    setYuklanmoqda(true)
    const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
    setYuklanmoqda(false)
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={faollikOzgartir}
        disabled={yuklanmoqda}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
          faol
            ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {faol ? '🚫 Yashirish' : '✓ Ko\'rsatish'}
      </button>
      <button
        onClick={ochir}
        disabled={yuklanmoqda}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        🗑️
      </button>
    </div>
  )
}
