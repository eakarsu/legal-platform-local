# Legal Platform — merged feature workspace

One local application with **139 feature pages**, one sidebar and one shared data store. The ten source applications' repeated features are mapped to canonical screens: Clients, Matters, Billing, Documents, Time Tracking, Research and other common functions appear once. Family law, estate, immigration, small-claims, tenant-rights and contract workflows retain their own domain fields.

```sh
cd /Users/erolakarsu/projects/legal-platform
./start.sh
```

Open **http://localhost:43100**. Node 22.13+ is required; no npm installation, PostgreSQL database or separate app server is needed for the merged workspace.

Startup clears its selected port and fills each editable feature table to at least **15 records**. Existing records are preserved. To skip the sample-data top-up, use `SEED_DEMO_DATA=0 ./start.sh`. To use another port, prefix the command with `HUB_PORT=43101`.

## Feature merging

- `config/merged-features.json` is the sole active feature registry. It maps **581 inspected source route/panel entries** to **139 canonical features**. Marketing pages, auth screens, container tabs and per-record actions do not become duplicate sidebar items.
- Each feature has a stable `/features/<id>` page inside this app. Navigation no longer opens separate applications.
- All editable features use the same create/edit/delete, search, status, CSV export, attachment and audit implementations in `hub/runtime/`.
- Clients and matters are shared records. Specialty records reference the same IDs; there are no separate immigration-client or family-client copies.
- Structured family-law and estate form metadata is incorporated from the source apps. AI drafting uses the shared server-side provider client and saves review drafts beside the selected record.
- Reports and the audit log derive from the same stored records. They are not separate demo tables.

The **Feature merge map** in the sidebar shows which source entries were combined into each feature. `reports/feature-merge-coverage.json` records coverage and exclusions. `apps/` holds the imported source implementations for reference and further provider migration; they are not required by the default application.

The latest comparison added Tenant Rights Advisor, Contract Negotiation Assistant and Contract Lifecycle Manager. Their unique workflows contribute **26 new pages**, while common contract features share one implementation. See [the app comparison](docs/APPS_COMPARISON.md) and the updated [source inventory](apps.txt).

## Sample data

**2,055 fictional records** were added: **15 records in each of 137 editable feature tables**. Reports show 137 feature totals; the audit view shows recent operations. The seed also added **1,410 explicitly labeled sample review notes** and **15 downloadable sample documents**. These notes were generated locally, not by an AI provider.

```sh
npm run seed
```

Seeding is repeatable. It tops up tables below 15 and leaves existing records and edits intact. Integration examples remain draft/ready requests; no payment, filing, notification or signature is sent by seeding.

Data lives in `data/workspace.sqlite` with owner-only file permissions and is ignored by Git. Stop the app before copying the SQLite database for a simple file backup. Original app databases and user accounts were not imported or modified.

## AI and provider boundaries

Copy `.env.example` to `.env`, set `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`, then restart to enable AI drafts. A Generate action sends the selected record's fields, notes, linked contract/tenancy facts and instructions to the configured provider. Drafts require review; supplied source text is not independently verified by this workspace.

External integrations, client/beneficiary portals, access administration, payments, electronic filing, e-signature, OCR and transcription providers are **not connected**. Their merged pages currently store preparation/request records and explicitly display their connection requirement. Ordinary record pages and AI drafting are not substitutes for every advanced workflow in the original source apps. Full provider/business-rule parity remains tracked in `FEATURE_STATUS.md`.

The workspace binds to loopback and is a local single-user app. It is not a multi-tenant hosted product and does not merge the original login systems.

## Verify

```sh
npm test
npm run audit
npm run features:build
```

The source registry can be rebuilt from its explicit semantic mappings and the checked-in panel/route inventory. The automated tests cover cross-feature client/matter references, data persistence, edit-conflict handling, CRUD, CSV escaping, attachments, AI draft storage, request-origin checks, seeding, and port cleanup. `scripts/browser-check.cjs` uses an installed Playwright package (`PLAYWRIGHT_MODULE` can identify its location) to check every feature page with isolated seeded test data.

Legacy source apps can still be managed with `./start.sh init|install|doctor|start <module-id|all>` for development reference. Those commands are separate from the merged workspace; the default `./start.sh` runs the single app described above.

## Floating Ask AI assistant

Implemented for this local workspace at `/Users/erolakarsu/projects/legal-platform`. Use the bottom-right **Ask AI** button on any page, **Ask AI about item** beside a table row or in a record view, or **Use current item** inside the assistant.

The assistant accepts general questions and questions about the current page or an explicitly selected record. It supports formatted answers and tables, follow-up questions, saved conversations, copy, and Markdown download. Draft questions and conversations stay intact while navigating. The last saved conversation restores after reload in the same browser tab.

Page metadata is included automatically. Only selected record fields and notes are included; attachments are not read. Earlier messages remain in context until **New chat** is selected. The assistant prepares answers and drafts; it does not execute record changes or external actions. Questions allow up to 5,000 words, with a response budget of up to 5,000 words and a three-minute provider timeout. Actual response length depends on the question and provider.

Provider settings are loaded from this app’s private, ignored `.env`. The local app runs at http://127.0.0.1:43100 after `./start.sh`.

Validation: 24 automated tests passed, including existing record, relationship, attachment, source registry and startup tests. Browser checks passed for record selection, navigation, saved history/reload, follow-ups, new-chat isolation, error recovery, word limits, keyboard controls, mobile layout and attachment refresh. A real AI request with fictional selected-item context also passed in a temporary database.

Evidence: [browser checks](reports/floating-ai-verification.json) and [live provider check](reports/floating-ai-live.json). Run `npm test` and `npm run test:floating-ai` to repeat automated checks.
