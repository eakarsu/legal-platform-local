import { NextResponse } from "next/server"

const retainers = [
  { id: "SF-TR-1", matter: "Delta acquisition", client: "Delta LLC", trustBalance: 12000, earnedFees: 4200, status: "balanced" },
  { id: "SF-TR-2", matter: "Employment dispute", client: "R. Stone", trustBalance: 1800, earnedFees: 1750, status: "minimum balance warning" },
  { id: "SF-TR-3", matter: "Lease negotiation", client: "Urban Nest", trustBalance: 6400, earnedFees: 2100, status: "balanced" },
]

export async function GET() {
  return NextResponse.json({
    summary: {
      retainers: retainers.length,
      trustBalance: retainers.reduce((sum, item) => sum + item.trustBalance, 0),
      warnings: retainers.filter((item) => item.status.includes("warning")).length,
    },
    retainers,
  })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const item = retainers.find((entry) => entry.id === body.id) || retainers[0]
  return NextResponse.json({
    id: item.id,
    action: item.status.includes("warning") ? "request replenishment before additional billable work" : "post monthly trust reconciliation",
    controls: ["compare trust ledger", "match invoice transfers", "retain client authorization"],
  })
}
