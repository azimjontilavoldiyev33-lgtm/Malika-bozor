'use client'

import { useRouter } from 'next/navigation'

// Haqiqiy oldingi sahifaga qaytaradi (qidiruv/filtr holati saqlanadi).
// Tarix bo'sh bo'lsa (to'g'ridan-to'g'ri havola bilan kelganda) — zaxira manzilga.
export default function OrqagaTugma({
  zaxira = '/',
  children = '← Orqaga',
  className = 'text-sm text-indigo-600 hover:underline',
}: {
  zaxira?: string
  children?: React.ReactNode
  className?: string
}) {
  const router = useRouter()

  function orqaga() {
    if (window.history.length > 1) router.back()
    else router.push(zaxira)
  }

  return (
    <button type="button" onClick={orqaga} className={className}>
      {children}
    </button>
  )
}
