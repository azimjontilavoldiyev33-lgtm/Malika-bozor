import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { dbConnect } from './db'
import { User, type IUser, type UserRole } from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET .env.local faylida aniqlanmagan')
}
const secret = new TextEncoder().encode(JWT_SECRET)

export const COOKIE_NAME = 'mb_session'
const SESSION_DAVOMIYLIK = 60 * 60 * 24 * 7 // 7 kun (sekundda)

export interface SessionPayload {
  userId: string
  rol: UserRole
  shopId?: string
  [key: string]: unknown
}

// --- Parol ---
export async function parolHashla(parol: string): Promise<string> {
  return bcrypt.hash(parol, 10)
}

export async function parolTekshir(
  parol: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(parol, hash)
}

// --- Telefon normalizatsiya (901234567 -> +998901234567) ---
export function telefonNormalize(telefon: string): string {
  const raqamlar = telefon.replace(/\D/g, '')
  if (raqamlar.length === 9) return '+998' + raqamlar
  if (raqamlar.startsWith('998')) return '+' + raqamlar
  return telefon
}

// --- JWT ---
export async function sessionYarat(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAVOMIYLIK}s`)
    .sign(secret)
}

export async function sessionOqi(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secret)
    return payload
  } catch {
    return null
  }
}

// --- Cookie sessiya ---
export async function sessionOrnat(payload: SessionPayload): Promise<void> {
  const token = await sessionYarat(payload)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DAVOMIYLIK,
    path: '/',
  })
}

export async function sessionTozala(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// --- Joriy foydalanuvchi ---
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return sessionOqi(token)
}

export async function getCurrentUser(): Promise<IUser | null> {
  const session = await getSession()
  if (!session) return null
  await dbConnect()
  const user = await User.findById(session.userId).lean<IUser>()
  return user
}

// Faqat admin yoki shop ekanini talab qiladi; bo'lmasa null qaytaradi.
export async function requireUser(): Promise<IUser | null> {
  return getCurrentUser()
}
