'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParolMaydoni from '@/components/ParolMaydoni'

export default function KirishPage() {
  const router = useRouter()
  const [telefon, setTelefon] = useState('')
  const [parol, setParol] = useState('')
  const [xato, setXato] = useState('')
  const [yuklanmoqda, setYuklanmoqda] = useState(false)

  async function topshir(e: React.FormEvent) {
    e.preventDefault()
    setXato('')
    setYuklanmoqda(true)
    try {
      const res = await fetch('/api/auth/kirish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefon, parol }),
      })
      const json = await res.json()
      if (!res.ok) {
        setXato(json.xato ?? 'Xatolik yuz berdi')
        return
      }
      router.push('/kabinet')
      router.refresh()
    } catch {
      setXato('Server bilan bog\'lanib bo\'lmadi')
    } finally {
      setYuklanmoqda(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-2xl font-bold">Do&apos;kon kirishi</h1>
      <p className="mt-1 text-sm text-slate-500">
        Telefon va parolingiz bilan kiring
      </p>

      <form onSubmit={topshir} className="mt-6 space-y-4">
        {xato && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {xato}
          </p>
        )}
        <div>
          <label htmlFor="telefon" className="mb-1 block text-sm font-medium">
            Telefon
          </label>
          <input
            id="telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="901234567"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400"
            required
          />
        </div>
        <div>
          <label htmlFor="parol" className="mb-1 block text-sm font-medium">
            Parol
          </label>
          <ParolMaydoni
            id="parol"
            value={parol}
            onChange={setParol}
            autoComplete="current-password"
            required
          />
        </div>
        <button
          disabled={yuklanmoqda}
          className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {yuklanmoqda ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Do&apos;koningiz yo&apos;qmi?{' '}
        <Link href="/royxat" className="font-medium text-indigo-600">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </div>
  )
}
