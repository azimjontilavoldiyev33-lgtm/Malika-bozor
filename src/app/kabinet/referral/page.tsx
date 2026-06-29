import Link from 'next/link'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/lib/auth'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { noyobReferralKod, REFERRAL_MUKOFOT_OY } from '@/lib/referral'
import NusxaTugma from '@/components/NusxaTugma'

export const dynamic = 'force-dynamic'

async function bazaviyUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_BASE_URL
  if (env) return env.replace(/\/$/, '')
  // Zaxira — so'rov sarlavhasidan host
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export default async function ReferralPage() {
  const user = await getCurrentUser()
  await dbConnect()

  const shop = await Shop.findById(user!.shopId)
  if (!shop) {
    return <p className="text-sm text-slate-500">Do&apos;kon topilmadi.</p>
  }

  // Eski do'konlarda kod yo'q bo'lishi mumkin — shu yerda yaratib qo'yamiz
  if (!shop.referralKod) {
    shop.referralKod = await noyobReferralKod()
    await shop.save()
  }

  const kod = shop.referralKod
  const havola = `${await bazaviyUrl()}/royxat?ref=${kod}`

  const taklifSoni = await Shop.countDocuments({ taklifQilgan: shop._id })
  const mukofotSoni = await Shop.countDocuments({
    taklifQilgan: shop._id,
    referralMukofotBerildi: true,
  })
  const yutilganOy = mukofotSoni * REFERRAL_MUKOFOT_OY

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">🎁 Do&apos;st do&apos;konni taklif qiling</h2>

      {/* Tushuntirish */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-slate-700">
        Tanishingiz — boshqa do&apos;kon egasini taklif qiling. U sizning
        kodingiz bilan ro&apos;yxatdan o&apos;tib, <b>birinchi marta obuna
        to&apos;lasa</b>, ikkalangizga ham{' '}
        <b className="text-indigo-700">{REFERRAL_MUKOFOT_OY} oy bepul</b> obuna
        qo&apos;shiladi.
      </div>

      {/* Havola + nusxa */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-slate-600">Taklif havolangiz</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={havola}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 outline-none"
          />
          <NusxaTugma matn={havola} />
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Yoki kodni ayting:{' '}
          <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-base font-bold tracking-widest text-slate-900">
            {kod}
          </span>
        </p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold">{taklifSoni}</p>
          <p className="text-xs text-slate-500">Ro&apos;yxatdan o&apos;tdi</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{mukofotSoni}</p>
          <p className="text-xs text-slate-500">To&apos;lov qildi</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">+{yutilganOy}</p>
          <p className="text-xs text-slate-500">Oy yutdingiz</p>
        </div>
      </div>

      <p className="px-1 text-xs text-slate-400">
        Mukofot taklif qilingan do&apos;kon <b>birinchi marta to&apos;lov
        qilganda</b> beriladi (faqat ro&apos;yxatdan o&apos;tgani uchun emas).
      </p>

      <Link
        href="/kabinet"
        className="inline-block text-sm text-indigo-600 hover:underline"
      >
        ← Bosh sahifa
      </Link>
    </div>
  )
}
