// Payme (Merchant API) yordamchilari.
// Payme tiyin'da ishlaydi: 1 so'm = 100 tiyin.
//
// Kassa sozlamasida "ac" (account) maydoni `order_id` deb belgilanishi kerak —
// biz to'lovni shu maydon orqali topamiz (= Tolov._id).

import { createHash } from 'crypto'

export const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID ?? ''
export const PAYME_KEY = process.env.PAYME_KEY ?? '' // webhook Basic-auth paroli
// Sandbox: https://checkout.test.paycom.uz · Prod: https://checkout.paycom.uz
export const PAYME_CHECKOUT_URL =
  process.env.PAYME_CHECKOUT_URL ?? 'https://checkout.paycom.uz'
// Kassadagi "ac" maydon nomi (shu bilan to'lovni bog'laymiz)
export const PAYME_ACCOUNT_FIELD = 'order_id'

export function somToTiyin(som: number): number {
  return Math.round(som * 100)
}

// Foydalanuvchini yo'naltirish uchun checkout havolasi (GET usuli).
// params: m=merchant;ac.order_id=<id>;a=<tiyin>[;c=callback;l=uz]
export function paymeCheckoutUrl(
  tolovId: string,
  summaSom: number,
  qaytishUrl?: string,
): string {
  const qismlar = [
    `m=${PAYME_MERCHANT_ID}`,
    `ac.${PAYME_ACCOUNT_FIELD}=${tolovId}`,
    `a=${somToTiyin(summaSom)}`,
    'l=uz',
  ]
  if (qaytishUrl) qismlar.push(`c=${qaytishUrl}`)
  const encoded = Buffer.from(qismlar.join(';')).toString('base64')
  return `${PAYME_CHECKOUT_URL}/${encoded}`
}

// Webhook Basic-auth: "Basic base64(Paycom:KEY)"
export function paymeAuthTekshir(authHeader: string | null): boolean {
  // Kalit sozlanmagan bo'lsa — webhook'ni umuman qabul qilmaymiz (fail-closed)
  if (!PAYME_KEY) return false
  if (!authHeader?.startsWith('Basic ')) return false
  try {
    const dekod = Buffer.from(authHeader.slice(6), 'base64').toString('utf8')
    const ikkinchi = dekod.split(':')[1] ?? ''
    // crypto.timingSafeEqual o'rniga oddiy taqqoslash — kalit kalit bilan
    return ikkinchi.length > 0 && safeEqual(ikkinchi, PAYME_KEY)
  } catch {
    return false
  }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const ha = createHash('sha256').update(a).digest('hex')
  const hb = createHash('sha256').update(b).digest('hex')
  return ha === hb
}

// --- JSON-RPC xato kodlari ---
export const PAYME_XATO = {
  AUTH: -32504, // Avtorizatsiya yo'q
  METHOD_NOT_FOUND: -32601,
  PARSE: -32700,
  INVALID_AMOUNT: -31001, // Noto'g'ri summa
  CANT_PERFORM: -31008, // Operatsiyani bajarib bo'lmaydi
  TX_NOT_FOUND: -31003, // Tranzaksiya topilmadi
  ORDER_NOT_FOUND: -31050, // Buyurtma (account) topilmadi
} as const

type LangMatn = { ru: string; uz: string; en: string }

const XATO_MATN: Record<number, LangMatn> = {
  [PAYME_XATO.INVALID_AMOUNT]: {
    ru: 'Неверная сумма',
    uz: 'Noto\'g\'ri summa',
    en: 'Invalid amount',
  },
  [PAYME_XATO.ORDER_NOT_FOUND]: {
    ru: 'Заказ не найден',
    uz: 'Buyurtma topilmadi',
    en: 'Order not found',
  },
  [PAYME_XATO.CANT_PERFORM]: {
    ru: 'Невозможно выполнить операцию',
    uz: 'Operatsiyani bajarib bo\'lmaydi',
    en: 'Unable to perform operation',
  },
  [PAYME_XATO.TX_NOT_FOUND]: {
    ru: 'Транзакция не найдена',
    uz: 'Tranzaksiya topilmadi',
    en: 'Transaction not found',
  },
}

// JSON-RPC xato javobi obyekti
export function paymeXato(
  id: unknown,
  code: number,
  data?: string,
): { jsonrpc: '2.0'; id: unknown; error: { code: number; message: LangMatn; data?: string } } {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message: XATO_MATN[code] ?? { ru: 'Ошибка', uz: 'Xato', en: 'Error' },
      ...(data ? { data } : {}),
    },
  }
}

// JSON-RPC muvaffaqiyatli javob obyekti
export function paymeNatija(
  id: unknown,
  result: Record<string, unknown>,
): { jsonrpc: '2.0'; id: unknown; result: Record<string, unknown> } {
  return { jsonrpc: '2.0', id, result }
}

// Payme tranzaksiya holatlari
export const PAYME_STATE = {
  CREATED: 1,
  PERFORMED: 2,
  CANCELLED: -1, // yaratilgandan keyin bekor
  CANCELLED_AFTER_PERFORM: -2, // amalga oshirilgandan keyin bekor
} as const
