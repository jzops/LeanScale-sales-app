# Architecture Overview

**Last Updated:** 2026-02-11
**Branch:** `feature/sales-diagnostic-sow-flow`
**Audience:** New developers joining the project

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (Pages Router) | 14.0.4 |
| **Database** | Supabase (PostgreSQL + RLS) | — |
| **PDF Generation** | @react-pdf/renderer | — |
| **Charts** | Recharts | 3.7 |
| **State Management** | React Context (CustomerContext, AuthContext) | — |
| **Validation** | Zod | — |
| **Deployment** | Replit (per-customer instances planned) | — |
| **Integrations** | Teamwork, Slack, n8n (AI SOW generation) | — |

---

## Directory Structure

```
leanscale-sales-app/
├── components/
│   ├── diagnostic/           # Diagnostic assessment UI
│   │   ├── DiagnosticResults.js   # Main diagnostic renderer (871 lines, all 3 types)
│   │   ├── DiagnosticPdfDocument.js # PDF export for diagnostics [NEW]
│   │   ├── FilterBar.js           # Search & filter controls [NEW]
│   │   ├── StatusPicker.js        # Status selection popover [NEW]
│   │   ├── StatusLegend.js        # Status badge + legend
│   │   ├── SummaryCard.js         # Health overview stats
│   │   ├── NoteDrawer.js          # Per-item notes panel
│   │   └── MarkdownImport.js      # Import from markdown tables
│   ├── sow/                  # Statement of Work UI
│   │   ├── SowBuilder.js          # Two-panel SOW construction (509 lines)
│   │   ├── SowPage.js             # SOW detail/review page (690 lines)
│   │   ├── SowPdfDocument.js      # PDF generation (518 lines)
│   │   ├── ExecutiveSummaryEditor.js # Rich summary editor [NEW]
│   │   ├── AssumptionsEditor.js   # Bullet-list editor [NEW]
│   │   ├── SectionEditor.js       # Individual section editing
│   │   ├── CatalogPicker.js       # Add sections from service catalog
│   │   └── DiagnosticItemPicker.js # Select diagnostic items for SOW
│   ├── charts/               # DonutChart, BarChart
│   ├── admin/                # ServiceCatalogTable, ServiceEditor
│   ├── Layout.js             # Global layout wrapper
│   └── Navigation.js         # Customer-aware navigation
├── context/
│   ├── CustomerContext.js    # Multi-tenant customer state + useCustomer() hook
│   └── AuthContext.js        # Admin authentication state
├── data/
│   ├── diagnostic-config.md       # Source of truth for diagnostic processes
│   ├── diagnostic-data.js         # AUTO-GENERATED from diagnostic-config.md
│   ├── diagnostic-registry.js     # Maps diagnostic types → configs
│   ├── services-catalog.js        # 68 strategic + 60+ managed services
│   ├── clay-diagnostic-data.js    # Clay-specific diagnostic data
│   └── cpq-diagnostic-data.js     # CPQ-specific diagnostic data
├── lib/
│   ├── supabase.js           # Dual client setup (anon + service_role)
│   ├── sow.js                # SOW CRUD operations
│   ├── sow-sections.js       # SOW sections CRUD
│   ├── sow-versions.js       # Version snapshots
│   ├── sow-export.js         # PDF generation wrapper
│   ├── sow-auto-builder.js   # Auto-generate SOW from diagnostics [NEW]
│   ├── engagement-engine.js  # Recommendation engine (pure function) [NEW]
│   ├── diagnostics.js        # Diagnostic results + notes CRUD
│   ├── service-catalog.js    # Service catalog CRUD
│   ├── api-middleware.js      # Auth middleware (withAuth) [NEW]
│   ├── api-validation.js     # Zod schemas + validate() [NEW]
│   ├── api-errors.js         # Standardized errors (AppError, sendError) [NEW]
│   ├── case-transform.js     # camelCase ↔ snake_case mapping [NEW]
│   ├── teamwork.js           # Teamwork API client
│   └── slack.js              # Slack notification helpers
├── pages/
│   ├── try-leanscale/        # Diagnostic + engagement pages
│   ├── sow/                  # SOW pages (list, generate, build, review)
│   ├── buy-leanscale/        # Sales/pricing pages
│   ├── why-leanscale/        # Marketing/content pages
│   ├── admin/                # Admin panel
│   └── api/                  # REST API routes
│       ├── diagnostics/      # Diagnostic CRUD + export
│       ├── sow/              # SOW CRUD + auto-generate + export
│       ├── engagement.js     # Engagement recommendation API [NEW]
│       └── service-catalog/  # Service catalog CRUD + seed
├── supabase/
│   ├── migrations/
│   │   └── 001_consolidated_schema.sql  # Single source of truth [NEW]
│   └── archive/              # Old schema files (deprecated)
└── styles/
    └── globals.css           # Global CSS with custom properties
```

