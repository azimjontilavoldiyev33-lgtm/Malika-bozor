// Statistika hodisalari turlari — model maydonlari bilan bir xil.
export const STAT_TURLARI = [
  'dokonKorish',
  'elonKorish',
  'qongiroq',
  'telegram',
  'yolKorsatma',
] as const

export type StatTur = (typeof STAT_TURLARI)[number]

export function statTurmi(qiymat: unknown): qiymat is StatTur {
  return (
    typeof qiymat === 'string' && STAT_TURLARI.includes(qiymat as StatTur)
  )
}

// Asia/Tashkent (UTC+5) bo'yicha 'YYYY-MM-DD' sana kaliti.
// en-CA locale ISO formatda ('2026-06-29') beradi.
export function sanaKalit(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

// Oxirgi n kunning sana kalitlari (eskidan yangiga). Tashkent DST'siz.
export function oxirgiKunlar(n: number): string[] {
  const kunlar: string[] = []
  const hozir = Date.now()
  for (let i = n - 1; i >= 0; i--) {
    kunlar.push(sanaKalit(new Date(hozir - i * 86_400_000)))
  }
  return kunlar
}
