# Audit Apply Notes — AIImmigrationCaseManager

## Source
`/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` section 29.

## Original Recommendations (AI Counterparts)
- `/visa-category-recommendation`
- `/interview-preparation`

## Implemented (this pass)
Two endpoints appended to `backend/src/routes/ai.js`, following the existing pattern (auth + aiRateLimiter, `callOpenRouter`, `parseJSON`):

- `POST /api/ai/visa-category-recommendation` — accepts either `client_id` or inline `profile`; returns ranked visa categories with feasibility, evidence to gather, timeline, cost ranges, and a non-legal-advice disclaimer.
- `POST /api/ai/interview-preparation` — accepts `case_id`, `interview_type`, optional `focus_areas`; returns expected topics, practice questions with model answers, documents checklist, behavioral coaching, mock interview plan.

Both responses are returned as `{ structured, raw }` matching the pattern of every other AI endpoint in the file. Disclaimers are baked into prompts.

Syntax: `node --check` passes.

## Backlog (Custom Feature Suggestions)
- Agentic case manager (workflow + reminders + auto-doc).
- Immigration pathway optimizer (deeper than `/visa-category-recommendation`).
- USCIS RFE assistant (needs USCIS tracking integration — NEEDS-CREDS).
- Multilingual document support (translation already covered; auto-detect could be added).
- Peer case analytics (NEEDS-PRODUCT-DECISION on data anonymization).

## Categorization
- MECHANICAL: 2 endpoints (done — exhausts the audit's missing list).
- NEEDS-CREDS: USCIS / government integrations.
- NEEDS-PRODUCT-DECISION: client portal scope, data anonymization for peer analytics.

## Apply pass 3 (frontend)

LEFT-AS-IS. The CRA-style React frontend already wires every backend AI endpoint:
- `frontend/src/pages/AIFeatures.js` covers 9 endpoints (case-assessment, document-analysis, legal-research, form-assist, translate, compliance-check, status-prediction, document-ocr [FormData with JWT bearer], deadline-predict) with structured renderers and toast-based 503/429 handling.
- `frontend/src/pages/AdvancedAITools.js` covers the two pass-2 additions (`visa-category-recommendation`, `interview-preparation`) with select/textarea inputs and structured/raw display.
- Both routes (`/ai`, `/advanced-ai`) are registered in `frontend/src/App.js`.
- JWT bearer is attached via the shared `services/api` axios client (token from `localStorage`).

No FE files modified. Idempotent.

## Apply pass 4 (mechanical backlog)

LEFT-AS-IS. The backend now exposes 14 `/api/ai/*` routes, including the previously-listed mechanical backlog items now wired end-to-end: `/agentic-case-manager`, `/pathway-optimizer`, `/auto-detect-language` (all gated by `requireAIKey` → 503-on-no-key) with FE coverage in `AdvancedAITools.js`. Remaining audit-note backlog items are non-mechanical: USCIS RFE assistant (NEEDS-CREDS — USCIS tracking integration), peer case analytics (NEEDS-PRODUCT-DECISION — anonymization scope), client portal scope (NEEDS-PRODUCT-DECISION). No files modified.
