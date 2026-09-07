const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/documents/:id/pdf
router.get('/:id/pdf', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, t.user_id FROM documents d JOIN tenancies t ON d.tenancy_id = t.id WHERE d.id=$1 AND t.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });

    const doc = result.rows[0];
    const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;

    const PDFDocument = require('pdfkit');
    const pdf = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="document-${doc.id}.pdf"`);
    pdf.pipe(res);

    const title = content.notice_title || content.title || doc.doc_type;
    pdf.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    pdf.moveDown();

    if (content.content) {
      pdf.fontSize(12).font('Helvetica').text(content.content, { lineGap: 4 });
      pdf.moveDown();
    }
    if (content.statutory_basis) {
      pdf.font('Helvetica-Bold').text('Statutory Basis:');
      pdf.font('Helvetica').text(content.statutory_basis);
      pdf.moveDown();
    }
    if (content.draft_answer) {
      pdf.font('Helvetica-Bold').text('Draft Answer:');
      pdf.font('Helvetica').text(content.draft_answer);
    }

    pdf.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

module.exports = router;
