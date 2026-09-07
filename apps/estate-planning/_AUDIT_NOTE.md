# Audit Notes — AIEstatePlanningDigitalLegacy

Audit source: `_AUDIT/reports/batch_03.md` § 19 (partial-build, 9 AI endpoints).

## Original audit recommendations

### Missing AI counterparts
- `/tax-minimize` — minimize estate taxes.
- `/beneficiary-analyze` — beneficiary suitability.
- `/account-consolidate` — consolidation recommendations.

### Missing non-AI features
- Document storage (secure vault).
- Beneficiary management.
- Tax planning.
- Lawyer / advisor management.
- Notification system.
- Multi-state compliance.

### Custom feature suggestions
- Agentic estate planner.
- Digital legacy management (passwords, photos, messages).
- AI-drafted state-specific documents.
- Family meeting coordinator.
- Long-term care cost modeling.
- Beneficiary portal post-death.
- International planning.

## Implementations applied this pass

None — already 9 AI endpoints (will-draft, estate-advice, generate-poa,
trust-plan, healthcare-directive, enhance-message, analyze-assets,
estate-summary, history). The remaining recs are dominated by infrastructure
gaps (secure vault, RBAC, multi-state law packs) rather than AI surface gaps.

## Prioritized backlog

1. **MECHANICAL** — Add `/api/ai/tax-minimize` taking asset list and
   returning a state-aware tax-minimization plan.
2. **MECHANICAL** — Add `/api/ai/beneficiary-analyze` taking beneficiary
   list and returning suitability + flags.
3. **NEEDS-PRODUCT-DECISION** — Document vault needs an encryption-at-rest
   design (envelope encryption + KMS).
4. **NEEDS-CREDS** — Multi-state legal compliance content requires a legal
   data partner (Practical Law, Cleer Estate, etc.).
5. **TOO-RISKY** — Long-term care cost modeling requires actuarial inputs
   and disclaimers; needs legal review before exposure.

## Apply pass 4 (mechanical backlog)

- **Action:** UPDATED-BE+FE — implemented the two MECHANICAL backlog
  items (`/tax-minimize`, `/beneficiary-analyze`).
- **Backend:** Appended two routes to `backend/routes/aiNew.js` reusing
  the existing `callOpenRouter` helper and `aiRateLimiter`. Both
  explicit-503 when `OPENROUTER_API_KEY` is missing.
  - `POST /api/ai/tax-minimize` — pulls user
    assets/properties/insurance/trusts + jurisdiction (from `users`
    table), asks the LLM for a jurisdiction-aware estate tax
    minimization plan; returns `{ plan, model, jurisdiction, summary }`.
    404 if the user has no estate data.
  - `POST /api/ai/beneficiary-analyze` — pulls beneficiaries, computes
    share/contact/inactive metrics, asks the LLM for per-beneficiary
    suitability + risk flags; returns `{ analysis, model, summary }`.
    404 if no beneficiaries.
- **Frontend:** `frontend/src/pages/AIReports.js` — added two tabs
  (`Tax Minimization Plan`, `Beneficiary Suitability Analysis`) with
  the existing 503/404 friendly hint logic; header now also shows
  jurisdiction, gross-estate-estimate, and beneficiary metrics.
- **Files modified:**
  - `backend/routes/aiNew.js`
  - `frontend/src/pages/AIReports.js`
- **Syntax check:** PASS (`node --check`, `esbuild --loader:.js=jsx`).
- **Smoke test:** With `OPENROUTER_API_KEY` cleared, both endpoints
  return HTTP 503 with the documented message after JWT login.

## Apply pass 3 (frontend)

- **Stack:** Express + Create-React-App (`frontend/`, axios + react-markdown).
- **Backend AI endpoints:** 9 in `routes/ai.js` (will-draft, estate-advice,
  generate-poa, trust-plan, healthcare-directive, enhance-message,
  analyze-assets, estate-summary, history) plus 3 in `routes/aiNew.js`
  (beneficiary-access-report, legacy-message-schedule,
  estate-timeline-advisor).
- **Action:** UPDATED-FE — `routes/ai.js` endpoints were already wired via
  `App.js` features and `AIAdvisor`, but the three `aiNew.js` endpoints had
  no entrypoint. Added `pages/AIReports.js` (tabbed page hitting all three),
  registered `/ai-reports` route in `App.js`, and added a sidebar link.
- **Files written/modified:**
  - `frontend/src/pages/AIReports.js` (new)
  - `frontend/src/App.js` (import, route, sidebar link)
- **Syntax check:** PASS (esbuild loader=jsx).
- **Notes:** Endpoints take no body — they query the authenticated user's
  data. 503 (no key) and 404 (no data) are surfaced with friendly hints.
  Auth handled by existing `services/api.js` axios interceptor (Bearer
  from `localStorage`).

