import { Schema, model, models, type Types, type Model } from 'mongoose'
import type { Tarif } from '@/lib/tariflar'

export type TolovProvider = 'payme' | 'click' | 'karta'
export type TolovHolat = 'kutilmoqda' | 'tolangan' | 'bekor'

// Bitta to'lov urinishi = bitta "buyurtma" yozuvi.
// Payme/Click serverlari shu yozuvga uning _id'si orqali murojaat qiladi.
export interface ITolov {
  _id: Types.ObjectId
  shopId: Types.ObjectId // Shop._id
  tarif: Tarif
  oy: number // sotib olingan oylar soni (1 / 3 / 12 ...)
  summa: number // so'mda (provayderga yuborishda tiyin'ga ×100 qilinadi)
  provider: TolovProvider
  holati: TolovHolat

  // --- Payme (Merchant API) holati ---
  // paymeState: 0 yo'q · 1 yaratilgan · 2 amalga oshirilgan · -1/-2 bekor qilingan
  paymeTxId?: string // Payme tranzaksiya id (params.id)
  paymeState?: number
  paymeCreateTime?: number // unix ms
  paymePerformTime?: number // unix ms
  paymeCancelTime?: number // unix ms
  paymeReason?: number | null

  // --- Click (Merchant API) holati ---
  clickTransId?: string
  clickPrepareId?: string

  createdAt: Date
  updatedAt: Date
}

const TolovSchema = new Schema<ITolov>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    tarif: {
      type: String,
      enum: ['boshlangich', 'standart', 'premium'],
      required: true,
    },
    oy: { type: Number, required: true, min: 1 },
    summa: { type: Number, required: true, min: 0 },
    provider: {
      type: String,
      enum: ['payme', 'click', 'karta'],
      required: true,
    },
    holati: {
      type: String,
      enum: ['kutilmoqda', 'tolangan', 'bekor'],
      default: 'kutilmoqda',
      index: true,
    },

    // Payme
    paymeTxId: { type: String, index: true, sparse: true },
    paymeState: { type: Number, default: 0 },
    paymeCreateTime: { type: Number, default: 0 },
    paymePerformTime: { type: Number, default: 0 },
    paymeCancelTime: { type: Number, default: 0 },
    paymeReason: { type: Number, default: null },

    // Click
    clickTransId: { type: String, index: true, sparse: true },
    clickPrepareId: { type: String },
  },
  { timestamps: true },
)

export const Tolov: Model<ITolov> =
  (models.Tolov as Model<ITolov>) || model<ITolov>('Tolov', TolovSchema)
