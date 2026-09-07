# Production readiness

The governed API at `/api/governance` is the supported tenant-rights matter path. It preserves tenant/matter-scoped cases, authoritative-source versions, opaque evidence digests, deadlines, accountable review transitions, legal hold events, an idempotent connector outbox, immutable delivery attempts, bounded retries, and dead-letter state. Deterministic assessment returns a review disposition only; it cannot provide legal advice, file, sign, predict an outcome, or contact a party.

## Deployment sequence

1. Have database and legal-domain owners review `backend/migrations/001_governed_tenant_matter.sql`; back up and apply it as a separate controlled migration.
2. Copy `.env.example` to `.env`, replace placeholders, and configure a unique 32-plus-character JWT secret and explicit production CORS allowlist.
3. Install locked dependencies explicitly. `start.sh` does not initialize schema, seed data, install packages, or kill unrelated processes.
4. Provision matter memberships and reviewed workers for trusted sources, registries, filing/e-signature, matter/document, identity, and notification connectors. Payloads contain opaque references, not privileged document content.

Production rejects legacy provider routes, mock/demo flags, wildcard CORS, weak secrets, and startup schema bootstrap. The conversational/gap routes remain quarantined by default.

## Required external validation

Qualified counsel must review jurisdiction sources, effective dates, retention, privilege, redaction, legal-hold, deadline, disclaimer, and escalation policies. Test conflicting sources, adverse cases, replayed delivery receipts, retry exhaustion, and dead-letter recovery on reviewed fixtures. This system is not a lawyer and this repository-only work is not legal validation or deployment approval.
