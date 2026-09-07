import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export interface UserPayload {
  id: string
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true }
    })

    return user ? { ...user } : null
  } catch {
    return null
  }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    throw new Error('Invalid credentials')
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated')
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })

  return { user, token }
}

export async function register(data: {
  email: string
  password: string
  name: string
  role?: string
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error('Email already exists')
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: (data.role as any) || 'ATTORNEY'
    }
  })

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })

  return { user, token }
}
