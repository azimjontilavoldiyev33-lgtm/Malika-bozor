import type { ShopStatus } from '@/models/Shop'

// Obunani uzaytirish mantig'i — admin (qo'lda) ham, to'lov webhook'lari ham
// shu funksiyani ishlatadi (kod takrorlanmasin uchun bitta joyda).
//
// Mavjud muddatga (yoki muddat o'tib ketgan/yo'q bo'lsa hozirdan) `oy` qo'shadi.
// Obuna berilganda "kutilmoqda" do'kon avtomatik tasdiqlanadi.
// Shop hujjatini O'ZGARTIRADI, lekin saqlamaydi — chaqiruvchi `save()` qiladi.

interface ObunaShop {
  obunaTugashi: Date | null
  holati: ShopStatus
}

export function obunaniUzaytir(shop: ObunaShop, oy: number): void {
  if (oy <= 0) return
  const hozir = Date.now()
  const joriy = shop.obunaTugashi ? new Date(shop.obunaTugashi).getTime() : 0
  const boshlanish = new Date(Math.max(hozir, joriy))
  boshlanish.setMonth(boshlanish.getMonth() + oy)
  shop.obunaTugashi = boshlanish
  if (shop.holati === 'kutilmoqda') shop.holati = 'tasdiqlangan'
}
