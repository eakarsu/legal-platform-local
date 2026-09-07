import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import crypto from 'crypto'

// POST /api/auth/verify-email - Send verification email
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fullUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (fullUser.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified' })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken }
    })

    // In production, send verification email here
    console.log(`Email verification token for ${user.email}: ${verificationToken}`)

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
      ...(process.env.NODE_ENV !== 'production' && { verificationToken })
    })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}

// PUT /api/auth/verify-email - Confirm email verification
export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}
