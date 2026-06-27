import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'
import { getCurrentUser } from '@/lib/auth'

// GET /api/kabinet/elonlar — joriy do'konning BARCHA e'lonlari (faol/nofaol)
export async function GET() {
  const user = await getCurrentUser()
  if (!user || !user.shopId) {
    return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 401 })
  }
  await dbConnect()
  const elonlar = await Listing.find({ shopId: user.shopId })
    .sort({ createdAt: -1 })
    .lean()
  return NextResponse.json({ elonlar })
}
