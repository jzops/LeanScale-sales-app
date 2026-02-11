# Feature Changelog — `feature/sales-diagnostic-sow-flow`

**Date:** 2026-02-11
**Base Branch:** `main`

---

## Summary

This feature branch adds three major capabilities to the LeanScale Sales App:

1. **Auto SOW Builder** — Automatically generates pre-populated SOW sections from diagnostic results using service catalog data
2. **Dynamic Engagement Page** — Transforms the static engagement overview into a customer-specific recommendation engine
3. **API Hardening** — Authentication middleware, Zod validation, standardized errors, and schema consolidation

Plus diagnostic UX improvements: search/filter, status picker popover, executive summary editor, and assumptions editor.

---

## Feature Details

### 1. Auto SOW Builder

**Before:** Clicking "Build SOW" created an empty SOW. The user manually created sections, assigned diagnostic items, and set hours/rates (8–12 minutes).

**After:** "Build SOW" auto-generates sections grouped by function, pre-populated with hours, rates, deliverables, and an executive summary from service catalog data (2 minutes to review and adjust).

- Filters priority items (warning/unable status or `addToEngagement` flag)
- Adaptive grouping: ≤8 items → one section per item; 9+ items → grouped by function
- Looks up each `serviceId` in `service_catalog` for hours/rates/deliverables
- Generates executive summary from diagnostic statistics
- Computes timeline with sequential scheduling

### 2. Dynamic Engagement Page

**Before:** Engagement page imported static data from `data/diagnostic-data.js`. Every customer saw identical recommendations with fabricated hour estimates (`20 + (idx * 8)`).

**After:** Engagement page fetches the customer's actual diagnostic results, enriches with real service catalog hours/rates, recommends a tier (Starter/Growth/Scale), and shows customer-specific project sequencing.

- New `GET /api/engagement` endpoint
- Pure recommendation engine in `lib/engagement-engine.js` (testable, no DB deps)
- Tier recommendation based on total hours fitting within 6 months
- Graceful fallback to static data when no diagnostic results exist

### 3. Diagnostic UX Improvements

**Before:** Status editing required cycling through 4 options (3 clicks to reach "warning"). No search/filter on 63 items. No N/A status.

**After:** Click-to-open status popover for one-click selection. Search by name, filter by function/status/outcome/priority. N/A status for irrelevant items.

### 4. SOW Content Editors

**Before:** Executive summary, assumptions, and acceptance criteria were set at creation time with no UI to edit them.

**After:** New `ExecutiveSummaryEditor` and `AssumptionsEditor` components with auto-save, regenerate from diagnostic data, template variables, and drag-and-drop reordering.

### 5. API Hardening

**Before:** No authentication, no input validation library, no standardized errors.

**After:** `withAuth()` middleware (public/customer/admin levels), Zod schemas for all request bodies, `AppError` class with error codes and request IDs, `withErrorHandler()` wrapper.

### 6. Schema Consolidation

**Before:** 4 overlapping SQL files with duplicate table definitions, run-order dependencies, and missing foreign keys.

**After:** Single `001_consolidated_schema.sql` migration with all tables, indexes, RLS policies, and triggers. Old files archived to `supabase/archive/`.

---

## New Files

### Libraries (`lib/`)

| File | Purpose |
|------|---------|
| `lib/sow-auto-builder.js` | Auto-generate SOW sections from diagnostic results + service catalog |
| `lib/engagement-engine.js` | Pure recommendation engine (tier selection, scoring, sequencing) |
| `lib/api-middleware.js` | `withAuth()` HOF for authentication (public/customer/admin) |
| `lib/api-validation.js` | Zod schemas for all API endpoints + `validate()` helper |
| `lib/api-errors.js` | `AppError` class, error catalog, `sendError()`, `withErrorHandler()` |
| `lib/case-transform.js` | `toSnakeCase()` / `toCamelCase()` object key transforms |

### Components

