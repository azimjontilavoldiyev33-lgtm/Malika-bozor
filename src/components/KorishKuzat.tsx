'use client'

import { useEffect, useRef } from 'react'
import type { StatTur } from '@/lib/stat'
import { statYubor } from '@/lib/statBeacon'

// Sahifa ochilganda ko'rishni bir marta qayd qiladi. Hech narsa render qilmaydi.
// Bir sessiyada bir do'kon/sahifa uchun 30 daqiqada bir marta sanaladi
// (qayta yuklash bilan sun'iy oshib ketmasligi uchun).
const OYNA = 30 * 60 * 1000

export default function KorishKuzat({
  shopId,
  tur,
}: {
  shopId: string
  tur: StatTur
}) {
  const yuborildi = useRef(false)

  useEffect(() => {
    if (yuborildi.current) return // StrictMode ikki marta chaqirishidan himoya
    yuborildi.current = true

    const kalit = `stat:${tur}:${shopId}`
    try {
      const oxirgi = Number(sessionStorage.getItem(kalit) || 0)
      if (Date.now() - oxirgi < OYNA) return
      sessionStorage.setItem(kalit, String(Date.now()))
    } catch {
      // sessionStorage bo'lmasa ham qayd qilaveramiz
    }
    statYubor(shopId, tur)
  }, [shopId, tur])

  return null
}