---

## Data Flow

### Overall Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  CustomerContext │  │  DiagnosticPage │  │    SowBuilder   │ │
│  │  (useCustomer)  │  │  (edit/view)    │  │  (two-panel)    │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │          │
│           │     fetch() / auto-save with debounce    │          │
└───────────┼────────────────────┼─────────────────────┼──────────┘
            ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API LAYER (pages/api/)                      │
│                                                                  │
│  withAuth() → validate() → handler → sendError()                │
│                                                                  │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │/api/      │  │/api/sow/     │  │/api/engagement           │  │
│  │diagnostics│  │from-diagnostic│  │                          │  │
│  │/[type]    │  │auto-generate │  │  engagement-engine.js    │  │
│  └─────┬─────┘  └──────┬───────┘  │  (pure function)        │  │
│        │               │          └────────────┬─────────────┘  │
└────────┼───────────────┼───────────────────────┼────────────────┘
         ▼               ▼                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      LIB LAYER (lib/)                            │
│                                                                  │
│  diagnostics.js    sow.js / sow-sections.js   service-catalog.js│
│  sow-auto-builder.js   engagement-engine.js                     │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SUPABASE (PostgreSQL + RLS)                    │
│                                                                  │
│  customers │ diagnostic_results │ sows │ sow_sections │ ...     │
│                                                                  │
│  service_role key → full access (server-side writes)             │
│  anon key → public read on customers, availability, catalog      │
└──────────────────────────────────────────────────────────────────┘
```

### Diagnostic → SOW Flow

```
1. Sales rep edits diagnostic     →  auto-save to diagnostic_results
2. Click "Build SOW"              →  POST /api/sow/from-diagnostic
3. sow-auto-builder.js runs:
   a. selectPriorityItems()       →  filter warning/unable/addToEngagement
   b. lookupCatalogEntries()      →  batch fetch service_catalog by slug
   c. generateSections()          →  group by function, merge catalog data
   d. generateExecutiveSummary()  →  template from diagnostic stats
4. SOW + sections created         →  redirect to /sow/[id]/build
5. SowBuilder loads pre-filled    →  user reviews & adjusts
6. Export PDF                     →  POST /api/sow/[id]/export
```

### Engagement Recommendation Flow

```
1. GET /api/engagement?customerId=X
2. Fetch diagnostic_results + service_catalog
3. engagement-engine.js (pure function):
   a. filterPriorityItems()       →  items flagged addToEngagement
   b. enrichWithCatalog()         →  join hours/rates from catalog
   c. scorePriority()             →  weight by status severity
   d. groupAndSequence()          →  order by function, build timeline
   e. computeRecommendation()     →  recommend tier, compute totals
