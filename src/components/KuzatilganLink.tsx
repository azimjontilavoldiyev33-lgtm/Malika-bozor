'use client'

import type { AnchorHTMLAttributes } from 'react'
import type { StatTur } from '@/lib/stat'
import { statYubor } from '@/lib/statBeacon'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  shopId: string
  tur: StatTur
}

// Oddiy <a> kabi, lekin bosilganda statistika hodisasini ham yuboradi.
// Aloqa tugmalari (qo'ng'iroq / telegram / yo'l ko'rsat) uchun.
export default function KuzatilganLink({
  shopId,
  tur,
  children,
  onClick,
  ...rest
}: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        statYubor(shopId, tur)
        onClick?.(e)
      }}
    >
      {children}
    </a>
  )
}
