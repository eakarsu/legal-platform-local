import React, { useEffect, useState } from 'react';

export default function UscisReceiptNoticeTracker() {
  const [data, setData] = useState({ summary: {}, receipts: [] });
  const [followUp, setFollowUp] = useState(null);

  useEffect(() => {
    fetch('/api/uscis-receipt-notice-tracker').then((res) => res.json()).then(setData);
  }, []);

  const createFollowUp = async (id) => {
    const res = await fetch('/api/uscis-receipt-notice-tracker/follow-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setFollowUp(await res.json());
  };

  return (
    <div className="page-container">
      <h1>USCIS Receipt Notice Tracker</h1>
      <p>Track filing receipt notices, lockbox delays, and follow-up evidence for immigration cases.</p>
      <div className="dashboard-stats">
        {Object.entries(data.summary).map(([key, value]) => <div className="stat-card" key={key}><span>{key}</span><strong>{value}</strong></div>)}
      </div>
      {data.receipts.map((receipt) => (
        <div className="card" key={receipt.id}>
          <h3>{receipt.id} · {receipt.form}</h3>
          <p>{receipt.client} · filed {receipt.filingDate} · {receipt.status}</p>
          <button onClick={() => createFollowUp(receipt.id)}>Create follow-up</button>
        </div>
      ))}
      {followUp && <pre className="card">{JSON.stringify(followUp, null, 2)}</pre>}
    </div>
  );
}
