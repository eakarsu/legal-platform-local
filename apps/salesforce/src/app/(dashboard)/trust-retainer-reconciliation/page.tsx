"use client"

import { useEffect, useState } from "react"

export default function TrustRetainerReconciliationPage() {
  const [data, setData] = useState<any>({ summary: {}, retainers: [] })
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch("/api/trust-retainer-reconciliation").then((res) => res.json()).then(setData)
  }, [])

  const reconcile = async (id: string) => {
    const res = await fetch("/api/trust-retainer-reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setResult(await res.json())
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trust Retainer Reconciliation</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(data.summary).map(([key, value]) => <div className="rounded-lg border bg-white p-4" key={key}><div className="text-2xl font-semibold">{String(value)}</div><div className="text-sm text-slate-500">{key}</div></div>)}
      </div>
      {data.retainers.map((item: any) => (
        <div className="rounded-lg border bg-white p-4" key={item.id}>
          <h2 className="font-semibold">{item.matter}</h2>
          <p>{item.client} - trust ${item.trustBalance} - earned ${item.earnedFees} - {item.status}</p>
          <button className="mt-3 rounded bg-slate-900 px-3 py-2 text-white" onClick={() => reconcile(item.id)}>Reconcile</button>
        </div>
      ))}
      {result && <pre className="rounded-lg border bg-white p-4">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
