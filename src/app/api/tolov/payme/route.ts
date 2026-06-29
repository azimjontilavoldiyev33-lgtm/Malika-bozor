import { NextResponse, type NextRequest } from 'next/server'
import mongoose from 'mongoose'
import { dbConnect } from '@/lib/db'
import { Tolov, type ITolov } from '@/models/Tolov'
import { Shop } from '@/models/Shop'
import { obunaniUzaytir } from '@/lib/obuna'
import { referralMukofotBer } from '@/lib/referral'
import {
  paymeAuthTekshir,
  paymeXato,
  paymeNatija,
  somToTiyin,
  PAYME_XATO,
  PAYME_STATE,
  PAYME_ACCOUNT_FIELD,
} from '@/lib/tolov/payme'
import type { HydratedDocument } from 'mongoose'

export const dynamic = 'force-dynamic'

// Payme tranzaksiya muddati: 12 soat (ms)
const TX_TIMEOUT = 12 * 60 * 60 * 1000

interface RpcReq {
  method?: string
  params?: {
    id?: string
    time?: number
    amount?: number
    reason?: number
    account?: Record<string, string>
  }
  id?: unknown
}

// POST /api/tolov/payme — Payme Merchant API webhook (JSON-RPC 2.0)
export async function POST(request: NextRequest) {
  // 1) Avtorizatsiya
  const auth = request.headers.get('authorization')
  if (!paymeAuthTekshir(auth)) {
    return NextResponse.json(paymeXato(null, PAYME_XATO.AUTH))
  }

  // 2) Tana
  let body: RpcReq
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(paymeXato(null, PAYME_XATO.PARSE))
  }

  const { method, params = {}, id } = body

  try {
    await dbConnect()
    switch (method) {
      case 'CheckPerformTransaction':
        return NextResponse.json(await checkPerform(id, params))
      case 'CreateTransaction':
        return NextResponse.json(await createTx(id, params))
      case 'PerformTransaction':
        return NextResponse.json(await performTx(id, params))
      case 'CancelTransaction':
        return NextResponse.json(await cancelTx(id, params))
      case 'CheckTransaction':
        return NextResponse.json(await checkTx(id, params))
      default:
        return NextResponse.json(paymeXato(id, PAYME_XATO.METHOD_NOT_FOUND))
    }
  } catch (e) {
    console.error('payme webhook xato:', e)
    return NextResponse.json(paymeXato(id, PAYME_XATO.CANT_PERFORM))
  }
}

// account.order_id orqali Tolov topish
async function tolovTop(
  params: RpcReq['params'],
): Promise<HydratedDocument<ITolov> | null> {
  const orderId = params?.account?.[PAYME_ACCOUNT_FIELD]
  if (!orderId || !mongoose.isValidObjectId(orderId)) return null
  return Tolov.findOne({ _id: orderId, provider: 'payme' })
}

async function checkPerform(id: unknown, params: RpcReq['params']) {
  const tolov = await tolovTop(params)
  if (!tolov) return paymeXato(id, PAYME_XATO.ORDER_NOT_FOUND)
  if (params?.amount !== somToTiyin(tolov.summa)) {
    return paymeXato(id, PAYME_XATO.INVALID_AMOUNT)
  }
  // Allaqachon to'langan yoki faol tranzaksiya bor bo'lsa — yangi to'lovga ruxsat yo'q
  if (tolov.holati === 'tolangan' || tolov.paymeState === PAYME_STATE.PERFORMED) {
    return paymeXato(id, PAYME_XATO.CANT_PERFORM)
  }
  return paymeNatija(id, { allow: true })
}

