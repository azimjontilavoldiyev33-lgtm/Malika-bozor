import { NextResponse, type NextRequest } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { Tolov } from '@/models/Tolov'
import { Shop } from '@/models/Shop'
import { obunaniUzaytir } from '@/lib/obuna'
import { referralMukofotBer } from '@/lib/referral'
import {
  clickImzoTekshir,
  clickJavob,
  CLICK_ACTION,
  CLICK_XATO,
  type ClickCallback,
} from '@/lib/tolov/click'

export const dynamic = 'force-dynamic'

// Click POST'ni form-urlencoded yuboradi — formData'dan o'qiymiz.
async function cbOqi(request: NextRequest): Promise<ClickCallback> {
  const fd = await request.formData()
  const g = (k: string) => String(fd.get(k) ?? '')
  return {
    click_trans_id: g('click_trans_id'),
    service_id: g('service_id'),
    merchant_trans_id: g('merchant_trans_id'),
    merchant_prepare_id: g('merchant_prepare_id'),
    amount: g('amount'),
    action: g('action'),
    sign_time: g('sign_time'),
    sign_string: g('sign_string'),
    error: g('error'),
  }
}

// POST /api/tolov/click — Prepare (action=0) va Complete (action=1) callback'lari
export async function POST(request: NextRequest) {
  let cb: ClickCallback
  try {
    cb = await cbOqi(request)
  } catch {
    return NextResponse.json({ error: CLICK_XATO.ACTION, error_note: 'Bad request' })
  }

  // Imzo tekshiruvi
  if (!clickImzoTekshir(cb)) {
    return NextResponse.json(clickJavob(cb, CLICK_XATO.SIGN))
  }

  try {
    await dbConnect()
    const action = Number(cb.action)
    if (action === CLICK_ACTION.PREPARE) return NextResponse.json(await prepare(cb))
    if (action === CLICK_ACTION.COMPLETE) return NextResponse.json(await complete(cb))
    return NextResponse.json(clickJavob(cb, CLICK_XATO.ACTION))
  } catch (e) {
    console.error('click webhook xato:', e)
    return NextResponse.json(clickJavob(cb, CLICK_XATO.ORDER_NOT_FOUND))
  }
}

async function prepare(cb: ClickCallback) {
  const orderId = cb.merchant_trans_id
  if (!mongoose.isValidObjectId(orderId)) {
    return clickJavob(cb, CLICK_XATO.ORDER_NOT_FOUND)
  }
  const tolov = await Tolov.findOne({ _id: orderId, provider: 'click' })
  if (!tolov) return clickJavob(cb, CLICK_XATO.ORDER_NOT_FOUND)

  if (Math.round(Number(cb.amount)) !== tolov.summa) {
    return clickJavob(cb, CLICK_XATO.AMOUNT)
  }
  if (tolov.holati === 'tolangan') {
    return clickJavob(cb, CLICK_XATO.ALREADY_PAID)
  }

  tolov.clickTransId = cb.click_trans_id
  tolov.clickPrepareId = tolov._id.toString()
  await tolov.save()

  return clickJavob(cb, CLICK_XATO.OK, {
    merchant_prepare_id: tolov.clickPrepareId,
  })
}

async function complete(cb: ClickCallback) {
  const orderId = cb.merchant_trans_id
  if (!mongoose.isValidObjectId(orderId)) {
    return clickJavob(cb, CLICK_XATO.ORDER_NOT_FOUND)
  }
  const tolov = await Tolov.findOne({ _id: orderId, provider: 'click' })
  if (!tolov) return clickJavob(cb, CLICK_XATO.ORDER_NOT_FOUND)

  if (tolov.clickPrepareId !== cb.merchant_prepare_id) {
    return clickJavob(cb, CLICK_XATO.TX_NOT_FOUND)
  }
  if (Math.round(Number(cb.amount)) !== tolov.summa) {
    return clickJavob(cb, CLICK_XATO.AMOUNT)
  }

  // Click to'lovni bekor qildi (error < 0)
  if (Number(cb.error) < 0) {
    if (tolov.holati !== 'tolangan') {
      tolov.holati = 'bekor'
      await tolov.save()
    }
    return clickJavob(cb, CLICK_XATO.CANCELLED)
  }

  // Idempotent — allaqachon to'langan
  if (tolov.holati === 'tolangan') {
    return clickJavob(cb, CLICK_XATO.ALREADY_PAID)
  }

  tolov.holati = 'tolangan'
  await tolov.save()

  // Obunani uzaytiramiz (bir marta)
  const shop = await Shop.findById(tolov.shopId)
  if (shop) {
    obunaniUzaytir(shop, tolov.oy)
    shop.tarif = tolov.tarif
    await shop.save()
    // Birinchi to'lovda taklif mukofotini beramiz
    await referralMukofotBer(shop)
  }

  return clickJavob(cb, CLICK_XATO.OK, {
    merchant_confirm_id: tolov.clickPrepareId,
  })
}
