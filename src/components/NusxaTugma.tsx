'use client'

import { useState } from 'react'

// Matnni clipboard'ga nusxalaydigan tugma (referral havola uchun).
export default function NusxaTugma({
  matn,
  className = '',
}: {
  matn: string
  className?: string
}) {
  const [nusxalandi, setNusxalandi] = useState(false)

  async function nusxala() {
    try {
      await navigator.clipboard.writeText(matn)
      setNusxalandi(true)
      setTimeout(() => setNusxalandi(false), 2000)
    } catch {
      // clipboard ruxsat berilmasa — jim qolamiz
    }
  }

  return (
    <button
      type="button"
      onClick={nusxala}
      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition ${
        nusxalandi
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      } ${className}`}
    >
      {nusxalandi ? '✓ Nusxalandi' : '📋 Nusxalash'}
    </button>
  )
}
