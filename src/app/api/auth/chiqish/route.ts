import { NextResponse } from 'next/server'
import { sessionTozala } from '@/lib/auth'

export async function POST() {
  await sessionTozala()
  return NextResponse.json({ ok: true })
}
