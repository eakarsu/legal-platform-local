import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' })
    }

    // Invalidate existing tokens
    await prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = crypto.randomUUID()
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // In production, send verification email
    console.log(`Verification token for ${user.email}: ${token}`)
    console.log(`Verify URL: ${process.env.NEXTAUTH_URL}/verify-email?token=${token}`)

    return NextResponse.json({ message: 'Verification email sent' })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}
