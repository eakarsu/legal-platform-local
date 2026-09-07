# Feature optimization

The first 40-card launcher has been replaced by a single application with native feature pages. Its old catalog is retained only in `reports/legacy-launcher-catalog.json`; it is no longer an active configuration.

`config/merged-features.json` defines 139 unique features. `scripts/build-merged-features.py` explicitly maps differently named source features, route variants and tab entries to their canonical equivalents. For example:

| Source names | Single active feature |
| --- | --- |
| Clients in law firm, immigration, Salesforce variant and legal documents | Clients |
| Cases, Matters, case tracking | Matters & cases |
| Billing, Invoices, invoice CRUD screens, billing intelligence | Invoices & billing |
| Time & Billing, Time Capture, timesheet, time entry | Time tracking |
| Legal Research, Citation Finder, research gap panels | Legal research & citations |
| Document Drafting, AI Drafting, contract drafting | Document drafting |
| Evidence Organizer and generated evidence gap panels | Evidence organization |
| Co-parenting tools and parenting logistics | Parenting plans & coordination |
| Visa categories, visa recommendations and pathway optimizer | Visa categories & pathways |
| Trust/retainer reconciliation variants | Trust & retainer reconciliation |

Create/edit/detail routes remain actions within a feature, not additional sidebar entries. Practice-specific artifacts with different forms and purposes remain separate features. Shared handlers, storage, relationships and UI components implement them once.

The coverage report accounts for inspected routes and tool-panel entries and explains excluded marketing/auth/container/action routes. The sidebar Feature merge map exposes the source-to-feature mapping for review. Coverage is based on declared source metadata, not a claim of complete provider behavior migration.

The native application stores all new records in one local SQLite database. Old source app schemas and controllers are preserved for reference, but no longer serve default workspace screens. There is no automatic migration of existing business data or accounts.

External provider features currently prepare and track request records. They do not simulate a successful payment, signature, filing, message delivery, portal access grant or OCR/transcription operation. Those operations and advanced original business rules need dedicated migrations and live acceptance tests before being marked complete.

The three additional apps are mapped through `config/legal-extension.json`, which the same builder merges into the sole active registry. See [the comparison](APPS_COMPARISON.md) for preserved apps, new workflows and overlap decisions.
