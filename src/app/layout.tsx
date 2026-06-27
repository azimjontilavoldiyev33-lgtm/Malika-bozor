import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import './globals.css'
import SWRegister from '@/components/SWRegister'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Malika Bozor — Telefon qidiruv',
  description:
    "Malika bozoridan telefon qidiring, narxlarni solishtiring, do'kon joylashuvini ko'ring. Aldanmang, vaqt tejang.",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Malika Bozor',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SWRegister />
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                M
              </span>
              <span>
                Malika<span className="text-indigo-600">Bozor</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/dokonlar"
                className="hidden rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 sm:block"
              >
                Do&apos;konlar
              </Link>
              <Link
                href="/kirish"
                className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 font-medium text-white shadow-md shadow-indigo-500/25 transition hover:shadow-lg hover:shadow-indigo-500/40"
              >
                Do&apos;kon kirishi
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-slate-500">
            © 2026 Malika Bozor — telefon qidiruv platformasi
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  )
}
