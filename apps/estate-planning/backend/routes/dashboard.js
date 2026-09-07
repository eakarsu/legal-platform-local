const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const [wills, assets, beneficiaries, documents, properties, policies, trusts, tasks, timeline] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM wills WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(value_estimate), 0) as total_value FROM digital_assets WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count FROM beneficiaries WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count FROM documents WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(estimated_value), 0) as total_value FROM properties WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(coverage_amount), 0) as total_coverage FROM insurance_policies WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count FROM trusts WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM executor_tasks WHERE user_id = $1", [userId]),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed FROM estate_timeline WHERE user_id = $1", [userId]),
    ]);

    res.json({
      wills: parseInt(wills.rows[0].count),
      digital_assets: { count: parseInt(assets.rows[0].count), total_value: parseFloat(assets.rows[0].total_value) },
      beneficiaries: parseInt(beneficiaries.rows[0].count),
      documents: parseInt(documents.rows[0].count),
      properties: { count: parseInt(properties.rows[0].count), total_value: parseFloat(properties.rows[0].total_value) },
      insurance: { count: parseInt(policies.rows[0].count), total_coverage: parseFloat(policies.rows[0].total_coverage) },
      trusts: parseInt(trusts.rows[0].count),
      executor_tasks: { total: parseInt(tasks.rows[0].total), completed: parseInt(tasks.rows[0].completed) },
      timeline: { total: parseInt(timeline.rows[0].total), completed: parseInt(timeline.rows[0].completed) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
