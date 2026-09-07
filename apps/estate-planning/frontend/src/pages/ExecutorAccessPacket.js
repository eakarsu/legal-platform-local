import React, { useEffect, useState } from 'react';

export default function ExecutorAccessPacket() {
  const [data, setData] = useState({ summary: {}, packets: [] });
  const [assembly, setAssembly] = useState(null);

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    fetch('/api/executor-access-packet', { headers: headers() }).then((res) => res.json()).then(setData);
  }, []);

  const assemble = async (id) => {
    const res = await fetch('/api/executor-access-packet/assemble', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ id }),
    });
    setAssembly(await res.json());
  };

  return (
    <div className="page">
      <h1>Executor Access Packet</h1>
      <p>Assemble executor-ready document bundles, access instructions, and missing-item checklists.</p>
      <div className="stats-grid">
        {Object.entries(data.summary).map(([key, value]) => <div className="stat-card" key={key}><span>{key}</span><strong>{value}</strong></div>)}
      </div>
      {data.packets.map((packet) => (
        <div className="card" key={packet.id}>
          <h3>{packet.packet}</h3>
          <p>{packet.executor} · {packet.documents} documents · {packet.readiness}% ready</p>
          <p>Missing: {packet.missing.length ? packet.missing.join(', ') : 'none'}</p>
          <button className="btn btn-primary" onClick={() => assemble(packet.id)}>Assemble packet</button>
        </div>
      ))}
      {assembly && <pre className="card">{JSON.stringify(assembly, null, 2)}</pre>}
    </div>
  );
}
