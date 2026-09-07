/**
 * GET /api/portal/:clientToken  (PUBLIC — no session required)
 *
 * Returns a safe, scoped view of the client's own data:
 * - Basic contact info
 * - Open matters (title, status, practice area, billing type)
 * - Invoices with balance due
 * - Trust ledger balances (totals only, no disbursement details)
 * - Recent documents (metadata only)
 * - Upcoming deadlines
 *
 * Does NOT expose: SSN/EIN, opposing counsel details, internal notes,
 * other clients' data, or firm financials.
 */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { clientToken: string } }
) {
  try {
    const { clientToken } = params

    if (!clientToken || clientToken.length < 32) {
      return NextResponse.json({ error: 'Invalid portal token' }, { status: 400 })
    }

    // Look up the client by their portal token
    const client = await prisma.client.findUnique({
      where: { portalToken: clientToken },
      include: {
        matters: {
          where: { status: { not: 'CLOSED' } },
          include: {
            practiceArea: { select: { name: true, color: true } },
            deadlines: {
              where: {
                status: { not: 'COMPLETED' },
                dueDate: { gte: new Date() },
              },
              select: {
                id: true,
                title: true,
                dueDate: true,
                priority: true,
                type: true,
              },
              orderBy: { dueDate: 'asc' },
              take: 10,
            },
            invoices: {
              where: { status: { not: 'DRAFT' } },
              select: {
                id: true,
                invoiceNumber: true,
                status: true,
                issueDate: true,
                dueDate: true,
                totalAmount: true,
                paidAmount: true,
                balanceDue: true,
              },
              orderBy: { issueDate: 'desc' },
              take: 20,
            },
          },
          orderBy: { openDate: 'desc' },
        },
        trustLedgers: {
          include: {
            trustAccount: { select: { name: true, isIOLTA: true } },
            matter: { select: { matterNumber: true, title: true } },
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            createdAt: true,
            fileSize: true,
            mimeType: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Portal not found or access revoked' }, { status: 404 })
    }

    if (!client.portalEnabled) {
      return NextResponse.json({ error: 'Portal access is disabled for this account' }, { status: 403 })
    }

    // Update last-login timestamp (fire-and-forget — don't await in hot path)
    prisma.client.update({
      where: { portalToken: clientToken },
      data: { portalLastLogin: new Date() },
    }).catch(err => console.error('[portal] Failed to update lastLogin:', err))

    // Compute summary stats
    const allInvoices = client.matters.flatMap((m: any) => m.invoices)
    const totalOutstanding = allInvoices
      .filter((inv: any) => inv.status === 'SENT' || inv.status === 'OVERDUE' || inv.status === 'PARTIAL')
      .reduce((sum: number, inv: any) => sum + Number(inv.balanceDue ?? 0), 0)

    const totalTrustBalance = client.trustLedgers
      .reduce((sum: number, l: any) => sum + Number(l.balance), 0)

    const upcomingDeadlines = client.matters
      .flatMap((m: any) => m.deadlines.map((d: any) => ({
        ...d,
        matterTitle: m.title,
        matterNumber: m.matterNumber,
      })))
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)

    return NextResponse.json({
      client: {
        id: client.id,
        clientNumber: client.clientNumber,
        displayName: client.displayName,
        firstName: client.firstName,
        lastName: client.lastName,
        companyName: client.companyName,
        email: client.email,
        phone: client.phone,
        mobile: client.mobile,
        address: client.address,
        city: client.city,
        state: client.state,
        zip: client.zip,
        country: client.country,
        type: client.type,
        status: client.status,
      },
      summary: {
        openMatters: client.matters.length,
        totalOutstanding,
        totalTrustBalance,
        documentsCount: client.documents.length,
        upcomingDeadlines: upcomingDeadlines.length,
      },
      matters: client.matters.map((m: any) => ({
        id: m.id,
        matterNumber: m.matterNumber,
        title: m.title,
        status: m.status,
        billingType: m.billingType,
        openDate: m.openDate,
        statuteOfLimitations: m.statuteOfLimitations,
        practiceArea: m.practiceArea,
        invoices: m.invoices,
        deadlines: m.deadlines,
      })),
      trustLedgers: client.trustLedgers.map((l: any) => ({
        accountName: l.trustAccount.name,
        isIOLTA: l.trustAccount.isIOLTA,
        matter: l.matter,
        balance: Number(l.balance),
      })),
      documents: client.documents.map((d: any) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        createdAt: d.createdAt,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
      })),
      upcomingDeadlines,
    })
  } catch (error) {
    console.error('Client portal error:', error)
    return NextResponse.json({ error: 'Failed to load portal data' }, { status: 500 })
  }
}
