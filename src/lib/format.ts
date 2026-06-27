// Narxni chiroyli formatlash: 12500000 -> "12 500 000 so'm"
export function narxFormat(narx: number, valyuta: 'UZS' | 'USD' = 'UZS'): string {
  const raqam = new Intl.NumberFormat('ru-RU').format(narx)
  return valyuta === 'USD' ? `$${raqam}` : `${raqam} so'm`
}

// Joylashuvni matn ko'rinishida: "B blok, 3-qator, 12-do'kon"
export function joylashuvMatn(joylashuv?: {
  blok?: string
  qator?: string
  dokonRaqami?: string
}): string {
  if (!joylashuv) return "Joylashuv ko'rsatilmagan"
  const qismlar: string[] = []
  if (joylashuv.blok) qismlar.push(`${joylashuv.blok} blok`)
  if (joylashuv.qator) qismlar.push(`${joylashuv.qator}-qator`)
  if (joylashuv.dokonRaqami) qismlar.push(`${joylashuv.dokonRaqami}-do'kon`)
  return qismlar.length ? qismlar.join(', ') : "Joylashuv ko'rsatilmagan"
}

// Yandex Maps "yo'l ko'rsat" (navigator) havolasi
export function yandexNavigator(lat: number, lng: number): string {
  return `https://yandex.uz/maps/?rtext=~${lat},${lng}&rtt=auto`
}

// Google Maps yo'l ko'rsatish havolasi
export function googleNavigator(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// Xaritani sahifaga joylash uchun (iframe).
//  - NEXT_PUBLIC_GOOGLE_MAPS_KEY berilgan bo'lsa: rasmiy Google Maps Embed API
//  - kalit yo'q bo'lsa: kalitsiz, ishonchli OpenStreetMap (xarita bo'sh qolmaydi)
export function xaritaEmbed(lat: number, lng: number): string {
  const kalit = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
  if (kalit) {
    return `https://www.google.com/maps/embed/v1/place?key=${kalit}&q=${lat},${lng}&zoom=17&language=uz`
  }
  const d = 0.004 // ko'rinish maydoni (bbox)
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
}