4. Return EngagementRecommendation object
```

---

## Multi-Tenant Routing

The app supports multiple customers through a middleware-based routing system:

| Method | Format | Status |
|--------|--------|--------|
| **Path-based** | `/c/customer-slug/page` | ✅ Active |
| **Subdomain** | `customer.clients.leanscale.team` | 🔲 Planned |
| **Query param** | `?customer=slug` | ✅ Dev only |

**How it works:**

1. Next.js middleware detects customer slug from the URL path (`/c/acme/...`)
2. Sets an `ls-customer` cookie with the slug
3. Rewrites the URL to strip the `/c/acme` prefix (so page components see clean routes)
4. `CustomerContext` reads the cookie, calls `GET /api/customer`, and provides customer data app-wide
5. `customerPath()` helper prefixes all generated links with the customer slug

**Demo mode:** When no customer slug is present, the app runs with static fallback data. All database-dependent features degrade gracefully — the app never crashes from missing Supabase config.

---

## Key Patterns

### 1. Diagnostic Registry Pattern

All three diagnostic types (GTM, Clay, CPQ) share a single `DiagnosticResults` component. The registry (`data/diagnostic-registry.js`) maps each type to its data configuration:

```js
// Adding a new diagnostic type requires only:
// 1. A data file (data/new-diagnostic-data.js)
// 2. A registry entry
// 3. A page route (pages/try-leanscale/new-diagnostic.js)
```

### 2. Auto-Save with Debounce

The diagnostic page auto-saves edits to Supabase with an 800ms debounce. This enables live editing during sales calls without a save button:

```
User clicks status → local state updates → 800ms timer → PUT /api/diagnostics/[type]
```

### 3. Graceful Degradation

Every Supabase-dependent feature has a static fallback. The pattern:

```js
const supabaseClient = createClient(url, key);  // may be null
if (!supabaseClient) return staticFallbackData;
const { data, error } = await supabaseClient.from('table').select();
return data || staticFallbackData;
```

### 4. Auto SOW Builder (New)

`lib/sow-auto-builder.js` transforms diagnostic results into pre-populated SOW sections:

- **Item selection:** Filters processes with `warning`/`unable` status or `addToEngagement` flag
- **Adaptive grouping:** ≤8 items → one section per item; 9+ items → grouped by function
- **Catalog enrichment:** Looks up each item's `serviceId` in `service_catalog` for hours, rates, deliverables
- **Timeline computation:** Sequential scheduling with ~20 hrs/week capacity assumption
- **Executive summary generation:** Template-based text from diagnostic statistics

### 5. Engagement Engine (New)

`lib/engagement-engine.js` is a **pure function** (no database calls) that takes diagnostic results + service catalog as input and outputs a structured recommendation:

- Priority scoring by status severity (unable=4, warning=3, careful=2, healthy=1)
- Tier recommendation (Starter/Growth/Scale) based on total hours fitting within 6 months
- Project sequencing by function order (Cross Functional first → Partnerships last)
- Investment and duration estimates

### 6. API Middleware Stack (New)

New API routes use a composable middleware pattern:

```js
// lib/api-middleware.js  → withAuth(handler, { level: 'admin' })
// lib/api-validation.js  → validate(schema, data) — throws AppError on failure
// lib/api-errors.js      → sendError(res, error) — standardized error responses
//                        → withErrorHandler(handler) — auto-catches + formats errors

// Usage:
export default withAuth(
  withErrorHandler(async (req, res) => {
    const body = validate(sowFromDiagnosticBody, req.body);
    // ... handler logic
  }),
  { level: 'admin' }
);
```

**Auth levels:**
- `public` — no authentication required
- `customer` — valid customer session (cookie-based)
- `admin` — `ADMIN_API_KEY` header or Bearer token

**Error format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [{ "path": "customerId", "message": "Required" }],
    "requestId": "req_abc123"
  }
}
```

---

## Database Schema (Key Tables)

```
customers ──────────┐
                     │ customer_id
diagnostic_results ──┤──── diagnostic_notes (per-item notes)
                     │
sows ────────────────┤──── sow_sections (scope items)
                     │──── sow_versions (export snapshots)
                     │
service_catalog ─────┘     (hours, rates, deliverables)
```

- **`diagnostic_results`**: One row per customer per diagnostic type (UNIQUE constraint). Stores `processes` as JSONB array.
- **`sows`**: Links to diagnostics via `diagnostic_result_ids` (UUID array) and stores a `diagnostic_snapshot` (point-in-time copy).
- **`sow_sections`**: One row per scope section, linked to SOW. Stores `diagnostic_items` (process names) and `deliverables` (JSONB).
- **`service_catalog`**: Service entries with `slug` matching diagnostic process `serviceId` for auto-builder lookups.

See `supabase/migrations/001_consolidated_schema.sql` for the complete schema.
