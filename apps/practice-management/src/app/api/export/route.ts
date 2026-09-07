import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { generateCSV, generatePDFHTML } from '@/lib/export'
import { handleApiError } from '@/lib/api-error-handler'

// Column definitions per entity
const columnDefs: Record<string, { key: string; label: string }[]> = {
  clients: [
    { key: 'clientNumber', label: 'Client #' },
    { key: 'displayName', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
  ],
  matters: [
    { key: 'matterNumber', label: 'Matter #' },
    { key: 'name', label: 'Name' },
    { key: 'clientName', label: 'Client' },
    { key: 'caseType', label: 'Case Type' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'leadAttorneyName', label: 'Attorney' },
  ],
  tasks: [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'assigneeName', label: 'Assignee' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'matterName', label: 'Matter' },
  ],
  timeEntries: [
    { key: 'date', label: 'Date' },
    { key: 'matterName', label: 'Matter' },
    { key: 'userName', label: 'Attorney' },
    { key: 'description', label: 'Description' },
    { key: 'hours', label: 'Hours' },
    { key: 'rate', label: 'Rate' },
    { key: 'amount', label: 'Amount' },
    { key: 'billableStatus', label: 'Status' },
  ],
  invoices: [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'clientName', label: 'Client' },
    { key: 'matterName', label: 'Matter' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'total', label: 'Total' },
    { key: 'paidAmount', label: 'Paid' },
    { key: 'status', label: 'Status' },
  ],
  documents: [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'matterName', label: 'Matter' },
    { key: 'fileSize', label: 'Size' },
    { key: 'uploadedByName', label: 'Uploaded By' },
    { key: 'createdAt', label: 'Date' },
  ],
}

async function fetchExportData(entity: string) {
  switch (entity) {
    case 'clients': {
      const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } })
      return clients.map(c => ({
        ...c,
        displayName: c.companyName || `${c.firstName || ''} ${c.lastName || ''}`.trim()
      }))
    }
    case 'matters': {
      const matters = await prisma.matter.findMany({
        include: { client: true, leadAttorney: true },
        orderBy: { createdAt: 'desc' }
      })
      return matters.map(m => ({
        ...m,
        clientName: m.client.companyName || `${m.client.firstName || ''} ${m.client.lastName || ''}`.trim(),
        leadAttorneyName: m.leadAttorney.name,
      }))
    }
    case 'tasks': {
      const tasks = await prisma.task.findMany({
        include: { matter: true, assignee: true },
        orderBy: { createdAt: 'desc' }
      })
      return tasks.map(t => ({
        ...t,
        assigneeName: t.assignee?.name || 'Unassigned',
        matterName: t.matter ? `${t.matter.matterNumber} - ${t.matter.name}` : 'N/A',
        dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A',
      }))
    }
    case 'timeEntries': {
      const entries = await prisma.timeEntry.findMany({
        include: { matter: true, user: true },
        orderBy: { date: 'desc' }
      })
      return entries.map(e => ({
        ...e,
        date: new Date(e.date).toLocaleDateString(),
        matterName: `${e.matter.matterNumber} - ${e.matter.name}`,
        userName: e.user.name,
        hours: Number(e.hours),
        rate: Number(e.rate),
        amount: Number(e.amount),
      }))
    }
    case 'invoices': {
      const invoices = await prisma.invoice.findMany({
        include: { client: true, matter: true },
        orderBy: { createdAt: 'desc' }
      })
      return invoices.map(i => ({
        ...i,
        clientName: i.client.companyName || `${i.client.firstName || ''} ${i.client.lastName || ''}`.trim(),
        matterName: `${i.matter.matterNumber} - ${i.matter.name}`,
        issueDate: new Date(i.issueDate).toLocaleDateString(),
        dueDate: new Date(i.dueDate).toLocaleDateString(),
        total: Number(i.total),
        paidAmount: Number(i.paidAmount),
      }))
    }
    case 'documents': {
      const docs = await prisma.document.findMany({
        include: { matter: true, uploadedBy: true },
        orderBy: { createdAt: 'desc' }
      })
      return docs.map(d => ({
        ...d,
        matterName: d.matter ? `${d.matter.matterNumber} - ${d.matter.name}` : 'N/A',
        uploadedByName: d.uploadedBy.name,
        createdAt: new Date(d.createdAt).toLocaleDateString(),
      }))
    }
    default:
      return []
  }
}

// GET /api/export?entity=clients&format=csv|pdf
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entity = request.nextUrl.searchParams.get('entity')
    const format = request.nextUrl.searchParams.get('format') || 'csv'

    if (!entity || !columnDefs[entity]) {
      return NextResponse.json({ error: 'Invalid entity' }, { status: 400 })
    }

    const data = await fetchExportData(entity)
    const columns = columnDefs[entity]
    const title = entity.charAt(0).toUpperCase() + entity.slice(1).replace(/([A-Z])/g, ' $1')

    if (format === 'csv') {
      const csv = generateCSV(data, columns)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${entity}_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    if (format === 'pdf') {
      const html = generatePDFHTML(title + ' Report', data, columns)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${entity}_report_${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format. Use csv or pdf.' }, { status: 400 })
  } catch (error) {
    return handleApiError(error)
  }
}
