# Audit Note — AITenantRightsAdvisor

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_08.md` (section 16).

## Original Recommendations

### Missing AI Counterparts
- AI-driven case outcome prediction
- Local law variation adaptation

### Missing Non-AI Features
- Local legal resource database
- Local statutes integration
- Form completion helpers
- Live legal expert chat

### Custom Feature Suggestions
- Local law adaptation
- Case outcome prediction
- Resource directory
- Negotiation simulation
- Document assembly

## Implemented (this round)
1. `POST /api/ai/case-outcome` — predict eviction defense / dispute outcome.
2. `POST /api/ai/local-law-lookup` — jurisdiction-specific guidance with statutes/notice periods.

Pattern reused: `callOpenRouter` + `parseAIJson` middleware + `persistResult`. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** Negotiation simulation (LLM role-play) endpoint.
2. **MECHANICAL** Document assembly (form auto-fill) endpoint.
3. **NEEDS-PRODUCT-DECISION** Local legal resource database curation.
4. **NEEDS-CREDS** Live legal expert chat platform.

## Apply pass 3 (frontend)

Verified the React (Vite, JSX) frontend already wires the pass-2 endpoints:

- `/case-outcome` → `CaseOutcome.jsx` calls `api.post('/ai/case-outcome', form)`
- `/local-law-lookup` → `LocalLawLookup.jsx` calls `api.post('/ai/local-law-lookup', form)`

Plus existing dedicated pages for the per-tenancy AI helpers (`LeaseAnalyzer.jsx`, `NoticeGenerator.jsx`, `EvictionDefense.jsx`, `RentIncreaseCheck.jsx`, `MediationPrep.jsx`). All routes registered in `App.jsx`. Backend `routes/ai.js` registered at `/api/ai` in `server.js`. **Action: LEFT-AS-IS — FE already wired.**

## Apply pass 4 (mechanical backlog)

Implemented both MECHANICAL backlog items end-to-end (BE + FE).

### Backend — appended to `backend/routes/ai.js`
- `POST /api/ai/negotiation-simulator` — LLM role-play of a landlord-tenant negotiation. Body: `{ topic, tenant_position, landlord_stance?, jurisdiction?, history? }`. Returns JSON with exchanges, tactics, coaching, likely outcome.
- `POST /api/ai/document-assembly` — auto-fill tenant documents (e.g., demand_letter_for_repairs, security_deposit_demand). Body: `{ document_type, tenant_info?, landlord_info?, jurisdiction?, facts?, tenancy_id? }`. Optionally attaches the assembled document to a tenancy when `tenancy_id` belongs to the requester.

Pattern reused: `callOpenRouter` + `parseAIJson` + `persistResult`. Both return **HTTP 503** when `OPENROUTER_API_KEY` is missing. `node --check` passed.

### Frontend
- New page: `frontend/src/pages/NegotiationSimulator.jsx` (route `/negotiation-simulator`).
- New page: `frontend/src/pages/DocumentAssembly.jsx` (route `/document-assembly`).
- Both routes registered in `frontend/src/App.jsx` under `<PrivateRoute>`. Match the existing green/white card styling of `CaseOutcome.jsx` / `LocalLawLookup.jsx` and reuse the `api.js` axios instance (JWT bearer via existing interceptor). 503 surfaced as `AI service unavailable (503): ...`. JSX syntax-checked with `@babel/parser`.

No schema changes, no new dependencies. Remaining backlog: NEEDS-PRODUCT-DECISION (legal resource DB curation) and NEEDS-CREDS (live legal expert chat).

## Apply pass 5 (all backlog)

Closed remaining backlog: legal resource directory (PRODUCT-DECISION) +
live legal expert chat (NEEDS-CREDS).

### Backend — appended to `backend/routes/ai.js`
- `GET /api/ai/legal-resource-directory?state=&category=` — PRODUCT-DECISION: in-memory curated stub. US federal block (HUD, LSC) always included; per-state blocks for the 10 largest US states with at least `legal_aid` entries; fields: `name`, `phone?`, `url`. Endpoint advisory only.
- `POST /api/ai/legal-expert-chat` — NEEDS-CREDS: `LEGAL_EXPERT_CHAT_API_KEY` (and `LEGAL_EXPERT_CHAT_BASE_URL` optional). Returns HTTP 503 with `missing: LEGAL_EXPERT_CHAT_API_KEY` when unset.

### Frontend
- New page `frontend/src/pages/LegalResourceDirectory.jsx` (route `/legal-resource-directory`).
- New page `frontend/src/pages/LegalExpertChat.jsx` (route `/legal-expert-chat`).
- Both routes registered in `frontend/src/App.jsx` under `<PrivateRoute>`. Match the existing green/white card styling and reuse the `api.js` axios instance. 503 errors surface the `missing` env var name in the UI.

### Verification
- `node --check backend/routes/ai.js` passes.
- Module load registers 12 routes.
- `@babel/parser` parses both new pages and `App.jsx` clean.
