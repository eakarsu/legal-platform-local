# Run the merged workspace

```sh
cd /Users/erolakarsu/projects/legal-platform
./start.sh
```

Open http://localhost:43100. Node 22.13 or later is required. The default app uses SQLite and has no npm dependency installation or PostgreSQL setup step.

Startup clears the selected dashboard port, seeds every editable feature to at least 15 records without overwriting existing rows, and starts one server. `SEED_DEMO_DATA=0 ./start.sh` skips seeding. `HUB_PORT=43101 ./start.sh` selects a different port.

The data file is `data/workspace.sqlite`. You can supply `WORKSPACE_DB` to choose a different local database path. Both the seeder and server load workspace `.env` values. Do not commit database files or `.env` credentials.

For AI drafting, copy `.env.example` to `.env`, set your OpenRouter key and model, and restart. AI drafts use the selected record's fields, notes and linked contract/tenancy facts. Seeded review notes are explicitly marked as samples and do not contact a provider.

The app is local and single-user. Browser mutations require the workspace header and reject mismatched origins; the server accepts loopback hostnames only. Hosted authentication, tenant isolation and migration of original application accounts remain separate work.

Imported source apps in `apps/` are retained for reference. Their older independent startup/dependency/database procedures are not needed to use the merged feature workspace.
