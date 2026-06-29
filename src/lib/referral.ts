import type { HydratedDocument } from 'mongoose'
import { Shop, type IShop } from '@/models/Shop'
import { obunaniUzaytir } from '@/lib/obuna'

export type ShopDoc = HydratedDocument<IShop>

// Taklif mukofoti: birinchi to'lovda ikkala do'konga ham shuncha oy bepul.
export const REFERRAL_MUKOFOT_OY = 1

// Chalkash belgilarsiz (0/O, 1/I yo'q) o'qish oson alifbo
const ALIFBO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function tasodifiyKod(uzunlik = 6): string {
  let kod = ''
  for (let i = 0; i < uzunlik; i++) {
    kod += ALIFBO[Math.floor(Math.random() * ALIFBO.length)]
  }
  return kod
}

// DB'da hali ishlatilmagan noyob taklif kodi qaytaradi.
export async function noyobReferralKod(): Promise<string> {
  for (let urinish = 0; urinish < 6; urinish++) {
    const kod = tasodifiyKod()
    const bor = await Shop.exists({ referralKod: kod })
    if (!bor) return kod
  }
  // Juda kam ehtimol — uzunroq kod bilan kafolat
  return tasodifiyKod(8)
}

// Do'kon BIRINCHI marta obuna to'laganda chaqiriladi.
// Agar bu do'konni kimdir taklif qilgan bo'lsa va mukofot hali berilmagan
// bo'lsa — taklifchiga ham, yangi do'konga ham +1 oy obuna qo'shadi.
// Idempotent: `referralMukofotBerildi` bayrog'i takror berishni to'sadi.
export async function referralMukofotBer(shop: ShopDoc): Promise<void> {
  if (!shop.taklifQilgan || shop.referralMukofotBerildi) return

  const taklifchi = await Shop.findById(shop.taklifQilgan)
  if (taklifchi) {
    obunaniUzaytir(taklifchi, REFERRAL_MUKOFOT_OY)
    await taklifchi.save()
    obunaniUzaytir(shop, REFERRAL_MUKOFOT_OY)
  }

  // Taklifchi topilmasa ham bayroqni qo'yamiz — qayta urinmaymiz
  shop.referralMukofotBerildi = true
  await shop.save()
}
