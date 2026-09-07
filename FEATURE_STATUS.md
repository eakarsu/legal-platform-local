# Merged feature status

Updated 2026-09-07. Active app: `hub/`; active feature registry: `config/merged-features.json`.

| Capability | Status | Evidence / limits |
| --- | --- | --- |
| Feature-based merge of all ten source apps | Implemented at shared workspace layer | 581 inspected source route/panel entries mapped to 139 canonical feature pages; no unmapped entries in the inventory |
| One sidebar link for every canonical feature | Implemented | Stable `/features/<id>` pages; searchable practice groups; no source-app launch links in the main workflow |
| Duplicate common features removed from active navigation and record implementation | Implemented | One Clients, Matters, Billing, Documents, Time and Research feature; shared handlers and store |
| Shared client/matter data across specialties | Implemented and tested | Foreign-key relationships reference the same client/matter records |
| Tenant rights and contract extension | Implemented at workspace layer | Three additional source snapshots; 26 unique feature pages; repeated contract workflows consolidated |
| Shared contract/tenancy links | Implemented and tested | Validated selectors, backlinks, parent deletion protection and linked context for AI drafts |
| Native feature records | Implemented | Create, edit, delete, search, status filters, field validation, optimistic revision checks and CSV export |
| Domain-specific forms | Implemented as records | Family and estate source metadata plus explicit forms for other canonical features; not full original workflow parity |
| Attachments and draft history | Implemented | Local PDF/text/image attachments up to 2 MB; stored drafts; sample files included |
| AI drafting | Implemented, mocked-provider tests | Selected-record context, shared provider client, timeout/rate controls, review drafts; live provider unverified |
| Reports and activity history | Implemented | Live aggregates and automatic audit records from shared data |
| At least 15 records per feature table | Implemented | 2,055 fictional records across 137 editable tables; reports and audit views derive from these records |
| Safe repeatable sample seeding | Implemented and tested | Top-up without overwriting existing rows; no provider calls; default startup seeds unless disabled |
| Port cleanup before startup | Implemented and tested | Selected startup ports; SIGTERM then SIGKILL for remaining original listeners |
| Original source apps and data preserved | Implemented | Source copies retained; original repositories and databases unchanged |
| Production provider integrations | Remaining | Merged pages for payments, portals, signatures, OCR, transcription and filing prepare requests only; clearly marked unconnected |
| Full advanced business-rule parity | Remaining | Specialized calculators, automation, external research retrieval and provider-specific operations still need migration/validation beyond shared records and drafts |
| Original account/data migration and multi-tenant authentication | Remaining | New local single-user data store; original accounts/business databases were not imported |
| Production hosting | Not performed | Local application only |

See `reports/seed-verification.json`, `reports/browser-verification.json`, `reports/feature-merge-coverage.json` and `reports/optimization-audit.json` for measured results. Source route coverage does not imply every original provider or business rule is fully migrated.

## Floating Ask AI assistant

Implemented for this local workspace at `/Users/erolakarsu/projects/legal-platform`. Use the bottom-right **Ask AI** button on any page, **Ask AI about item** beside a table row or in a record view, or **Use current item** inside the assistant.

The assistant accepts general questions and questions about the current page or an explicitly selected record. It supports formatted answers and tables, follow-up questions, saved conversations, copy, and Markdown download. Draft questions and conversations stay intact while navigating. The last saved conversation restores after reload in the same browser tab.

Page metadata is included automatically. Only selected record fields and notes are included; attachments are not read. Earlier messages remain in context until **New chat** is selected. The assistant prepares answers and drafts; it does not execute record changes or external actions. Questions allow up to 5,000 words, with a response budget of up to 5,000 words and a three-minute provider timeout. Actual response length depends on the question and provider.

Provider settings are loaded from this app’s private, ignored `.env`. The local app runs at http://127.0.0.1:43100 after `./start.sh`.

Validation: 24 automated tests passed, including existing record, relationship, attachment, source registry and startup tests. Browser checks passed for record selection, navigation, saved history/reload, follow-ups, new-chat isolation, error recovery, word limits, keyboard controls, mobile layout and attachment refresh. A real AI request with fictional selected-item context also passed in a temporary database.

Evidence: [browser checks](reports/floating-ai-verification.json) and [live provider check](reports/floating-ai-live.json). Run `npm test` and `npm run test:floating-ai` to repeat automated checks.
