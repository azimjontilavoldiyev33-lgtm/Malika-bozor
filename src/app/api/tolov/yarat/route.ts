import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { dbConnect } from '@/lib/db'
import { Tolov } from '@/models/Tolov'
import { getCurrentUser } from '@/lib/auth'
import { TARIFLAR } from '@/lib/tariflar'
import { paymeCheckoutUrl } from '@/lib/tolov/payme'
import { clickCheckoutUrl } from '@/lib/tolov/click'

const yaratSchema = z.object({
  tarif: z.enum(['boshlangich', 'standart', 'premium']),
  oy: z.coerce.number().int().min(1).max(36),
  provider: z.enum(['payme', 'click']),
})

// POST /api/tolov/yarat — do'kon egasi obuna to'lovini boshlaydi.
// Tolov yozuvi (kutilmoqda) yaratiladi va provayder checkout havolasi qaytariladi.
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'shop' || !user.shopId) {
      return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = yaratSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumotlar noto\'g\'ri' },
        { status: 400 },
      )
    }

    const { tarif, oy, provider } = parsed.data
    const summa = TARIFLAR[tarif].narx * oy

    await dbConnect()
    const tolov = await Tolov.create({
      shopId: user.shopId,
      tarif,
      oy,
      summa,
      provider,
      holati: 'kutilmoqda',
    })

    const tolovId = tolov._id.toString()
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ?? request.nextUrl.origin
    const qaytishUrl = `${origin}/kabinet/tolov?holat=natija&id=${tolovId}`

    const url =
      provider === 'payme'
        ? paymeCheckoutUrl(tolovId, summa, qaytishUrl)
        : clickCheckoutUrl(tolovId, summa, qaytishUrl)

    return NextResponse.json({ ok: true, url, tolovId }, { status: 201 })
  } catch (e) {
    console.error('tolov yarat xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
