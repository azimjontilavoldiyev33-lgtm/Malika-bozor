// API javoblarida ishlatiladigan umumiy tiplar (frontend uchun)

export interface DokonQisqa {
  _id: string
  nomi: string
  joylashuv?: {
    blok?: string
    qator?: string
    dokonRaqami?: string
  }
  geo?: { lat: number; lng: number }
  telefon?: string
  reyting?: number
}

export interface ListingNatija {
  _id: string
  brend: string
  model: string
  xotira?: string
  rang?: string
  holati: 'yangi' | 'ishlatilgan'
  narx: number
  valyuta: 'UZS' | 'USD'
  rasmlar: string[]
  bor: boolean
  createdAt?: string
  dokon: DokonQisqa
}

export interface QidiruvJavob {
  natijalar: ListingNatija[]
  jami: number
  page: number
  sahifalar: number
}
