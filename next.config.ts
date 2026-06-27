import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Bir nechta lockfile ogohlantirishini bartaraf etamiz — ildizni aniq belgilaymiz
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
