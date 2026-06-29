// Click (Merchant API) yordamchilari.
// Click so'm'da ishlaydi (Payme'dan farqli — tiyin EMAS).
// Integratsiya: Prepare (action=0) + Complete (action=1) callback'lari,
// har biri MD5 imzo bilan tasdiqlanadi.

import { createHash } from 'crypto'

export const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID ?? ''
export const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID ?? ''
export const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY ?? ''
export const CLICK_MERCHANT_USER_ID = process.env.CLICK_MERCHANT_USER_ID ?? ''
export const CLICK_PAY_URL =
  process.env.CLICK_PAY_URL ?? 'https://my.click.uz/services/pay'

// Foydalanuvchini yo'naltirish uchun to'lov havolasi.
export function clickCheckoutUrl(
  tolovId: string,
  summaSom: number,
  qaytishUrl?: string,
): string {
  const p = new URLSearchParams({
    service_id: CLICK_SERVICE_ID,
    merchant_id: CLICK_MERCHANT_ID,
    amount: String(summaSom),
    transaction_param: tolovId,
  })
  if (qaytishUrl) p.set('return_url', qaytishUrl)
  return `${CLICK_PAY_URL}?${p.toString()}`
}

export const CLICK_ACTION = { PREPARE: 0, COMPLETE: 1 } as const

// Click callback maydonlari (ikkala bosqich uchun umumiy + Complete'da merchant_prepare_id)
export interface ClickCallback {
  click_trans_id: string
  service_id: string
  merchant_trans_id: string // = bizning Tolov._id
  merchant_prepare_id?: string // faqat Complete'da
  amount: string
  action: string
  sign_time: string
  sign_string: string
  error?: string
}

// Imzoni tekshirish. Prepare va Complete uchun string tarkibi farq qiladi
// (Complete'da merchant_prepare_id qo'shiladi).
export function clickImzoTekshir(cb: ClickCallback): boolean {
  const action = Number(cb.action)
  const qismlar = [
    cb.click_trans_id,
    cb.service_id,
    CLICK_SECRET_KEY,
    cb.merchant_trans_id,
    ...(action === CLICK_ACTION.COMPLETE ? [cb.merchant_prepare_id ?? ''] : []),
    cb.amount,
    cb.action,
    cb.sign_time,
  ]
  const kutilgan = createHash('md5').update(qismlar.join('')).digest('hex')
  return kutilgan === cb.sign_string
}

// --- Click xato kodlari ---
export const CLICK_XATO = {
  OK: 0,
  SIGN: -1, // imzo noto'g'ri
  AMOUNT: -2, // summa noto'g'ri
  ACTION: -3, // amal topilmadi
  ALREADY_PAID: -4, // allaqachon to'langan
  ORDER_NOT_FOUND: -5, // buyurtma/user topilmadi
  TX_NOT_FOUND: -6, // tranzaksiya topilmadi
  CANCELLED: -9, // bekor qilingan
} as const

const XATO_MATN: Record<number, string> = {
  [CLICK_XATO.OK]: 'Success',
  [CLICK_XATO.SIGN]: 'SIGN CHECK FAILED',
  [CLICK_XATO.AMOUNT]: 'Incorrect parameter amount',
  [CLICK_XATO.ACTION]: 'Action not found',
  [CLICK_XATO.ALREADY_PAID]: 'Already paid',
  [CLICK_XATO.ORDER_NOT_FOUND]: 'Order not found',
  [CLICK_XATO.TX_NOT_FOUND]: 'Transaction does not exist',
  [CLICK_XATO.CANCELLED]: 'Transaction cancelled',
}

// Click callback javobi (JSON)
export function clickJavob(
  cb: ClickCallback,
  error: number,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    click_trans_id: cb.click_trans_id,
    merchant_trans_id: cb.merchant_trans_id,
    error,
    error_note: XATO_MATN[error] ?? 'Error',
    ...extra,
  }
}
