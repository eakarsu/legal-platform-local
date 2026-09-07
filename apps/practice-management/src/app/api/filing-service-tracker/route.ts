import { NextResponse } from 'next/server'

const serviceItems = [
  { id: 'FS-101', matter: 'Garcia v. Northwind', court: 'County Civil', method: 'sheriff service', status: 'awaiting proof', dueDays: 3 },
  { id: 'FS-102', matter: 'In re Parker', court: 'Probate', method: 'certified mail', status: 'served', dueDays: 0 },
  { id: 'FS-103', matter: 'State filing appeal', court: 'District Court', method: 'private process server', status: 'attempt failed', dueDays: 1 },
]

export async function GET() {
  return NextResponse.json({
    summary: {
      activeServices: serviceItems.length,
      proofsDue: serviceItems.filter((item) => item.status === 'awaiting proof').length,
      failedAttempts: serviceItems.filter((item) => item.status.includes('failed')).length,
    },
    serviceItems,
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const item = serviceItems.find((entry) => entry.id === body.id) || serviceItems[0]
  return NextResponse.json({
    id: item.id,
    nextStep: item.status.includes('failed') ? 'schedule alternate service and file declaration of diligence' : 'request proof of service and calendar filing deadline',
    packet: ['service instructions', 'file-stamped pleading', 'proof of service form'],
  })
}
