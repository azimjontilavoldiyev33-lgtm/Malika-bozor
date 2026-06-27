import { NextResponse, type NextRequest } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Listing } from '@/models/Listing'
import { shopSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// GET /api/shops/[id] — do'kon + faol e'lonlari (ommaviy)
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/shops/[id]'>,
) {
  try {
    const { id } = await ctx.params
    await dbConnect()
    const shop = await Shop.findById(id).lean()
    if (!shop) {
      return NextResponse.json({ xato: 'Topilmadi' }, { status: 404 })
    }
    const elonlar = await Listing.find({ shopId: id, faol: true })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ shop, elonlar })
  } catch (e) {
    console.error('shop GET xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}

// Admin do'kon holatini o'zgartirishi uchun
const holatSchema = z.object({
  holati: z.enum(['kutilmoqda', 'tasdiqlangan', 'bloklangan']),
})

// PATCH /api/shops/[id]
//  - admin: holatini o'zgartirishi mumkin (tasdiqlash/bloklash)
//  - egasi: do'kon ma'lumotini (joylashuv, telefon...) yangilashi mumkin
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/shops/[id]'>,
) {
  try {
    const { id } = await ctx.params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 401 })
    }

    await dbConnect()
    const shop = await Shop.findById(id)
    if (!shop) {
      return NextResponse.json({ xato: 'Topilmadi' }, { status: 404 })
    }

    const body = await request.json()

    // Admin holat o'zgartirishi
    if (user.rol === 'admin' && 'holati' in body) {
      const parsed = holatSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ xato: 'Holat noto\'g\'ri' }, { status: 400 })
      }
      shop.holati = parsed.data.holati
      await shop.save()
      return NextResponse.json({ ok: true, shop })
    }

    // Admin obunani uzaytirishi: { obunaOy: 1 | 3 | 12 }
    // Mavjud muddatga (yoki hozirdan) qo'shiladi. obunaOy: 0 — bekor qiladi.
    if (user.rol === 'admin' && 'obunaOy' in body) {
      const oy = Number(body.obunaOy)
      if (oy === 0) {
        shop.obunaTugashi = null
      } else if (oy > 0) {
        const hozir = Date.now()
        const joriy = shop.obunaTugashi
          ? new Date(shop.obunaTugashi).getTime()
          : 0
        const boshlanish = new Date(Math.max(hozir, joriy))
        boshlanish.setMonth(boshlanish.getMonth() + oy)
        shop.obunaTugashi = boshlanish
        // Obuna berilganda do'kon avtomatik tasdiqlanadi
        if (shop.holati === 'kutilmoqda') shop.holati = 'tasdiqlangan'
      }
      await shop.save()
      return NextResponse.json({ ok: true, shop })
    }

    // Egasi o'z do'konini yangilashi
    const egasiMi = user.shopId?.toString() === id
    if (!egasiMi && user.rol !== 'admin') {
      return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const parsed = shopSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumotlar noto\'g\'ri' },
        { status: 400 },
      )
    }
    Object.assign(shop, parsed.data)
    await shop.save()
    return NextResponse.json({ ok: true, shop })
  } catch (e) {
    console.error('shop PATCH xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
