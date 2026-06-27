import { NextResponse, type NextRequest } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'
import { listingSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

// GET /api/listings/[id] — bitta e'lon + do'kon ma'lumoti
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/listings/[id]'>,
) {
  try {
    const { id } = await ctx.params
    await dbConnect()
    const listing = await Listing.findById(id)
      .populate('shopId', 'nomi joylashuv geo telefon telegram ishVaqti holati')
      .lean()
    if (!listing) {
      return NextResponse.json({ xato: 'Topilmadi' }, { status: 404 })
    }
    return NextResponse.json({ listing })
  } catch (e) {
    console.error('listing GET xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}

// Egasi yoki admin ekanini tekshiradi
async function ruxsatBor(listingShopId: string) {
  const user = await getCurrentUser()
  if (!user) return false
  if (user.rol === 'admin') return true
  return user.shopId?.toString() === listingShopId
}

// PATCH /api/listings/[id] — tahrirlash
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/listings/[id]'>,
) {
  try {
    const { id } = await ctx.params
    await dbConnect()
    const mavjud = await Listing.findById(id)
    if (!mavjud) {
      return NextResponse.json({ xato: 'Topilmadi' }, { status: 404 })
    }
    if (!(await ruxsatBor(mavjud.shopId.toString()))) {
      return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = listingSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumotlar noto\'g\'ri' },
        { status: 400 },
      )
    }

    Object.assign(mavjud, parsed.data)
    // Faqat admin e'lonni faollashtirishi/bloklashi mumkin (moderatsiya)
    const user = await getCurrentUser()
    if (user?.rol === 'admin' && typeof body.faol === 'boolean') {
      mavjud.faol = body.faol
    }
    await mavjud.save()
    return NextResponse.json({ ok: true, listing: mavjud })
  } catch (e) {
    console.error('listing PATCH xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}

// DELETE /api/listings/[id]
export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/listings/[id]'>,
) {
  try {
    const { id } = await ctx.params
    await dbConnect()
    const mavjud = await Listing.findById(id)
    if (!mavjud) {
      return NextResponse.json({ xato: 'Topilmadi' }, { status: 404 })
    }
    if (!(await ruxsatBor(mavjud.shopId.toString()))) {
      return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 403 })
    }
    await mavjud.deleteOne()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('listing DELETE xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
