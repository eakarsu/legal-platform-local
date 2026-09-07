const express = require('express');

const router = express.Router();

const receipts = [
  { id: 'IOE0912345001', client: 'Nadia Petrova', form: 'I-485', filingDate: '2026-04-28', expectedNoticeDays: 21, status: 'receipt received' },
  { id: 'MSC2690011220', client: 'Ravi Kumar', form: 'I-765', filingDate: '2026-05-03', expectedNoticeDays: 19, status: 'watchlist' },
  { id: 'LIN2617784431', client: 'Elena Garcia', form: 'I-130', filingDate: '2026-05-10', expectedNoticeDays: 12, status: 'pending lockbox' },
];

router.get('/', (req, res) => {
  res.json({
    summary: {
      trackedReceipts: receipts.length,
      watchlist: receipts.filter((item) => item.status === 'watchlist').length,
      pendingLockbox: receipts.filter((item) => item.status === 'pending lockbox').length,
    },
    receipts,
  });
});

router.post('/follow-up', (req, res) => {
  const receipt = receipts.find((item) => item.id === req.body?.id) || receipts[0];
  res.json({
    receiptId: receipt.id,
    followUp: receipt.status === 'receipt received' ? 'verify notice uploaded to client portal' : 'prepare lockbox support inquiry',
    evidence: ['delivery proof', 'fee receipt', 'filed form copy'],
  });
});

module.exports = router;
