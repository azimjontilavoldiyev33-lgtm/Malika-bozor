'use client'

import { useEffect } from 'react'

export default function SWRegister() {
  useEffect(() => {
    // Service worker'ni faqat production'da yoqamiz — dev rejimida u eski
    // JS/kodni keshlab, yangilanishlarni ko'rsatmay qo'yadi.
    if (process.env.NODE_ENV !== 'production') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // ro'yxatdan o'tmasa — jim o'tamiz
      })
    }
  }, [])
  return null
}
