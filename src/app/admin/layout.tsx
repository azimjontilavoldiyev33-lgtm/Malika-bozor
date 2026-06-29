import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import ChiqishTugma from '@/components/ChiqishTugma'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/kirish')
  if (user.rol !== 'admin') redirect('/kabinet')

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Admin panel</p>
          <h1 className="text-lg font-bold">{user.ism}</h1>
        </div>
        <ChiqishTugma />
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 text-sm">
        <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-slate-100">
          📊 Statistika
        </Link>
        <Link
          href="/admin/dokonlar"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          🏪 Do&apos;konlar
        </Link>
        <Link
          href="/admin/elonlar"
          className="rounded-lg px-3 py-2 hover:bg-slate-100"
        >
          📱 E&apos;lonlar
        </Link>
        {/* 💳 To'lovlar — integratsiya keyinga qoldirildi, havola yashirilgan */}
      </nav>

      {children}
    </div>
  )
}
