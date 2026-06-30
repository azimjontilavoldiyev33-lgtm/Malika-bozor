'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ParolMaydoni from '@/components/ParolMaydoni'

export default function RoyxatPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    ism: '',
    dokonNomi: '',
    telefon: '',
    parol: '',
    refKod: '',
  })
  const [xato, setXato] = useState('')
  const [yuklanmoqda, setYuklanmoqda] = useState(false)
  const xatoRef = useRef<HTMLParagraphElement>(null)

  // Xato chiqsa — uni ko'rinishga olib kelamiz (uzun formada pastda qolmasin)
  useEffect(() => {
    if (xato) xatoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [xato])

  // Havoladagi ?ref=KOD ni taklif kodi maydoniga avtomatik joylash
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) setForm((f) => ({ ...f, refKod: ref.toUpperCase() }))
  }, [])

  function o(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))
  }

  async function topshir(e: React.FormEvent) {
    e.preventDefault()
    setXato('')
    setYuklanmoqda(true)
    try {
      const res = await fetch('/api/auth/royxat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      <h1 className="text-2xl font-bold">Do&apos;kon ro&apos;yxati</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ro&apos;yxatdan o&apos;ting — admin tasdiqlagach e&apos;lonlaringiz
        ko&apos;rinadi
      </p>

      <form onSubmit={topshir} className="mt-6 space-y-4">
        {xato && (
          <p
            ref={xatoRef}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {xato}
          </p>
        )}
        <div>
          <label htmlFor="ism" className="mb-1 block text-sm font-medium">
            Ismingiz
          </label>
          <input
            id="ism"
            autoComplete="name"
            value={form.ism}
            onChange={o('ism')}
            placeholder="Aziz"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400"
            required
          />
        </div>
        <div>
          <label htmlFor="dokonNomi" className="mb-1 block text-sm font-medium">
            Do&apos;kon nomi
          </label>
          <input
            id="dokonNomi"
            autoComplete="organization"
            value={form.dokonNomi}
            onChange={o('dokonNomi')}
            placeholder="Aziz Mobile"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-indigo-400"
            required
          />
        </div>
        <div>
          <label htmlFor="telefon" className="mb-1 block text-sm font-medium">
            Telefon
          </label>
          <input
            id="telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.telefon}
            onChange={o('telefon')}
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
            value={form.parol}
            onChange={(v) => setForm((f) => ({ ...f, parol: v }))}
            placeholder="Kamida 6 belgi"
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label htmlFor="refKod" className="mb-1 block text-sm font-medium">
            Taklif kodi{' '}
            <span className="font-normal text-slate-400">(ixtiyoriy)</span>
          </label>
          <input
            id="refKod"
            value={form.refKod}
            onChange={(e) =>
              setForm((f) => ({ ...f, refKod: e.target.value.toUpperCase() }))
            }
            placeholder="Masalan: K7M2QX"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 uppercase outline-none focus:border-indigo-400"
          />
          <p className="mt-1 text-xs text-slate-400">
            Sizni do&apos;st do&apos;kon taklif qilgan bo&apos;lsa, kodini
            kiriting — birinchi to&apos;lovda ikkalangizga 1 oy bepul.
          </p>
        </div>
        <button
          disabled={yuklanmoqda}
          className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {yuklanmoqda ? 'Yuborilmoqda...' : 'Ro\'yxatdan o\'tish'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Akkauntingiz bormi?{' '}
        <Link href="/kirish" className="font-medium text-indigo-600">
          Kirish
        </Link>
      </p>
    </div>
  )
}
