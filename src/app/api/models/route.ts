import { NextResponse, type NextRequest } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Listing } from '@/models/Listing'

// GET /api/models?model=iPhone%2015%20Pro&xotira=256GB
// Bitta model bo'yicha barcha (tasdiqlangan) do'konlar narxini solishtiradi.
export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    const sp = request.nextUrl.searchParams
    const model = sp.get('model')?.trim()
    const xotira = sp.get('xotira')?.trim()
    const holati = sp.get('holati')?.trim()

    if (!model) {
      return NextResponse.json({ xato: 'Model kiritilmadi' }, { status: 400 })
    }

    const match: Record<string, unknown> = {
      faol: true,
      model: new RegExp(
        '^' + model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
        'i',
      ),
    }
    if (xotira) match.xotira = xotira
    if (holati) match.holati = holati

    const natijalar = await Listing.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'dokon',
        },
      },
      { $unwind: '$dokon' },
      { $match: { 'dokon.holati': 'tasdiqlangan' } },
      { $sort: { narx: 1 } }, // eng arzon birinchi
      {
        $project: {
          model: 1,
          brend: 1,
          xotira: 1,
          rang: 1,
          holati: 1,
          narx: 1,
          valyuta: 1,
          rasmlar: 1,
          bor: 1,
          'dokon._id': 1,
          'dokon.nomi': 1,
          'dokon.joylashuv': 1,
          'dokon.geo': 1,
          'dokon.telefon': 1,
          'dokon.reyting': 1,
        },
      },
    ])

    const narxlar = natijalar.map((n) => n.narx)
    return NextResponse.json({
      model,
      soni: natijalar.length,
      engArzon: narxlar.length ? Math.min(...narxlar) : null,
      engQimmat: narxlar.length ? Math.max(...narxlar) : null,
      natijalar,
    })
  } catch (e) {
    console.error('models GET xato:', e)
    return NextResponse.json({ xato: 'Server xatosi' }, { status: 500 })
  }
}