| File | Purpose |
|------|---------|
| `components/diagnostic/FilterBar.js` | Search + dropdown filters for diagnostic processes |
| `components/diagnostic/StatusPicker.js` | Click-to-open status popover (replaces cycling) |
| `components/diagnostic/DiagnosticPdfDocument.js` | PDF export for diagnostic results |
| `components/sow/ExecutiveSummaryEditor.js` | Rich editor with auto-save, regenerate, template vars |
| `components/sow/AssumptionsEditor.js` | Bullet-list editor for assumptions + acceptance criteria |

### API Routes (`pages/api/`)

| File | Purpose |
|------|---------|
| `pages/api/engagement.js` | `GET /api/engagement` — customer-specific recommendations |
| `pages/api/sow/auto-generate.js` | `POST /api/sow/auto-generate` — SOW with auto-built sections |
| `pages/api/diagnostics/export.js` | `POST /api/diagnostics/export` — diagnostic PDF generation |

### Pages

| File | Purpose |
|------|---------|
| `pages/try-leanscale/results.js` | Diagnostic results view page |
| `pages/sow/[id]/review.js` | SOW review page |

### Database

| File | Purpose |
|------|---------|
| `supabase/migrations/001_consolidated_schema.sql` | Single consolidated schema migration |

### Documentation

| File | Purpose |
|------|---------|
| `docs/analysis/code-review.md` | Comprehensive code review & architecture analysis |
| `docs/analysis/user-experience-review.md` | UX review with sales process alignment |
| `docs/specs/auto-sow-builder.md` | Auto SOW builder feature specification |
| `docs/specs/dynamic-engagement-page.md` | Dynamic engagement page specification |
| `docs/specs/diagnostic-ux-improvements.md` | Diagnostic UX improvements spec (10 features) |
| `docs/specs/api-hardening-guide.md` | API hardening specification |
| `docs/specs/user-flow-guide.md` | Complete user flow documentation |

---

## Modified Files

| File | Changes |
|------|---------|
| `components/diagnostic/DiagnosticResults.js` | Integrated FilterBar, StatusPicker; added filter state and logic |
| `components/diagnostic/StatusLegend.js` | Added `na` status config and gray color |
| `components/diagnostic/SummaryCard.js` | Updated to exclude N/A items from health calculations |
| `components/sow/SowBuilder.js` | Added ExecutiveSummaryEditor, AssumptionsEditor, auto-generated banner |
| `components/sow/SowPage.js` | Integrated new content editors |
| `components/sow/SowPdfDocument.js` | Updated to render assumptions and acceptance criteria |
| `data/diagnostic-data.js` | Added `quickAssessment` field to process items |
| `lib/sow-export.js` | Updated for new PDF sections |
| `package.json` | Added `zod` dependency |
| `pages/api/diagnostics/[type].js` | Added validation, auth middleware |
| `pages/api/service-catalog/index.js` | Added validation, auth on POST |
| `pages/api/sow/[id]/export.js` | Updated for new content fields |
| `pages/api/sow/[id]/index.js` | Added validation, error handling |
| `pages/api/sow/from-diagnostic.js` | Integrated auto-builder, validation, enhanced response |
| `pages/api/sow/index.js` | Added validation, auth |
| `pages/try-leanscale/engagement.js` | Refactored to use `useEngagementData` hook with dynamic data |
| `styles/globals.css` | Added `--status-na` color, responsive diagnostic styles |

---

## Deleted Files

| File | Reason |
|------|--------|
| `data/customer-config.js` | Fully superseded by `customers` DB table + `CustomerContext`. No imports found. |

---

## New API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/engagement?customerId=X&diagnosticType=gtm` | customer | Get engagement recommendation |
| `POST` | `/api/sow/auto-generate` | admin | Create SOW with auto-built sections |
| `POST` | `/api/diagnostics/export` | customer | Generate diagnostic PDF |

### Modified Endpoints

