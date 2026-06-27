'use client'

import { useRouter } from 'next/navigation'

export default function ChiqishTugma() {
  const router = useRouter()
  async function chiqish() {
    await fetch('/api/auth/chiqish', { method: 'POST' })
    router.push('/')
    router.refresh()
  }
  return (
    <button
      onClick={chiqish}
      className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
    >
      Chiqish
    </button>
  )
}
