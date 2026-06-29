import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import { Tolov } from '@/models/Tolov'
import { Shop } from '@/models/Shop'
import { getCurrentUser } from '@/lib/auth'
import { obunaniUzaytir } from '@/lib/obuna'
import { referralMukofotBer } from '@/lib/referral'

const sxema = z.object({ amal: z.enum(['tasdiqla', 'bekor']) })

// PATCH /api/admin/tolov/[id] — admin karta to'lovini tasdiqlaydi yoki bekor qiladi.
// Tasdiqlanganda: obuna uzaytiriladi, tarif yangilanadi, referral mukofot beriladi.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'admin') {
    return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 403 })
  }

  const { id } = await params
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ xato: 'Noto\'g\'ri id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ xato: 'Noto\'g\'ri so\'rov' }, { status: 400 })
  }
  const parsed = sxema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ xato: 'Noto\'g\'ri amal' }, { status: 400 })
  }

  await dbConnect()
  const tolov = await Tolov.findById(id)
  if (!tolov) {
    return NextResponse.json({ xato: 'To\'lov topilmadi' }, { status: 404 })
  }
  // Faqat kutilayotgan karta to'lovini o'zgartiramiz (idempotent)
  if (tolov.provider !== 'karta' || tolov.holati !== 'kutilmoqda') {
    return NextResponse.json(
      { xato: 'Bu to\'lov allaqachon ko\'rib chiqilgan' },
      { status: 409 },
    )
  }

  if (parsed.data.amal === 'bekor') {
    tolov.holati = 'bekor'
    await tolov.save()
    return NextResponse.json({ ok: true, holati: 'bekor' })
  }

  // Tasdiqlash
  tolov.holati = 'tolangan'
  await tolov.save()

  const shop = await Shop.findById(tolov.shopId)
  if (shop) {
    obunaniUzaytir(shop, tolov.oy)
    shop.tarif = tolov.tarif
    await shop.save()
    // Birinchi to'lovda taklif mukofotini beramiz
    await referralMukofotBer(shop)
  }

  return NextResponse.json({ ok: true, holati: 'tolangan' })
}
