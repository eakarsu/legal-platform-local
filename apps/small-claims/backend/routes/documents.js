const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/documents/:id/pdf
router.get('/:id/pdf', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, c.user_id FROM documents d JOIN cases c ON d.case_id = c.id WHERE d.id=$1 AND c.user_id=$2`,
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

    pdf.fontSize(18).font('Helvetica-Bold').text(content.title || doc.doc_type, { align: 'center' });
    pdf.moveDown();

    if (content.plaintiff_statement) {
      pdf.fontSize(12).font('Helvetica-Bold').text('Plaintiff:');
      pdf.font('Helvetica').text(content.plaintiff_statement);
      pdf.moveDown();
    }
    if (content.defendant_info) {
      pdf.font('Helvetica-Bold').text('Defendant:');
      pdf.font('Helvetica').text(content.defendant_info);
      pdf.moveDown();
    }
    if (content.claim_description) {
      pdf.font('Helvetica-Bold').text('Claim:');
      pdf.font('Helvetica').text(content.claim_description);
      pdf.moveDown();
    }
    if (content.relief_sought) {
      pdf.font('Helvetica-Bold').text('Relief Sought:');
      pdf.font('Helvetica').text(content.relief_sought);
      pdf.moveDown();
    }
    if (content.body) {
      pdf.font('Helvetica').text(content.body);
    }

    pdf.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

module.exports = router;
