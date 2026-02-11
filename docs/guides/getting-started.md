# Getting Started — Developer Setup Guide

**Last Updated:** 2026-02-11
**Branch:** `feature/sales-diagnostic-sow-flow`

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | v18+ (LTS recommended) | Runtime for Next.js |
| **npm** | v9+ | Comes with Node.js |
| **Supabase Account** | Free tier works | PostgreSQL + RLS backend |
| **Git** | v2.30+ | Source control |

Optional but recommended:
- **Supabase CLI** (`npx supabase`) — for local DB development
- **GitHub CLI** (`gh`) — for PR workflows

---

## 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/leanscale/leanscale-sales-app.git
cd leanscale-sales-app

# Switch to the feature branch
git checkout feature/sales-diagnostic-sow-flow

# Install dependencies
npm install
```

Key dependencies installed:
- `next` (14.0.4) — Framework (Pages Router)
- `@supabase/supabase-js` — Database client
- `@react-pdf/renderer` — PDF generation
- `recharts` — Charts
- `zod` — API input validation (new in this branch)

---

## 2. Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local   # if example exists, or create manually
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Admin API (for protected endpoints)
ADMIN_API_KEY=your-secret-admin-key

# Optional: Integrations
TEAMWORK_API_KEY=your-teamwork-key
TEAMWORK_DOMAIN=your-company.teamwork.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
N8N_WEBHOOK_URL=https://your-n8n.app/webhook/...
```

**Where to find Supabase keys:**
1. Go to [supabase.com](https://supabase.com) → your project
2. Settings → API → Project URL, `anon` key, `service_role` key

> **Note:** The app runs in demo mode without Supabase credentials. All database-dependent features gracefully degrade to static fallback data.

---

## 3. Database Setup

### Run the Consolidated Migration

Open the Supabase SQL Editor (Dashboard → SQL Editor) and run:

```sql
-- Run the consolidated schema (creates all tables, indexes, RLS policies)
```

Paste the contents of `supabase/migrations/001_consolidated_schema.sql`.

This creates the following tables:
- `customers` — Multi-tenant customer configs
- `availability_dates` — Cohort availability calendar
- `form_submissions` — Form data capture
- `diagnostic_results` — Per-customer diagnostic data
- `diagnostic_notes` — Per-process-item notes
- `sows` — Statement of Work records
- `sow_sections` — SOW scope sections
- `sow_versions` — Export version snapshots
- `service_catalog` — Services with hours/rates

> **Important:** Do NOT run the old individual schema files (`schema.sql`, `sow-schema.sql`, etc.). They've been archived to `supabase/archive/`. The consolidated migration is the single source of truth.

---

## 4. Seed the Service Catalog

The service catalog powers hour/rate lookups for the auto SOW builder and engagement engine. Seed it from the static data:

```bash
# Via the API (app must be running first — see step 5)
curl -X POST http://localhost:3000/api/service-catalog/seed \
  -H "x-api-key: your-admin-key"
```

Or seed manually in Supabase SQL Editor using the data from `data/services-catalog.js`.

This populates ~128 services (68 strategic projects + 60+ managed services) with `hours_low`, `hours_high`, `default_rate`, and `key_steps`.

---

## 5. Start the Dev Server

```bash
npm run dev
```

This runs two steps automatically:
1. `node data/parse-diagnostic-config.js` — regenerates `data/diagnostic-data.js` from `data/diagnostic-config.md`
2. `next dev` — starts the development server

The app will be available at **http://localhost:3000**.

---

## 6. Key URLs

### Public Pages

| URL | Description |
|-----|-------------|
| `http://localhost:3000/why-leanscale` | Why LeanScale overview |
| `http://localhost:3000/try-leanscale` | Try LeanScale entry point |
| `http://localhost:3000/try-leanscale/diagnostic` | GTM Diagnostic (demo mode) |
| `http://localhost:3000/try-leanscale/engagement` | Engagement recommendations |
| `http://localhost:3000/buy-leanscale` | Buy configurator |
| `http://localhost:3000/sow` | SOW list |

### Customer-Scoped Pages

Access any page as a specific customer using path-based routing:

```
http://localhost:3000/c/{customer-slug}/try-leanscale/diagnostic
```

Or with a query parameter (dev mode):

```
http://localhost:3000/try-leanscale/diagnostic?customer={customer-slug}
```

### Admin & API

| URL | Description |
|-----|-------------|
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:3000/api/diagnostics/gtm` | Diagnostic API |
| `http://localhost:3000/api/sow` | SOW API |
| `http://localhost:3000/api/engagement` | Engagement API |
| `http://localhost:3000/api/service-catalog` | Service catalog API |

---

## 7. Test Accounts & Demo Mode

### Demo Mode (No Database)

Without Supabase credentials, the app runs in **demo mode**:
- Diagnostic pages show static data from `data/diagnostic-data.js`
- Engagement page shows sample recommendations
- SOW operations are disabled
- All pages render without errors

### Creating a Test Customer

```sql
-- In Supabase SQL Editor
INSERT INTO customers (slug, name, password, is_demo, diagnostic_type)
VALUES ('acme', 'Acme Corp', 'test123', false, 'gtm');
```

Then access: `http://localhost:3000/c/acme/try-leanscale/diagnostic`

---

## 8. Common Tasks

### Regenerate Diagnostic Data

If you modify `data/diagnostic-config.md`:

```bash
node data/parse-diagnostic-config.js
```

This regenerates `data/diagnostic-data.js`. The file is also auto-generated on `npm run dev` and `npm run build`.

### Run a Build

```bash
npm run build
npm start
```

### Check API Endpoints

```bash
# List SOWs
curl http://localhost:3000/api/sow -H "x-api-key: your-admin-key"

# Get diagnostic results
curl "http://localhost:3000/api/diagnostics/gtm?customerId=CUSTOMER_UUID"

# Get engagement recommendation
curl "http://localhost:3000/api/engagement?customerId=CUSTOMER_UUID"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Supabase client not configured" warnings | Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| Blank diagnostic page | Normal in demo mode — static data loads. Check console for errors. |
| PDF export fails | Ensure `@react-pdf/renderer` is installed. Check for null values in SOW sections. |
| Service catalog empty | Run the seed endpoint (step 4) or check Supabase connection. |
| "Module not found: zod" | Run `npm install` — zod was added in this branch. |
