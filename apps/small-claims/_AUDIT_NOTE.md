# Audit Note — AISmallClaimsCourtGuide

## Original audit recommendations (batch_07.md §31)

**Missing AI endpoints:** `/evidence-organizer`, `/witness-statement-guide`, `/settlement-calculator`, `/court-procedure-checklist`, `/appeal-assessment`.

**Missing non-AI features:** case tracking, document repository, fee schedule lookup, statute of limitations checker, legal citation library, court e-filing integration.

**Custom suggestions:** case evaluation & settlement, jurisdiction-specific playbook, evidence presentation optimizer, opponent research, pro-se coaching, post-judgment collection guidance.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/evidence-organizer` — exhibits ordering, authentication tips, hearsay/objection warnings, gap finder.
2. `POST /api/ai/settlement-calculator` — informational settlement range with explicit disclaimer.
3. `POST /api/ai/court-procedure-checklist` — jurisdiction-specific checklist (filing → service → hearing → post-judgment) with high-variation flags.

All three reuse `callOpenRouter`, `parseAIJson`, `persistResult`, `authMiddleware`, `aiRateLimiter`. Each prompt asks the model to embed a `disclaimer` in the JSON to make legal-information context explicit. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/witness-statement-guide` (mechanical follow-up).
2. `POST /api/ai/appeal-assessment` (mechanical follow-up).
3. Statute-of-limitations checker (mechanical, NEEDS data table).
4. Court e-filing integration (NEEDS-CREDS — state/county systems, varies).
5. Fee schedule lookup (mechanical follow-up + data sourcing).

## Apply pass 3 (frontend)

- **Action:** LEFT-AS-IS — frontend already wired.
- `frontend/src/pages/EvidenceOrganizer.jsx`, `SettlementCalculator.jsx`, `CourtProcedureChecklist.jsx` each call the matching apply2 endpoint via shared `api.js` axios client (JWT Bearer from localStorage).
- Routes registered in `frontend/src/App.jsx` at both `/cases/:id/...` and top-level paths (PrivateRoute-protected).
- Pages surface the `disclaimer` field where present and handle errors via `error.response?.data?.error` (covers 503 no-key).
- See `_AUDIT/apply3_logs/ab3_82.md`.

## Apply pass 4 (mechanical backlog)

- **Action:** VERIFIED-EXISTING — both eligible mechanical backlog items had already been implemented.
- Endpoints: `POST /api/ai/witness-statement-guide`, `POST /api/ai/appeal-assessment` in `backend/routes/ai.js` (lines 375-432) reusing `callOpenRouter`, `parseAIJson`, `persistResult`, `authMiddleware`, `aiRateLimiter`, with `ensureKey(res)` 503 guard.
- FE: `frontend/src/pages/WitnessStatementGuide.jsx` and `AppealAssessment.jsx` use shared `api.js` axios (JWT Bearer from localStorage). Routes registered at both `/cases/:id/...` and top-level in `frontend/src/App.jsx` under `PrivateRoute`. Errors surface `error.response?.data?.error`; disclaimer rendered when present.
- Statute-of-limitations checker and fee-schedule lookup remain backlog (NEEDS-PRODUCT-DECISION on data sourcing).
- Syntax: `node --check` PASS. No new deps.
- See `_AUDIT/apply4_logs/ab3_82.md`.
