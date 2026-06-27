// Obuna tariflari — e'lon limiti va narxi shu yerda boshqariladi.
// Raqamlarni o'zgartirish uchun faqat shu faylni tahrirlang.

export type Tarif = 'boshlangich' | 'standart' | 'premium'

export interface TarifMalumot {
  nomi: string
  limit: number | null // null = cheksiz
  narx: number // so'm/oy
  imkoniyatlar: string[]
}

export const TARIFLAR: Record<Tarif, TarifMalumot> = {
  boshlangich: {
    nomi: 'Boshlang\'ich',
    limit: 20,
    narx: 50000,
    imkoniyatlar: ['20 tagacha e\'lon', 'Qidiruvda ko\'rinish'],
  },
  standart: {
    nomi: 'Standart',
    limit: 50,
    narx: 100000,
    imkoniyatlar: ['50 tagacha e\'lon', 'Qidiruvda ko\'rinish'],
  },
  premium: {
    nomi: 'Premium',
    limit: null,
    narx: 200000,
    imkoniyatlar: ['Cheksiz e\'lon', 'Qidiruvda ko\'rinish'],
  },
}

export const TARIF_RUYXATI: Tarif[] = ['boshlangich', 'standart', 'premium']

// Tarif bo'yicha e'lon limiti (null = cheksiz)
export function elonLimiti(tarif?: Tarif | null): number | null {
  return TARIFLAR[tarif ?? 'boshlangich'].limit
}

// Limitga yetganmi? (cheksiz bo'lsa hech qachon)
export function limitTugaganmi(tarif: Tarif | null | undefined, soni: number): boolean {
  const limit = elonLimiti(tarif)
  if (limit === null) return false
  return soni >= limit
}

export function tarifNomi(tarif?: Tarif | null): string {
  return TARIFLAR[tarif ?? 'boshlangich'].nomi
}

export function limitMatn(tarif?: Tarif | null): string {
  const limit = elonLimiti(tarif)
  return limit === null ? 'Cheksiz' : `${limit} ta`
}
