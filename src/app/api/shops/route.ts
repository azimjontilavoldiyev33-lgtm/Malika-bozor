import { NextResponse, type NextRequest } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { getCurrentUser } from '@/lib/auth'

// GET /api/shops — do'konlar ro'yxati
// Ommaviy: faqat tasdiqlangan. Admin: ?holati=... bilan barchasini ko'radi.
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const holatiParam = request.nextUrl.searchParams.get('holati')

    const filter: Record<string, unknown> = {}
    if (holatiParam) {
      // Boshqa holatlarni faqat admin ko'ra oladi
      const user = await getCurrentUser()
      if (!user || user.rol !== 'admin') {
        return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 403 })
      }
      filter.holati = holatiParam
    } else {
      filter.holati = 'tasdiqlangan'
    }

    const shops = await Shop.find(filter).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ shops })
  } catch (e) {
    console.error('shops GET xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
