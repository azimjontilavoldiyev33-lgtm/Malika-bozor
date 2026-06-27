import { Schema, model, models, type Types, type Model } from 'mongoose'

export type UserRole = 'admin' | 'shop'

export interface IUser {
  _id: Types.ObjectId
  ism: string
  telefon: string // login uchun ishlatiladi (unikal)
  parolHash: string
  rol: UserRole
  shopId?: Types.ObjectId // rol === 'shop' bo'lsa, tegishli do'kon
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    ism: { type: String, required: true, trim: true },
    telefon: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    parolHash: { type: String, required: true },
    rol: {
      type: String,
      enum: ['admin', 'shop'],
      default: 'shop',
      required: true,
    },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop' },
  },
  { timestamps: true },
)

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>('User', UserSchema)
