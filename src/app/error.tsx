'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="text-6xl">😕</p>
      <h1 className="mt-4 text-2xl font-bold">Nimadir xato ketdi</h1>
      <p className="mt-2 text-slate-500">
        Kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko&apos;ring.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Qayta urinish
      </button>
    </div>
  )
}
