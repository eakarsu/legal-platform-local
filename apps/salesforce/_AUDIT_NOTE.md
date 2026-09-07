# Audit Note - smallLawFirm_salesforce

Source: `_AUDIT/reports/batch_11.md` (lines 1043-1082).

## Original Audit Recommendations

### Missing AI Counterparts
- `/deadline-predictor` for statute of limitations.
- `/conflict-checker` for adverse party detection.
- `/opponent-analysis` for opposing counsel research.

### Missing Non-AI Features
- E-signature workflow.
- IMAP archival for email.
- CLE tracking.
- Malpractice insurance integration.
- Client satisfaction survey.

### Custom Feature Suggestions
1. Agentic Case Preparation.
2. Intake Chatbot + Document Assembly.
3. Billing Intelligence.
4. Multi-Jurisdiction Compliance.
5. Client Portal & Self-Service.
6. Public Markdown Website Generator.

## Implementations Applied

Added 2 helper functions in `src/lib/ai.ts` and 2 Next.js API routes following the existing per-route pattern (`getServerSession`, `OPENROUTER_API_KEY` 503 fallback, `NextResponse.json`):
- `POST /api/ai/deadline-predictor`
- `POST /api/ai/conflict-checker`

Both helpers reuse the project's `getOpenAIClient()` (OpenRouter via OpenAI SDK) and `extractJSON()` parser. JSON-strict outputs with structured fallback. No new dependencies.

## Backlog (Prioritized)

### High
- E-signature integration (DocuSign).
- Client portal & self-service.
- `/opponent-analysis` (research workflow design needed).

### Medium
- IMAP email archival.
- CLE tracking.
- Multi-jurisdiction compliance monitor.

### Low / Product Decisions
- Malpractice insurance integration.
- Public markdown website generator.
- Agentic case-preparation orchestration.

## Apply pass 3 (frontend)

FE already wired. `src/app/(dashboard)/ai/conflict-checker/page.tsx` and `src/app/(dashboard)/ai/deadline-predictor/page.tsx` POST to `/api/ai/conflict-checker` and `/api/ai/deadline-predictor` respectively. The Next.js App Router routes (under the `(dashboard)` group) are auto-registered by file convention; the corresponding API routes also already exist. No FE changes required.

## Apply pass 4 (mechanical backlog)

Implemented the High-priority backlog item flagged "research workflow design needed":

- `analyzeOpponent` helper in `src/lib/ai.ts` reuses `getOpenAIClient()` (OpenRouter via OpenAI SDK), strict-JSON output through `extractJSON`, with a structured fallback. Output covers attorney profile, litigation style, known tactics, strengths/weaknesses, notable cases, strategic recommendations, watchpoints, and notes (with explicit caveat that this is preliminary intelligence, not a substitute for direct background research).
- `POST /api/ai/opponent-analysis` (`src/app/api/ai/opponent-analysis/route.ts`) follows the existing per-route pattern: `getServerSession`, 401 on no session, 400 on missing `opposingCounselName`, 503 on `OPENROUTER_API_KEY` missing, otherwise delegates to `analyzeOpponent`.
- `src/app/(dashboard)/ai/opponent-analysis/page.tsx` is a client page using existing shadcn UI primitives (`Card`, `Input`, `Textarea`, `Button`, `Badge`, lucide icons) with explicit 503 handling that surfaces the AI-not-configured message. Auto-registered by App Router file convention.

`tsc --noEmit -p tsconfig.json` passes. No new dependencies.

## Apply pass 5 (all backlog)

Implemented two MECHANICAL backlog items (multi-jurisdiction compliance, billing intelligence) and made the existing AI pages discoverable from the sidebar.

- `src/lib/ai.ts` — added `checkMultiJurisdictionCompliance` and `analyzeBillingIntelligence` helpers using the existing `getOpenAIClient()` (OpenRouter via OpenAI SDK), strict-JSON output through `extractJSON`, with structured fallbacks. The compliance helper covers RPC flags, UPL risks, cross-jurisdiction conflicts, recommended steps, and pro hac vice considerations. The billing helper computes realization/collection signals, trend commentary, risk flags, top opportunities, and matter-level insights.
- `src/app/api/ai/multi-jurisdiction-compliance/route.ts`, `src/app/api/ai/billing-intelligence/route.ts` — Next.js routes following the existing per-route pattern: `getServerSession`, 401 on no session, 400 on missing required fields (compliance), and 503 `code: AI_NOT_CONFIGURED` when `OPENROUTER_API_KEY` is unset.
- `src/app/(dashboard)/ai/multi-jurisdiction-compliance/page.tsx`, `src/app/(dashboard)/ai/billing-intelligence/page.tsx` — client pages using the existing shadcn primitives (Card, Input, Textarea, Button, Badge, Label) with explicit 503 handling that surfaces the AI-not-configured message.
- `src/components/layout/Sidebar.tsx` — surfaced the existing `/ai/opponent-analysis` (added in pass 4 but never linked) plus the two new pages.

`tsc --noEmit -p tsconfig.json` passes. No new dependencies.

Smoke-tested: `next dev` booted on alt port 3091, NextAuth credentials login OK with `john.smith@smithlaw.com / password123`. With key set, the new endpoints attempted upstream OpenRouter (which returned 429 rate-limited — provider state, not our code). With `OPENROUTER_API_KEY=""` both endpoints returned `HTTP 503 { code: "AI_NOT_CONFIGURED" }` as designed.

Remaining backlog: DocuSign e-signature, IMAP archival, CLE tracking, malpractice integration, public website generator, full agentic case-prep — all NEEDS-CREDS / NEEDS-PRODUCT-DECISION / TOO-RISKY.
