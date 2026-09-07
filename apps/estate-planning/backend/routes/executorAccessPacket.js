const express = require('express');

const router = express.Router();

const packets = [
  { id: 1, executor: 'Dana Lee', packet: 'Primary executor packet', documents: 8, missing: ['bank contact letter'], readiness: 86 },
  { id: 2, executor: 'Morgan Shah', packet: 'Digital asset access packet', documents: 5, missing: ['password vault delegate'], readiness: 72 },
  { id: 3, executor: 'Chris Allen', packet: 'Healthcare directive packet', documents: 6, missing: [], readiness: 100 },
];

router.get('/', (req, res) => {
  res.json({
    summary: {
      packetCount: packets.length,
      completePackets: packets.filter((item) => item.missing.length === 0).length,
      avgReadiness: Math.round(packets.reduce((sum, item) => sum + item.readiness, 0) / packets.length),
    },
    packets,
  });
});

router.post('/assemble', (req, res) => {
  const packet = packets.find((item) => item.id === Number(req.body?.id)) || packets[0];
  res.json({
    packetId: packet.id,
    assemblyStatus: packet.missing.length ? 'blocked by missing items' : 'ready to release',
    checklist: ['Confirm executor identity', 'Bundle legal documents', 'Attach account access instructions', ...packet.missing],
  });
});

module.exports = router;
