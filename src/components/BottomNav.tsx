'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ELEMENTLAR = [
  { href: '/', icon: '🏠', label: 'Bosh' },
  { href: '/dokonlar', icon: '🏪', label: "Do'konlar" },
  { href: '/kabinet', icon: '👤', label: 'Kabinet' },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Kabinet/admin ichida pastki nav ko'rsatmaymiz (ularning o'z navigatsiyasi bor)
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
        {ELEMENTLAR.map((el) => {
          const aktiv =
            el.href === '/'
              ? pathname === '/'
              : pathname.startsWith(el.href)
          return (
            <Link
              key={el.href}
              href={el.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition ${
                aktiv ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <span
                className={`text-lg leading-none transition ${
                  aktiv ? 'scale-110' : ''
                }`}
              >
                {el.icon}
              </span>
              {el.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
