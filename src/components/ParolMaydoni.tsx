'use client'

import { useState } from 'react'

// Parol kiritish maydoni — ko'rsatish/yashirish (👁) tugmasi bilan.
export default function ParolMaydoni({
  id,
  value,
  onChange,
  placeholder = '••••••',
  autoComplete = 'current-password',
  required,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: 'current-password' | 'new-password'
  required?: boolean
}) {
  const [korin, setKorin] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={korin ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-11 outline-none focus:border-indigo-400"
      />
      <button
        type="button"
        onClick={() => setKorin((k) => !k)}
        aria-label={korin ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
        aria-pressed={korin}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-lg text-slate-400 hover:text-slate-600"
      >
        {korin ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
