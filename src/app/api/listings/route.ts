import { NextResponse, type NextRequest } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'
import { Shop } from '@/models/Shop'
import { listingSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { limitTugaganmi, limitMatn } from '@/lib/tariflar'

// GET /api/listings — qidiruv + filtr + saralash (ommaviy)
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const sp = request.nextUrl.searchParams

    const q = sp.get('q')?.trim()
    const brend = sp.get('brend')?.trim()
    const holati = sp.get('holati')?.trim() // yangi | ishlatilgan
    const blok = sp.get('blok')?.trim()
    const narxMin = Number(sp.get('narxMin')) || 0
    const narxMax = Number(sp.get('narxMax')) || 0
    const sort = sp.get('sort') ?? 'yangi' // narx_asc | narx_desc | yangi
    const page = Math.max(1, Number(sp.get('page')) || 1)
    const limit = Math.min(50, Number(sp.get('limit')) || 20)

    // 1-bosqich: e'lon filtri
    const listingMatch: Record<string, unknown> = { faol: true }
    if (brend) listingMatch.brend = brend
    if (holati) listingMatch.holati = holati
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      listingMatch.$or = [{ brend: re }, { model: re }, { tavsif: re }]
    }
    if (narxMin || narxMax) {
      listingMatch.narx = {}
      if (narxMin) (listingMatch.narx as Record<string, number>).$gte = narxMin
      if (narxMax) (listingMatch.narx as Record<string, number>).$lte = narxMax
    }

    // saralash
    const sortStage: Record<string, 1 | -1> =
      sort === 'narx_asc'
        ? { narx: 1 }
        : sort === 'narx_desc'
          ? { narx: -1 }
          : { createdAt: -1 }

    // 2-bosqich: faqat tasdiqlangan VA obunasi faol do'konlar
    const shopMatch: Record<string, unknown> = {
      'dokon.holati': 'tasdiqlangan',
      'dokon.obunaTugashi': { $gt: new Date() },
    }
    if (blok) shopMatch['dokon.joylashuv.blok'] = blok

    const pipeline: mongoose.PipelineStage[] = [
      { $match: listingMatch },
      {
        $lookup: {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'dokon',
        },
      },
      { $unwind: '$dokon' },
      { $match: shopMatch },
      { $sort: sortStage },
      {
        $facet: {
          natijalar: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                brend: 1,
                model: 1,
                xotira: 1,
                rang: 1,
                holati: 1,
                narx: 1,
                valyuta: 1,
                rasmlar: 1,
                bor: 1,
                createdAt: 1,
                'dokon._id': 1,
                'dokon.nomi': 1,
                'dokon.joylashuv': 1,
                'dokon.telefon': 1,
              },
            },
          ],
          jami: [{ $count: 'soni' }],
        },
      },
    ]

    const [res] = await Listing.aggregate(pipeline)
    const natijalar = res?.natijalar ?? []
    const jami = res?.jami?.[0]?.soni ?? 0

    return NextResponse.json(
      {
        natijalar,
        jami,
        page,
        sahifalar: Math.ceil(jami / limit),
      },
      {
        // Vercel CDN'da 30s keshlanadi, 60s davomida eski natija ko'rsatib yangilanadi
        headers: {
          'Cache-Control':
            'public, s-maxage=30, stale-while-revalidate=60',
        },
      },
    )
  } catch (e) {
    console.error('listings GET xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}

// POST /api/listings — yangi e'lon (faqat do'kon egasi)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.rol !== 'shop' || !user.shopId) {
      return NextResponse.json({ xato: 'Ruxsat yo\'q' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = listingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { xato: parsed.error.issues[0]?.message ?? 'Ma\'lumotlar noto\'g\'ri' },
        { status: 400 },
      )
    }

    await dbConnect()

    // Tarif limitini tekshiramiz
    const shop = await Shop.findById(user.shopId).lean()
    const soni = await Listing.countDocuments({ shopId: user.shopId })
    if (limitTugaganmi(shop?.tarif, soni)) {
      return NextResponse.json(
        {
          xato: `E'lon limiti tugadi (${limitMatn(shop?.tarif)}). Tarifni oshiring.`,
        },
        { status: 403 },
      )
    }

    const listing = await Listing.create({
      ...parsed.data,
      shopId: user.shopId,
    })

    return NextResponse.json({ ok: true, listing }, { status: 201 })
  } catch (e) {
    console.error('listings POST xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
