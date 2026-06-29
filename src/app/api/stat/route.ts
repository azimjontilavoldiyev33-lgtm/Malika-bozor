import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { Statistika } from '@/models/Statistika'
import { statTurmi, sanaKalit } from '@/lib/stat'

// POST /api/stat — ommaviy hodisa beacon'i (auth yo'q).
// Tana: { shopId, tur }. Bugungi kunlik hisoblagichni $inc bilan oshiradi.
// Mijoz tomonidan navigator.sendBeacon orqali "fire-and-forget" chaqiriladi.
export async function POST(request: Request) {
  let shopId: unknown
  let tur: unknown
  try {
    const tana = await request.json()
    shopId = tana?.shopId
    tur = tana?.tur
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (
    typeof shopId !== 'string' ||
    !mongoose.isValidObjectId(shopId) ||
    !statTurmi(tur)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    await dbConnect()
    await Statistika.updateOne(
      { shopId, sana: sanaKalit() },
      { $inc: { [tur]: 1 } },
      { upsert: true },
    )
  } catch {
    // Statistika ikkilamchi — xatolik mijozga ta'sir qilmasin
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}
