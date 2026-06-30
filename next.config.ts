import type { NextConfig } from 'next'
import path from 'node:path'

const xavfsizlikSarlavhalari = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Geolokatsiya do'kon joylashuvini belgilashda kerak — faqat o'zimizga ruxsat
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(self), camera=(), microphone=()',
  },
]

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Bir nechta lockfile ogohlantirishini bartaraf etamiz — ildizni aniq belgilaymiz
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [{ source: '/:path*', headers: xavfsizlikSarlavhalari }]
  },
}

export default nextConfig
