const express = require('express');
const pool = require('../db');

function createCrudRouter(tableName, columns) {
  const router = express.Router();

  // GET all
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const fields = columns.filter(c => req.body[c] !== undefined);
      const values = fields.map(f => req.body[f]);
      const placeholders = fields.map((_, i) => `$${i + 2}`).join(', ');
      const fieldNames = fields.join(', ');

      const result = await pool.query(
        `INSERT INTO ${tableName} (user_id, ${fieldNames}) VALUES ($1, ${placeholders}) RETURNING *`,
        [req.user.id, ...values]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const fields = columns.filter(c => req.body[c] !== undefined);
      const values = fields.map(f => req.body[f]);
      const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');

      const result = await pool.query(
        `UPDATE ${tableName} SET ${setClause}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id, ...values]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json({ message: 'Deleted successfully', deleted: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
