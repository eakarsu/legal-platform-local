const express = require('express');

const router = express.Router();

const judgments = [
  { id: 'SC-441', debtor: 'North Bay Repair', amount: 2400, daysSinceJudgment: 12, nextStep: 'send payment demand', status: 'demand pending' },
  { id: 'SC-442', debtor: 'L. Morales', amount: 875, daysSinceJudgment: 34, nextStep: 'prepare wage garnishment packet', status: 'eligible for enforcement' },
  { id: 'SC-443', debtor: 'Ridge LLC', amount: 5100, daysSinceJudgment: 6, nextStep: 'wait for appeal window', status: 'appeal window open' },
];

router.get('/', (req, res) => {
  res.json({
    summary: {
      openJudgments: judgments.length,
      collectibleAmount: judgments.reduce((sum, item) => sum + item.amount, 0),
      enforcementReady: judgments.filter((item) => item.status === 'eligible for enforcement').length,
    },
    judgments,
  });
});

router.post('/next-step', (req, res) => {
  const judgment = judgments.find((item) => item.id === req.body?.id) || judgments[0];
  res.json({
    id: judgment.id,
    recommendation: judgment.nextStep,
    packet: ['certified judgment copy', 'debtor address verification', 'court fee estimate'],
  });
});

module.exports = router;