async function createTx(id: unknown, params: RpcReq['params']) {
  const txId = params?.id
  const tolov = await tolovTop(params)
  if (!tolov) return paymeXato(id, PAYME_XATO.ORDER_NOT_FOUND)
  if (params?.amount !== somToTiyin(tolov.summa)) {
    return paymeXato(id, PAYME_XATO.INVALID_AMOUNT)
  }

  // Shu buyurtmada tranzaksiya allaqachon bormi?
  if (tolov.paymeTxId) {
    if (tolov.paymeTxId === txId) {
      // Idempotent — o'sha tranzaksiyani qaytaramiz
      return paymeNatija(id, {
        create_time: tolov.paymeCreateTime,
        transaction: tolov._id.toString(),
        state: tolov.paymeState,
      })
    }
    // Boshqa tranzaksiya allaqachon mavjud
    return paymeXato(id, PAYME_XATO.CANT_PERFORM)
  }

  // Muddat tekshiruvi
  if (params?.time && Date.now() - params.time > TX_TIMEOUT) {
    return paymeXato(
      id,
      PAYME_XATO.CANT_PERFORM,
      'Tranzaksiya muddati o\'tib ketgan',
    )
  }
  if (tolov.holati === 'tolangan') {
    return paymeXato(id, PAYME_XATO.CANT_PERFORM)
  }

  const now = Date.now()
  tolov.paymeTxId = txId
  tolov.paymeState = PAYME_STATE.CREATED
  tolov.paymeCreateTime = now
  await tolov.save()

  return paymeNatija(id, {
    create_time: now,
    transaction: tolov._id.toString(),
    state: PAYME_STATE.CREATED,
  })
}

async function performTx(id: unknown, params: RpcReq['params']) {
  const tolov = await Tolov.findOne({ paymeTxId: params?.id, provider: 'payme' })
  if (!tolov) return paymeXato(id, PAYME_XATO.TX_NOT_FOUND)

  if (tolov.paymeState === PAYME_STATE.PERFORMED) {
    // Idempotent
    return paymeNatija(id, {
      transaction: tolov._id.toString(),
      perform_time: tolov.paymePerformTime,
      state: PAYME_STATE.PERFORMED,
    })
  }
  if (tolov.paymeState !== PAYME_STATE.CREATED) {
    return paymeXato(id, PAYME_XATO.CANT_PERFORM)
  }

  const now = Date.now()
  tolov.paymeState = PAYME_STATE.PERFORMED
  tolov.paymePerformTime = now
  tolov.holati = 'tolangan'
  await tolov.save()

  // Obunani uzaytiramiz (faqat shu yerda, bir marta)
  const shop = await Shop.findById(tolov.shopId)
  if (shop) {
    obunaniUzaytir(shop, tolov.oy)
    shop.tarif = tolov.tarif
    await shop.save()
    // Birinchi to'lovda taklif mukofotini beramiz
    await referralMukofotBer(shop)
  }

  return paymeNatija(id, {
    transaction: tolov._id.toString(),
    perform_time: now,
    state: PAYME_STATE.PERFORMED,
  })
}

async function cancelTx(id: unknown, params: RpcReq['params']) {
  const tolov = await Tolov.findOne({ paymeTxId: params?.id, provider: 'payme' })
  if (!tolov) return paymeXato(id, PAYME_XATO.TX_NOT_FOUND)

  // Allaqachon bekor qilingan — idempotent
  if (
    tolov.paymeState === PAYME_STATE.CANCELLED ||
    tolov.paymeState === PAYME_STATE.CANCELLED_AFTER_PERFORM
  ) {
    return paymeNatija(id, {
      transaction: tolov._id.toString(),
      cancel_time: tolov.paymeCancelTime,
      state: tolov.paymeState,
    })
  }

  const now = Date.now()
  const yangiState =
    tolov.paymeState === PAYME_STATE.PERFORMED
      ? PAYME_STATE.CANCELLED_AFTER_PERFORM
      : PAYME_STATE.CANCELLED
  tolov.paymeState = yangiState
  tolov.paymeCancelTime = now
  tolov.paymeReason = params?.reason ?? null
  tolov.holati = 'bekor'
  await tolov.save()

  return paymeNatija(id, {
    transaction: tolov._id.toString(),
    cancel_time: now,
    state: yangiState,
  })
}

async function checkTx(id: unknown, params: RpcReq['params']) {
  const tolov = await Tolov.findOne({ paymeTxId: params?.id, provider: 'payme' })
  if (!tolov) return paymeXato(id, PAYME_XATO.TX_NOT_FOUND)
  return paymeNatija(id, {
    create_time: tolov.paymeCreateTime ?? 0,
    perform_time: tolov.paymePerformTime ?? 0,
    cancel_time: tolov.paymeCancelTime ?? 0,
    transaction: tolov._id.toString(),
    state: tolov.paymeState ?? 0,
    reason: tolov.paymeReason ?? null,
  })
}
