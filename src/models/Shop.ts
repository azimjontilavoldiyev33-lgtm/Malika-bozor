import { Schema, model, models, type Types, type Model } from 'mongoose'

export type ShopStatus = 'kutilmoqda' | 'tasdiqlangan' | 'bloklangan'

export interface IShop {
  _id: Types.ObjectId
  nomi: string
  egasiId: Types.ObjectId // User._id
  // Bozor ichidagi joylashuv yozuvi
  joylashuv: {
    blok: string // masalan "B"
    qator: string // masalan "3"
    dokonRaqami: string // masalan "12"
  }
  // Xarita + navigator uchun koordinata (ixtiyoriy)
  geo?: {
    lat: number
    lng: number
  }
  telefon: string
  telegram?: string
  ishVaqti?: string // masalan "09:00 - 19:00"
  holati: ShopStatus
  // Obuna: shu sanagacha do'kon e'lonlari mijozga ko'rinadi.
  // null yoki o'tib ketgan bo'lsa — e'lonlar yashirin (obuna kerak).
  obunaTugashi: Date | null
  reyting: number
  createdAt: Date
  updatedAt: Date
}

const ShopSchema = new Schema<IShop>(
  {
    nomi: { type: String, required: true, trim: true },
    egasiId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    joylashuv: {
      blok: { type: String, default: '', trim: true },
      qator: { type: String, default: '', trim: true },
      dokonRaqami: { type: String, default: '', trim: true },
    },
    geo: {
      lat: { type: Number },
      lng: { type: Number },
    },
    telefon: { type: String, required: true, trim: true },
    telegram: { type: String, trim: true },
    ishVaqti: { type: String, trim: true },
    holati: {
      type: String,
      enum: ['kutilmoqda', 'tasdiqlangan', 'bloklangan'],
      default: 'kutilmoqda',
      index: true,
    },
    obunaTugashi: { type: Date, default: null, index: true },
    reyting: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true },
)

export const Shop: Model<IShop> =
  (models.Shop as Model<IShop>) || model<IShop>('Shop', ShopSchema)