| Endpoint | Change |
|----------|--------|
| `POST /api/sow/from-diagnostic` | Now accepts `autoGenerate`, `groupBy`, `defaultRate`, `startDate` params. Auto-generates sections when `autoGenerate: true` (default). |
| `PUT /api/diagnostics/[type]` | Added Zod validation on request body |
| `POST /api/service-catalog` | Added admin auth requirement |
| `PUT /api/sow/[id]` | Supports `contentPartial` for partial content updates (executive summary, assumptions) |

---

## Database Changes

### New Migration

`supabase/migrations/001_consolidated_schema.sql` — Consolidates all 4 previous schema files into a single migration. Creates all tables with proper foreign keys, indexes, RLS policies, and `updated_at` triggers.

### Schema Additions

- `service_catalog.slug` column (TEXT, UNIQUE) — matches diagnostic `process.serviceId` for auto-builder lookups
- `--status-na` CSS variable for N/A diagnostic status

### Archived Files

Old schema files moved to `supabase/archive/`:
- `schema.sql`
- `sow-schema.sql`
- `sow-redesign-schema.sql`
- `diagnostic-results-schema.sql`

---

## Breaking Changes

**None.** All changes are additive and backward-compatible:

- Existing SOWs are unaffected
- `from-diagnostic` defaults to `autoGenerate: true` but passing `autoGenerate: false` preserves old behavior
- Engagement page falls back to static data when no diagnostic results exist
- New API middleware only affects new/modified endpoints
- Old schema files are archived but the consolidated migration creates identical tables

---

## Testing Instructions

### Manual Testing

#### Auto SOW Builder
1. Navigate to a customer diagnostic: `/c/{slug}/try-leanscale/diagnostic`
2. Enter edit mode, set several items to "warning" or "unable", flag some as priority
3. Click "Build SOW"
4. Verify: SOW created with pre-populated sections, executive summary, hours/rates from catalog
5. Adjust sections in the builder, save
6. Export PDF — verify all sections render correctly

#### Dynamic Engagement Page
1. Complete a diagnostic with priority items flagged
2. Navigate to `/c/{slug}/try-leanscale/engagement`
3. Verify: shows customer-specific recommendations (not static demo data)
4. Check tier recommendation matches total hours
5. Without diagnostic results: verify graceful fallback to demo data

#### Diagnostic UX
1. On diagnostic page, verify FilterBar appears above the process table
2. Test search by name, filter by function, filter by status
3. Click a status badge — verify popover appears with all 5 options (healthy, careful, warning, unable, N/A)
4. Set items to N/A — verify they're excluded from health calculations
5. Verify "Priority only" checkbox filters to `addToEngagement` items

#### SOW Content Editors
1. Open a SOW in the builder
2. Verify ExecutiveSummaryEditor appears with auto-generated text
3. Edit the summary — verify auto-save indicator
4. Click "Regenerate" — verify summary rebuilds from diagnostic data
5. Scroll to AssumptionsEditor — verify default assumptions populated
6. Add/remove/reorder items — verify auto-save
7. Export PDF — verify assumptions and acceptance criteria appear

#### API Hardening
1. Call `POST /api/service-catalog` without `x-api-key` header — verify 403
2. Call `POST /api/sow/from-diagnostic` with invalid body — verify 400 with validation details
3. Call any write endpoint with valid `x-api-key` — verify success
4. Check error responses include `requestId` field

### API Testing

```bash
# Test engagement endpoint
curl "http://localhost:3000/api/engagement?customerId=CUSTOMER_UUID"

# Test auto-generate SOW
curl -X POST http://localhost:3000/api/sow/from-diagnostic \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_KEY" \
  -d '{
    "customerId": "UUID",
    "diagnosticResultId": "UUID",
    "sowType": "custom",
    "autoGenerate": true,
    "groupBy": "function"
  }'

# Test validation error
curl -X POST http://localhost:3000/api/sow/from-diagnostic \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_KEY" \
  -d '{"customerId": "not-a-uuid"}'
# Should return 400 with VALIDATION_ERROR

# Test auth rejection
curl -X POST http://localhost:3000/api/service-catalog \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'
# Should return 403
```
