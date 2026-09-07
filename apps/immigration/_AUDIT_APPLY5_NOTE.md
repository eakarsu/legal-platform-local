# Apply Pass 5 — AIImmigrationCaseManager

**Date:** 2026-05-08
**Project:** AIImmigrationCaseManager
**Stack:** Node-Express + React, Postgres `pg` pool, JWT bearer auth (`auth`
middleware in `backend/src/middleware/auth.js`), audit logging on all
mutating routes.
**Audit source:** `/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` §29

## Verified-present (no changes)

Pass 1-4 already implemented all 14 audit-relevant AI endpoints:
- `/case-assessment`, `/document-analysis`, `/legal-research`, `/form-assist`,
  `/translate`, `/compliance-check`, `/status-prediction`, `/document-ocr`,
  `/deadline-predict`, `/visa-category-recommendation` (pass 2),
  `/interview-preparation` (pass 2), `/agentic-case-manager`,
  `/pathway-optimizer`, `/auto-detect-language` (pass 4).
- `requireAIKey` 503-on-no-key gate on all AI endpoints.
- Frontend `AIFeatures.js` + `AdvancedAITools.js` cover every backend route.

## Implemented this pass (5 items — at cap)

1. `GET  /api/integrations/uscis/case-status/:receipt` — 503-on-no-key.
2. `POST /api/integrations/stripe/charge` — 503-on-no-key.
3. `POST /api/integrations/docusign/envelope` — 503-on-no-key.
4. `POST /api/integrations/translation/external` — 503-on-no-key (DeepL/
   Google/AWS Translate; complements existing LLM `/api/ai/translate`).
5. `GET  /api/calendar/deadlines.ics` — mechanical RFC 5545 ICS feed of the
   caller's upcoming case deadlines (configurable horizon, defaults 90 days).

Files written:
- `backend/src/routes/integrations.js` (new)
- `backend/src/routes/calendar.js` (new)
- `backend/src/server.js` (added 2 `app.use(...)` lines — additive only)
- `_BACKLOG_NEEDS_CREDS.md` (new)

Legal disclaimer preserved on integration payloads.

## Categorization of remaining backlog

- **NEEDS-CREDS (stubbed):** USCIS, Stripe, DocuSign, external translation.
- **MECHANICAL (implemented):** ICS calendar feed.
- **NEEDS-PRODUCT-DECISION:** client portal, peer analytics anonymization,
  document vault encryption strategy.
- **TOO-RISKY without product decisions:** agentic case manager autonomy.

## Smoke test outcome

`node --check` passes for all 3 modified/new files. ICS export properly
escapes special characters (`;`, `,`, `\n`) per RFC 5545.

## Cap

5 / 5.
