import { z } from 'zod'

// O'zbekiston telefon raqami: +998 XX XXX XX XX (yoki shunchaki 9 ta raqam)
const telefonRegex = /^(\+998)?\d{9}$/

export const royxatSchema = z.object({
  ism: z.string().min(2, 'Ism kamida 2 harf bo\'lsin'),
  telefon: z
    .string()
    .regex(telefonRegex, 'Telefon raqami noto\'g\'ri (masalan: 901234567)'),
  parol: z.string().min(6, 'Parol kamida 6 belgi bo\'lsin'),
  dokonNomi: z.string().min(2, 'Do\'kon nomini kiriting'),
  refKod: z.string().trim().optional(), // ixtiyoriy taklif kodi
})

export const kirishSchema = z.object({
  telefon: z.string().regex(telefonRegex, 'Telefon raqami noto\'g\'ri'),
  parol: z.string().min(1, 'Parolni kiriting'),
})

export const shopSchema = z.object({
  nomi: z.string().min(2),
  telefon: z.string().regex(telefonRegex),
  telegram: z.string().optional(),
  ishVaqti: z.string().optional(),
  joylashuv: z.object({
    blok: z.string().optional().default(''),
    qator: z.string().optional().default(''),
    dokonRaqami: z.string().optional().default(''),
  }),
  geo: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
})

export const listingSchema = z.object({
  brend: z.string().min(1, 'Brendni tanlang'),
  model: z.string().min(1, 'Modelni kiriting'),
  xotira: z.string().optional(),
  rang: z.string().optional(),
  holati: z.enum(['yangi', 'ishlatilgan']),
  narx: z.number().min(0, 'Narx noto\'g\'ri'),
  valyuta: z.enum(['UZS', 'USD']).default('UZS'),
  rasmlar: z.array(z.string()).default([]),
  tavsif: z.string().optional(),
  bor: z.boolean().default(true),
})

export type RoyxatInput = z.infer<typeof royxatSchema>
export type KirishInput = z.infer<typeof kirishSchema>
export type ShopInput = z.infer<typeof shopSchema>
export type ListingInput = z.infer<typeof listingSchema>
