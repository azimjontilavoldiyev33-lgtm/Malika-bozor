import type { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Shaxsiy/boshqaruv bo'limlari indekslanmasin
      disallow: ['/kabinet', '/admin', '/api', '/kirish', '/royxat'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
