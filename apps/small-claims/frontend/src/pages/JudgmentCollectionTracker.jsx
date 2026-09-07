import React, { useEffect, useState } from 'react';

export default function JudgmentCollectionTracker() {
  const [data, setData] = useState({ summary: {}, judgments: [] });
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/judgment-collection-tracker').then((res) => res.json()).then(setData);
  }, []);

  const nextStep = async (id) => {
    const res = await fetch('/api/judgment-collection-tracker/next-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setResult(await res.json());
  };

  return (
    <div className="page">
      <h1>Judgment Collection Tracker</h1>
      <p>Track post-judgment collection windows, enforcement readiness, and packet requirements.</p>
      {Object.entries(data.summary).map(([key, value]) => <div className="card" key={key}><strong>{value}</strong> {key}</div>)}
      {data.judgments.map((item) => (
        <div className="card" key={item.id}>
          <h3>{item.id} - {item.debtor}</h3>
          <p>${item.amount} - {item.daysSinceJudgment} days since judgment - {item.status}</p>
          <button onClick={() => nextStep(item.id)}>Plan next step</button>
        </div>
      ))}
      {result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
