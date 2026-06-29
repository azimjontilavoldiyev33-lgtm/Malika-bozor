import { NextResponse, type NextRequest } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'
import { Shop } from '@/models/Shop'
import { royxatSchema } from '@/lib/validators'
import { parolHashla, telefonNormalize, sessionOrnat } from '@/lib/auth'
import { noyobReferralKod } from '@/lib/referral'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = royxatSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumotlar noto\'g\'ri' },
        { status: 400 },
      )
    }

    const { ism, parol, dokonNomi } = parsed.data
    const telefon = telefonNormalize(parsed.data.telefon)

    await dbConnect()

    const mavjud = await User.findOne({ telefon })
    if (mavjud) {
      return NextResponse.json(
        { xato: 'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan' },
        { status: 409 },
      )
    }

    const parolHash = await parolHashla(parol)

    // Taklif kodi berilgan bo'lsa — taklif qilgan do'konni topamiz
    let taklifQilgan: typeof Shop.prototype._id | undefined
    const refKod = parsed.data.refKod?.toUpperCase()
    if (refKod) {
      const taklifchi = await Shop.findOne({ referralKod: refKod })
        .select('_id')
        .lean()
      if (taklifchi) taklifQilgan = taklifchi._id
    }

    // 1) Foydalanuvchi
    const user = await User.create({ ism, telefon, parolHash, rol: 'shop' })

    // 2) Do'kon (admin tasdiqlaguncha "kutilmoqda") — o'z taklif kodi bilan
    const shop = await Shop.create({
      nomi: dokonNomi,
      egasiId: user._id,
      telefon,
      holati: 'kutilmoqda',
      referralKod: await noyobReferralKod(),
      taklifQilgan,
    })

    // 3) Foydalanuvchiga do'konni bog'lash
    user.shopId = shop._id
    await user.save()

    await sessionOrnat({
      userId: user._id.toString(),
      rol: user.rol,
      shopId: shop._id.toString(),
    })

    return NextResponse.json(
      {
        ok: true,
        user: { id: user._id, ism: user.ism, rol: user.rol },
        shop: { id: shop._id, nomi: shop.nomi, holati: shop.holati },
      },
      { status: 201 },
    )
  } catch (e) {
    console.error('royxat xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
