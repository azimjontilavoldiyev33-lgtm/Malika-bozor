import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 })
  }
  return NextResponse.json({
    user: {
      id: user._id,
      ism: user.ism,
      telefon: user.telefon,
      rol: user.rol,
      shopId: user.shopId ?? null,
    },
  })
}
