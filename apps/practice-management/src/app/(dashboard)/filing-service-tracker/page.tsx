"use client"

import { useEffect, useState } from 'react'

export default function FilingServiceTrackerPage() {
  const [data, setData] = useState<any>({ summary: {}, serviceItems: [] })
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/filing-service-tracker').then((res) => res.json()).then(setData)
  }, [])

  const plan = async (id: string) => {
    const res = await fetch('/api/filing-service-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setResult(await res.json())
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Court Filing Service Tracker</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(data.summary).map(([key, value]) => <div className="rounded-lg border bg-white p-4" key={key}><div className="text-2xl font-semibold">{String(value)}</div><div className="text-sm text-gray-500">{key}</div></div>)}
      </div>
      {data.serviceItems.map((item: any) => (
        <div className="rounded-lg border bg-white p-4" key={item.id}>
          <h2 className="font-semibold">{item.matter}</h2>
          <p>{item.court} - {item.method} - {item.status} - due in {item.dueDays} days</p>
          <button className="mt-3 rounded bg-gray-900 px-3 py-2 text-white" onClick={() => plan(item.id)}>Plan service</button>
        </div>
      ))}
      {result && <pre className="rounded-lg border bg-white p-4">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
