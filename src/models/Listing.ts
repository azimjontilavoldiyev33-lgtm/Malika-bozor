import { Schema, model, models, type Types, type Model } from 'mongoose'

export type PhoneCondition = 'yangi' | 'ishlatilgan'

export interface IListing {
  _id: Types.ObjectId
  shopId: Types.ObjectId // Shop._id
  brend: string // "Apple", "Samsung", "Xiaomi" ...
  model: string // "iPhone 15 Pro"
  xotira?: string // "256GB"
  rang?: string
  holati: PhoneCondition // yangi / ishlatilgan
  narx: number // so'mda (yoki valyutaga qarab)
  valyuta: 'UZS' | 'USD'
  rasmlar: string[]
  tavsif?: string
  bor: boolean // omborda bor/yo'q (inStock)
  faol: boolean // e'lon ko'rinadimi (admin bloklashi mumkin)
  createdAt: Date
  updatedAt: Date
}

const ListingSchema = new Schema<IListing>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    brend: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true },
    xotira: { type: String, trim: true },
    rang: { type: String, trim: true },
    holati: {
      type: String,
      enum: ['yangi', 'ishlatilgan'],
      default: 'yangi',
      index: true,
    },
    narx: { type: Number, required: true, min: 0, index: true },
    valyuta: { type: String, enum: ['UZS', 'USD'], default: 'UZS' },
    rasmlar: { type: [String], default: [] },
    tavsif: { type: String, trim: true },
    bor: { type: Boolean, default: true },
    faol: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

// Matnli qidiruv uchun (brend + model + tavsif)
ListingSchema.index({ brend: 'text', model: 'text', tavsif: 'text' })

export const Listing: Model<IListing> =
  (models.Listing as Model<IListing>) ||
  model<IListing>('Listing', ListingSchema)
