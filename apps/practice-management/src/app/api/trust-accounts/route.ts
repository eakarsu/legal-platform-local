// Apply pass 5 — trust account management.
// PRODUCT-DECISION: this is the minimal IOLTA list/create endpoint backed
// by the existing Prisma TrustAccount model. The model already exists; we
// only add the route. Trust transactions are recorded via the same row's
// transactions[] (see /api/trust-accounts/[id]/transactions).
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const accounts = await prisma.trustAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: accounts })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { accountName, accountNumber, bankName, ioltaAccount } = body || {}
    if (!accountName || !accountNumber || !bankName) {
      return NextResponse.json({ error: 'accountName, accountNumber, bankName are required' }, { status: 400 })
    }
    const account = await prisma.trustAccount.create({
      data: {
        accountName,
        accountNumber,
        bankName,
        ioltaAccount: ioltaAccount !== false,
      },
    })
    return NextResponse.json(account, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
