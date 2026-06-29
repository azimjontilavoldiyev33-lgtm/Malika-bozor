import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import ChiqishTugma from '@/components/ChiqishTugma'

export default async function KabinetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/kirish')
  // Admin o'z paneliga
  if (user.rol === 'admin') redirect('/admin')
  if (!user.shopId) redirect('/kirish')

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Do&apos;kon kabineti</p>
          <h1 className="text-lg font-bold">{user.ism}</h1>
        </div>
        <ChiqishTugma />
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 text-sm">
        <Link
          href="/kabinet"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          📊 Bosh sahifa
        </Link>
        <Link
          href="/kabinet/elonlar"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          📱 E&apos;lonlarim
        </Link>
        <Link
          href="/kabinet/statistika"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          📈 Statistika
        </Link>
        <Link
          href="/kabinet/referral"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          🎁 Taklif qil
        </Link>
        <Link
          href="/kabinet/elon/yangi"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          ➕ Yangi e&apos;lon
        </Link>
        {/* 💳 Obuna (to'lov) — integratsiya keyinga qoldirildi, havola yashirilgan */}
        <Link
          href="/kabinet/sozlama"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          ⚙️ Sozlama
        </Link>
      </nav>

      {children}
    </div>
  )
}
