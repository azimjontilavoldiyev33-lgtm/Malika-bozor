import { Schema, model, models, type Types, type Model } from 'mongoose'

// Kunlik agregatlangan statistika — har do'kon uchun bir kun = bitta hujjat.
// Xom hodisalar (har bosish alohida yozuv) emas, $inc bilan hisoblagich
// oshiriladi → Atlas M0 (bepul) uchun arzon va tez.
export interface IStatistika {
  _id: Types.ObjectId
  shopId: Types.ObjectId
  sana: string // 'YYYY-MM-DD' (Asia/Tashkent bo'yicha)
  dokonKorish: number // /dokon/[id] sahifasi ochilishi
  elonKorish: number // /telefon/[id] sahifasida do'kon e'loni ko'rilishi
  qongiroq: number // "Qo'ng'iroq" tugmasi bosilishi
  telegram: number // "Telegram" tugmasi bosilishi
  yolKorsatma: number // "Yo'l ko'rsat" (Yandex/Google) bosilishi
  createdAt: Date
  updatedAt: Date
}

const StatistikaSchema = new Schema<IStatistika>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    sana: { type: String, required: true },
    dokonKorish: { type: Number, default: 0 },
    elonKorish: { type: Number, default: 0 },
    qongiroq: { type: Number, default: 0 },
    telegram: { type: Number, default: 0 },
    yolKorsatma: { type: Number, default: 0 },
  },
  { timestamps: true },
)

// Bir do'kon uchun bir kunda bitta hujjat (upsert kaliti)
StatistikaSchema.index({ shopId: 1, sana: 1 }, { unique: true })

export const Statistika: Model<IStatistika> =
  (models.Statistika as Model<IStatistika>) ||
  model<IStatistika>('Statistika', StatistikaSchema)
