import { NextResponse } from 'next/server'
import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import { Tolov } from '@/models/Tolov'
import { getCurrentUser } from '@/lib/auth'
import { TARIFLAR } from '@/lib/tariflar'

const sxema = z.object({
  tarif: z.enum(['boshlangich', 'standart', 'premium']),
  oy: z.coerce.number().int().min(1).max(36),
})

// POST /api/tolov/karta — do'kon karta-karta to'lov so'rovini yaratadi.
// Do'kon admin kartasiga pul o'tkazib, "To'ladim" bosadi → bu yozuv
// "kutilmoqda" holatida admin tasdig'ini kutadi.
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || user.rol !== 'shop' || !user.shopId) {
    return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ xato: 'Noto\'g\'ri so\'rov' }, { status: 400 })
  }

  const parsed = sxema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumot noto\'g\'ri' },
      { status: 400 },
    )
  }

  const { tarif, oy } = parsed.data
  await dbConnect()

  // Takror so'rovni to'samiz — allaqachon kutilayotgan so'rov bo'lsa
  const kutilmoqda = await Tolov.findOne({
    shopId: user.shopId,
    provider: 'karta',
    holati: 'kutilmoqda',
  }).lean()
  if (kutilmoqda) {
    return NextResponse.json(
      {
        xato:
          'Sizda allaqachon tasdiq kutayotgan to\'lov bor. Admin tekshirmoqda.',
      },
      { status: 409 },
    )
  }

  const summa = TARIFLAR[tarif].narx * oy
  const tolov = await Tolov.create({
    shopId: user.shopId,
    tarif,
    oy,
    summa,
    provider: 'karta',
    holati: 'kutilmoqda',
  })

  return NextResponse.json({ ok: true, id: tolov._id.toString() })
}
