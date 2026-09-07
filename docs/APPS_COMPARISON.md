# Apps comparison and extension

Compared the latest seven legal-question / virtual-attorney findings with the original seven entries in `apps.txt`. Four entries overlap, three are newly included, and three practice/document apps are retained. The resulting union contains **10 source apps**.

| Comparison | Projects | Result |
| --- | --- | --- |
| In both lists | AIDivorceFamilyLawNavigator; AIEstatePlanningDigitalLegacy; AIImmigrationCaseManager; AISmallClaimsCourtGuide | Existing native specialty features retained |
| Only in latest findings | AITenantRightsAdvisor | Added Tenant rights workflows |
| Only in latest findings | AIContractNegotiationAssistant; AIContractLifecycleManager | Added one shared Contracts group |
| Only in original apps.txt | smallLawFirm; smallLawFirm_salesforce; legalForms | Existing shared practice and document features retained |

## What was extended

The native registry increased from **113 to 139 feature pages**. The three additions contribute **163 mapped source route/panel entries**, resulting in **581 mapped entries** overall. The route inventory also contains excluded login, marketing, container and record-action declarations; it does not represent 581 distinct workflows.

| New native group | Feature pages |
| --- | --- |
| Tenant rights | Tenancies & leases; Tenant notices; Eviction defense preparation; Rent increase review; Repairs & habitability issues; Legal aid & tenant resources; Tenant rights questions; Legal expert referral requests |
| Contracts | Contracts; Clause library; Contract obligations; Contract approval reviews; Contract amendments; Contract renewals; Contract milestones; Negotiation rounds & simulations; Redlines & version comparison; Standard terms & market comparison; Plain-language explanations; Negotiation playbooks & fallback matrix; Contract questions; Lease analysis; Deal room & diligence records; Regulatory change assessments; Contract pricing scenarios; Negotiation communication analysis |

## How duplicates were removed

| Source overlap | Shared native destination |
| --- | --- |
| Both contract registers, clauses, approvals and chat tools | Contracts, Clause library, Contract approval reviews, Contract questions |
| Redline generators, counterproposals and version screens | Redlines & version comparison |
| Simulation, agentic negotiation and role-play variants | Negotiation rounds & simulations |
| Standard terms comparison and market benchmarking | Standard terms & market comparison |
| Tenant and contract lease analyzers | Lease analysis |
| Party directories | Existing Contacts |
| Contract/tenant document assembly, NDA and terms-of-service drafting | Existing Document drafting |
| Precedent lookup and local-law questions | Existing Legal research & citations |
| Contract risk highlights and risk reviews | Existing Contract review |
| Compliance checks, documents, evidence, reminders and integrations | Existing shared feature pages |

Records use the same SQLite store, client/matter directory, CRUD, CSV export, attachments and audit handlers. Contract and tenancy selectors validate references, show linked work, and prevent deletion of a parent with linked work. AI review drafts include the selected record and explicitly linked contract/tenancy facts. No legacy application server is needed to use these pages.

Each of the **137 editable tables** has at least **15 fictional records**: **2,055 total**, with **1,410 labeled sample review notes** and **15 sample documents**. Repeating the seed creates no duplicates and preserves existing rows.

## Source preservation and limits

The original seven imported snapshots remain intact. The three new snapshots came from `/Volumes/external/projects/` (the external/projects alias). Original repositories were not modified. Contract Negotiation Assistant already had local edits in `backend/src/routes/auth.js`, `frontend/src/pages/Login.tsx`, and `frontend/src/services/api.ts`; the snapshot records those working-tree contents and their hashes. Generated/private artifacts and credential-shaped content were omitted and recorded in `reports/excluded-files.json`.

New native forms and saved AI drafts do not establish full parity with every legacy calculator, automation or integration. Real attorney escalation, live legal-source retrieval, e-signature, provider messaging, automated renewal actions, hosted deal-room access control and multi-user authentication remain unconnected or unmigrated. The Legal expert referral page saves a request only. AI output requires a configured provider; sample drafts are explicitly local examples.

Verification: 23 automated tests passed; all 139 pages and 137 populated editable tables passed browser checks. Browser tests also created a contract, linked a renewal, reloaded it, checked the backlink and verified tenancy selectors. See the generated verification reports for timestamps.
