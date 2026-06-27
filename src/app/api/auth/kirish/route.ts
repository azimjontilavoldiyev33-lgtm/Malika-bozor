import { NextResponse, type NextRequest } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'
import { kirishSchema } from '@/lib/validators'
import { parolTekshir, telefonNormalize, sessionOrnat } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = kirishSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumotlar noto\'g\'ri' },
        { status: 400 },
      )
    }

    const telefon = telefonNormalize(parsed.data.telefon)
    await dbConnect()

    const user = await User.findOne({ telefon })
    if (!user) {
      return NextResponse.json(
        { xato: 'Telefon yoki parol noto\'g\'ri' },
        { status: 401 },
      )
    }

    const togri = await parolTekshir(parsed.data.parol, user.parolHash)
    if (!togri) {
      return NextResponse.json(
        { xato: 'Telefon yoki parol noto\'g\'ri' },
        { status: 401 },
      )
    }

    await sessionOrnat({
      userId: user._id.toString(),
      rol: user.rol,
      shopId: user.shopId?.toString(),
    })

    return NextResponse.json({
      ok: true,
      user: { id: user._id, ism: user.ism, rol: user.rol },
    })
  } catch (e) {
    console.error('kirish xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
