import type { StatTur } from './stat'

// Mijoz tomonida statistika hodisasini "fire-and-forget" yuborish.
// sendBeacon — sahifadan chiqib ketayotganda ham ishonchli yetkazadi
// (qo'ng'iroq/yo'l ko'rsatma bosilib boshqa ilovaga o'tilganda muhim).
export function statYubor(shopId: string, tur: StatTur): void {
  const tana = JSON.stringify({ shopId, tur })
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([tana], { type: 'application/json' })
      navigator.sendBeacon('/api/stat', blob)
      return
    }
  } catch {
    // sendBeacon bo'lmasa — fetch zaxirasiga o'tamiz
  }
  fetch('/api/stat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: tana,
    keepalive: true,
  }).catch(() => {})
}
