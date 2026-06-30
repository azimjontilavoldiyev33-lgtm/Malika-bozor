import type { MetadataRoute } from 'next'
import { dbConnect } from '@/lib/db'
import { Shop } from '@/models/Shop'
import { Listing } from '@/models/Listing'

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export const revalidate = 3600 // soatiga bir yangilanadi

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statik: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/dokonlar`, changeFrequency: 'daily', priority: 0.8 },
  ]

  try {
    await dbConnect()

    // Faqat ommaga ko'rinadigan (tasdiqlangan + obunasi faol) do'konlar
    const shops = await Shop.find({
      holati: 'tasdiqlangan',
      obunaTugashi: { $gt: new Date() },
    })
      .select('_id updatedAt')
      .lean()

    const faolShopId = shops.map((s) => s._id)

    const listings = await Listing.find({ faol: true, shopId: { $in: faolShopId } })
      .select('_id updatedAt')
      .lean()

    const dokonlar: MetadataRoute.Sitemap = shops.map((s) => ({
      url: `${BASE}/dokon/${s._id}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    const elonlar: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${BASE}/telefon/${l._id}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

    return [...statik, ...dokonlar, ...elonlar]
  } catch {
    // DB ulanmasa ham hech bo'lmasa statik sahifalarni qaytaramiz
    return statik
  }
}
