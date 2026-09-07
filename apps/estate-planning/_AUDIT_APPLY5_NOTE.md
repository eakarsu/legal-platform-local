# Apply Pass 5 wave-1 — AIEstatePlanningDigitalLegacy

- **Date:** 2026-05-08
- **Project:** AIEstatePlanningDigitalLegacy
- **Stack:** Node.js + Express, PostgreSQL, React (CRA frontend, react-markdown).
- **Audit source:** `_AUDIT/reports/batch_03.md` § 19.

## Verified-present (from prior passes)

- 9 original AI endpoints in `routes/ai.js` (will-draft, estate-advice, generate-poa, trust-plan, healthcare-directive, enhance-message, analyze-assets, estate-summary, history).
- 3 endpoints in `routes/aiNew.js` (beneficiary-access-report, legacy-message-schedule, estate-timeline-advisor) — pass 2.
- 2 endpoints in `routes/aiNew.js` (tax-minimize, beneficiary-analyze) — pass 4. Together with `routes/extensions.js`'s `/ai/account-consolidate`, all 3 audit "missing AI counterparts" are present.
- `routes/extensions.js` (pass 5 of pass-4 doc): vault upload/list, multistate-summary, ltc/project, ltc-advisory, family-meeting-agenda, beneficiary-portal, intl/jurisdictions, intl-treaty-summary.
- FE: `pages/AIReports.js` already wires 5 of these endpoints; `Extensions.js` covers vault, LTC, multistate, etc.

## Implemented this pass (2 features, MECHANICAL)

| # | Item | File | Endpoint |
|---|------|------|----------|
| 1 | Agentic estate plan (multi-phase synthesizer) | `backend/routes/aiNew2.js` | `POST /api/ai/agentic-plan` |
| 2 | Digital vault audit (orphan accounts + access risks) | `backend/routes/aiNew2.js` | `POST /api/ai/digital-vault-audit` |

Both:
- Pull authenticated user data from `wills`, `beneficiaries`, `properties`, `insurance_policies`, `trusts`, `digital_assets`, `documents`, `digital_accounts` (read-only).
- Reuse existing `callOpenRouter` and `aiRateLimiter`.
- Return **HTTP 503** when `OPENROUTER_API_KEY` is missing.
- Mounted in `server.js` immediately after `aiNewRoutes` so they share the `/api/ai` prefix and `authenticateToken` middleware.
- Include explicit legal disclaimers in the JSON shape ("planning aid only — not legal advice").
- `agentic-plan` persists into `ai_analyses` if the table exists; tolerant of missing table.

**Frontend:**
- `pages/AIReports.js` — added two new tabs (`Agentic Estate Plan`, `Digital Vault Audit`) in the existing `REPORTS` array. The page already detects 503 and renders friendly messages.

## Deferred backlog

| Item | Category | Reason |
|------|----------|--------|
| Document vault encryption-at-rest (envelope/KMS) | NEEDS-PRODUCT-DECISION | Crypto provider + key rotation strategy required. |
| Multi-state legal compliance content | NEEDS-CREDS | Practical Law / Cleer Estate licensing. |
| Long-term care actuarial modeling | TOO-RISKY | Needs disclaimers + actuarial inputs; existing `/ai/ltc-advisory` is a planning aid only. |
| Beneficiary post-death portal | verified-present | `extensions.js` already has `/beneficiary-portal/*`. |
| International tax planning | verified-present | `/ai/intl-treaty-summary` already exists. |

## Files changed

- `backend/server.js` (+2 lines: mount `aiNew2`)
- `backend/routes/aiNew2.js` (NEW, ~150 lines)
- `frontend/src/pages/AIReports.js` (+14 lines, two new REPORT entries)

## Smoke test

- `node --check backend/server.js` -> OK.
- `node --check backend/routes/aiNew2.js` -> OK.
- `@babel/parser` (jsx) parse on `AIReports.js` -> OK.
- 503-on-no-key contract matches existing `aiNew.js`.
