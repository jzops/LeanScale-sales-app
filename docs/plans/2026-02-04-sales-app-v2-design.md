# LeanScale Sales App V2 — Feature Spec

**Date:** 2026-02-04
**Status:** Approved
**Branch:** `feature/sales-app-v2`

---

## Overview

Three new capabilities for the LeanScale Sales App:

1. **SOW Generator** — In-app Statement of Work creation powered by AI, fed by transcripts + diagnostics + intake form data
2. **Project Intake Forms** — Customer-facing, data-driven intake forms for Clay and Quote-to-Cash projects with conditional logic
3. **Customer Portal Mode** — Extend the existing sales app for current customers with expanded diagnostics (Clay, CPQ, GTM)

All features live in the existing Next.js 14 app, share the Supabase backend, and follow existing patterns (multi-tenant routing, Slack webhooks, component structure).

---

## 1. Project Intake Forms

### 1.1 Design Principle

A single reusable `IntakeForm` React component renders dynamically from JSON/JS config files. Each project type (Clay, Q2C, future playbooks) gets its own config. This makes forms easily editable by future agents or team members without touching React code.

### 1.2 New Files

```
components/
  IntakeForm.js                        — Reusable form renderer

data/intake-configs/
  clay-intake.js                       — Clay project intake config
  q2c-intake.js                        — Quote-to-Cash intake config

pages/
  buy-leanscale/
    clay-intake.js                     — Clay intake form page
    q2c-intake.js                      — Q2C intake form page

  api/
    intake/
      submit.js                        — Intake form submission handler
```

### 1.3 Config Structure

Each intake config follows this schema:

```js
{
  id: 'clay-intake',
  title: 'Clay Project Intake',
  description: 'Tell us about your Clay needs so we can scope your project.',

  // Step 1: Multi-select project picker
  projectSelection: {
    type: 'multi-select',
    label: 'Which Clay projects are you interested in?',
    options: [
      { id: 'market-map', name: 'Market Map', followUpSections: ['crm', 'tam'] },
      { id: 'persona-mapping', name: 'Persona Mapping', followUpSections: ['crm', 'contacts'] },
      { id: 'automated-inbound', name: 'Automated Inbound Enrichment', followUpSections: ['crm', 'inbound'] },
      { id: 'automated-outbound', name: 'Automated Outbound', followUpSections: ['crm', 'outbound'] },
      { id: 'lead-scoring', name: 'Lead Scoring', followUpSections: ['crm', 'scoring'] },
      { id: 'abm-enrichment', name: 'ABM Target Account Enrichment', followUpSections: ['crm', 'abm'] },
      { id: 'crm-cleanup', name: 'CRM Data Cleanup', followUpSections: ['crm'] },
      { id: 'customer-segmentation', name: 'Customer Segmentation', followUpSections: ['crm', 'cs'] },
      { id: 'event-enrichment', name: 'Event Lead Enrichment', followUpSections: ['crm', 'events'] },
      { id: 'signal-prospecting', name: 'Signal-Based Prospecting', followUpSections: ['crm', 'signals'] },
    ]
  },

  // Conditional sections — shown based on selected projects
  sections: {
    crm: {
      label: 'CRM & Data',
      questions: [
        { id: 'crm_type', type: 'select', label: 'What CRM do you use?', options: ['Salesforce', 'HubSpot', 'Other'] },
        { id: 'record_count', type: 'select', label: 'Approximate records in CRM?', options: ['<5k', '5k-25k', '25k-100k', '100k+'] },
        { id: 'enrichment_tools', type: 'multi-select', label: 'Current enrichment tools?', options: ['ZoomInfo', 'Apollo', 'Clearbit', 'Lusha', '6sense', 'None'] },
        { id: 'data_quality', type: 'select', label: 'How would you rate your CRM data quality?', options: ['Poor', 'Fair', 'Good', 'Excellent'] },
      ]
    },
    tam: {
      label: 'Target Market',
      questions: [
        { id: 'icp_defined', type: 'boolean', label: 'Do you have a documented ICP?' },
        { id: 'tam_size', type: 'text', label: 'Estimated TAM size (number of accounts)?' },
        { id: 'verticals', type: 'text', label: 'Target verticals or industries?' },
      ]
    },
    contacts: {
      label: 'Contact Data',
      questions: [
        { id: 'persona_count', type: 'select', label: 'How many buyer personas do you target?', options: ['1-2', '3-5', '6+'] },
        { id: 'contact_sources', type: 'multi-select', label: 'Where do contacts come from?', options: ['Inbound', 'Outbound', 'Events', 'Partners', 'Product signups'] },
      ]
    },
    inbound: {
      label: 'Inbound Pipeline',
      questions: [
        { id: 'monthly_inbound', type: 'select', label: 'Monthly inbound lead volume?', options: ['<50', '50-200', '200-1000', '1000+'] },
        { id: 'inbound_sources', type: 'multi-select', label: 'Inbound channels?', options: ['Website forms', 'Chat', 'Demo requests', 'Trial signups', 'Content downloads'] },
        { id: 'current_routing', type: 'text', label: 'How are inbound leads currently routed?' },
      ]
    },
    outbound: {
      label: 'Outbound Process',
      questions: [
        { id: 'outbound_tools', type: 'multi-select', label: 'Outbound tools?', options: ['Outreach', 'Salesloft', 'Apollo', 'Instantly', 'Other'] },
        { id: 'monthly_outbound', type: 'select', label: 'Monthly outbound volume (contacts)?', options: ['<500', '500-2000', '2000-10000', '10000+'] },
        { id: 'outbound_approach', type: 'text', label: 'Describe your current outbound approach' },
      ]
    },
    scoring: {
      label: 'Lead Scoring',
      questions: [
        { id: 'has_scoring', type: 'boolean', label: 'Do you have a lead scoring model today?' },
        { id: 'scoring_tool', type: 'text', label: 'If yes, what tool or method?' },
      ]
    },
    abm: {
      label: 'ABM Program',
      questions: [
        { id: 'named_accounts', type: 'select', label: 'Number of named target accounts?', options: ['<50', '50-200', '200-500', '500+'] },
        { id: 'abm_tools', type: 'multi-select', label: 'ABM tools in use?', options: ['6sense', 'Demandbase', 'Terminus', 'RollWorks', 'None'] },
      ]
    },
    cs: {
      label: 'Customer Data',
      questions: [
        { id: 'customer_count', type: 'select', label: 'Number of active customers?', options: ['<100', '100-500', '500-2000', '2000+'] },
        { id: 'cs_platform', type: 'text', label: 'Customer success platform (if any)?' },
      ]
    },
    events: {
      label: 'Events',
      questions: [
        { id: 'event_frequency', type: 'select', label: 'How often do you attend/host events?', options: ['Monthly', 'Quarterly', 'A few per year', 'Rarely'] },
        { id: 'leads_per_event', type: 'select', label: 'Typical leads per event?', options: ['<100', '100-500', '500-2000', '2000+'] },
      ]
    },
    signals: {
      label: 'Intent Signals',
      questions: [
        { id: 'intent_tools', type: 'multi-select', label: 'Intent data sources?', options: ['Bombora', '6sense', 'G2', 'TrustRadius', 'None'] },
        { id: 'signals_used', type: 'multi-select', label: 'Signals you track?', options: ['Job changes', 'Funding rounds', 'Hiring patterns', 'Tech installs', 'News events', 'None'] },
      ]
    },
  }
}
```

### 1.4 Q2C Intake Config

The Quote-to-Cash intake focuses on current-state assessment:

```js
{
  id: 'q2c-intake',
  title: 'Quote-to-Cash Project Intake',
  description: 'Help us understand your current Q2C process so we can scope the right solution.',

  // Step 1: Select functional areas to improve
  projectSelection: {
    type: 'multi-select',
    label: 'Which areas of your quote-to-cash process need improvement?',
    options: [
      { id: 'quoting', name: 'Quoting & CPQ', followUpSections: ['systems', 'quoting'] },
      { id: 'contracts', name: 'Contract Management', followUpSections: ['systems', 'contracts'] },
      { id: 'billing', name: 'Billing & Invoicing', followUpSections: ['systems', 'billing'] },
      { id: 'payments', name: 'Payment Collection', followUpSections: ['systems', 'payments'] },
      { id: 'rev-rec', name: 'Revenue Recognition', followUpSections: ['systems', 'rev_rec'] },
      { id: 'full-q2c', name: 'Full End-to-End Q2C', followUpSections: ['systems', 'quoting', 'contracts', 'billing', 'payments', 'rev_rec'] },
    ]
  },

  sections: {
    systems: {
      label: 'Current Systems',
      questions: [
        { id: 'crm', type: 'select', label: 'CRM?', options: ['Salesforce', 'HubSpot', 'Other'] },
        { id: 'cpq_tool', type: 'text', label: 'CPQ tool (if any)?' },
        { id: 'billing_tool', type: 'text', label: 'Billing system?' },
        { id: 'erp', type: 'text', label: 'ERP / accounting system?' },
        { id: 'esignature', type: 'select', label: 'E-signature tool?', options: ['DocuSign', 'PandaDoc', 'Ironclad', 'None', 'Other'] },
      ]
    },
    quoting: {
      label: 'Quoting Process',
      questions: [
        { id: 'quote_method', type: 'select', label: 'How are quotes created today?', options: ['Spreadsheets', 'Word/Google Docs', 'CRM native', 'CPQ tool', 'Other'] },
        { id: 'quote_volume', type: 'select', label: 'Quotes generated per month?', options: ['<10', '10-50', '50-200', '200+'] },
        { id: 'approval_process', type: 'text', label: 'Describe your discount/approval process' },
        { id: 'product_count', type: 'select', label: 'Number of products/SKUs?', options: ['<10', '10-50', '50-200', '200+'] },
        { id: 'pricing_complexity', type: 'select', label: 'Pricing model complexity?', options: ['Simple flat rate', 'Tiered pricing', 'Usage-based', 'Hybrid / complex'] },
      ]
    },
    contracts: {
      label: 'Contract Management',
      questions: [
        { id: 'contract_tool', type: 'text', label: 'How are contracts managed today?' },
        { id: 'amendment_freq', type: 'select', label: 'How often are mid-term amendments needed?', options: ['Rarely', 'Monthly', 'Weekly', 'Daily'] },
        { id: 'contract_templates', type: 'boolean', label: 'Do you have standardized contract templates?' },
      ]
    },
    billing: {
      label: 'Billing & Invoicing',
      questions: [
        { id: 'invoice_method', type: 'select', label: 'How are invoices generated?', options: ['Manual', 'Semi-automated', 'Fully automated'] },
        { id: 'billing_frequency', type: 'multi-select', label: 'Billing frequencies used?', options: ['Monthly', 'Quarterly', 'Annual', 'Milestone-based', 'Usage-based'] },
        { id: 'error_rate', type: 'select', label: 'Estimated invoice error rate?', options: ['<1%', '1-5%', '5-15%', '>15%', 'Unknown'] },
      ]
    },
    payments: {
      label: 'Payment Collection',
      questions: [
        { id: 'payment_methods', type: 'multi-select', label: 'Payment methods accepted?', options: ['Credit card', 'ACH', 'Wire', 'Check', 'Other'] },
        { id: 'dso', type: 'select', label: 'Average Days Sales Outstanding?', options: ['<30', '30-60', '60-90', '90+', 'Unknown'] },
        { id: 'dunning', type: 'boolean', label: 'Do you have automated dunning/collections?' },
      ]
    },
    rev_rec: {
      label: 'Revenue Recognition',
      questions: [
        { id: 'rev_rec_method', type: 'select', label: 'Revenue recognition approach?', options: ['Cash basis', 'Manual spreadsheets', 'ERP-based', 'Dedicated rev rec tool', 'Unknown'] },
        { id: 'compliance', type: 'select', label: 'ASC 606 / IFRS 15 compliance status?', options: ['Fully compliant', 'Partially compliant', 'Working on it', 'Not applicable', 'Unsure'] },
        { id: 'audit_ready', type: 'boolean', label: 'Can you produce an audit trail from quote to recognized revenue?' },
      ]
    },
    uploads: {
      label: 'Example Documents',
      questions: [
        { id: 'example_quote', type: 'file', label: 'Upload an example quote or order form (optional)' },
        { id: 'example_invoice', type: 'file', label: 'Upload an example invoice (optional)' },
        { id: 'example_contract', type: 'file', label: 'Upload an example contract (optional)' },
      ]
    },
  }
}
```

### 1.5 IntakeForm Component

The `IntakeForm` component:

1. Receives a config object as a prop
2. Renders the project selection (multi-select checkboxes)
3. Computes which sections to show based on `followUpSections` from selected projects (union of all selected)
4. Renders each visible section's questions using type-appropriate inputs
5. On submit, posts to `/api/intake/submit` with:
   - `config_id` — which intake form
   - `customer_id` — from CustomerContext (if logged in)
   - `selected_projects` — array of selected project IDs
   - `answers` — key-value map of all question responses
   - `files` — any uploaded documents (stored in Supabase Storage)
6. Triggers Slack webhook notification
7. Shows confirmation screen

### 1.6 Submission Storage

Uses the existing `form_submissions` table with new `form_type` values:

- `form_type: 'clay_intake'`
- `form_type: 'q2c_intake'`

The `data` JSONB column stores the full submission payload including selected projects and all answers.

**Schema change needed:**

```sql
ALTER TABLE form_submissions
  DROP CONSTRAINT form_submissions_form_type_check,
  ADD CONSTRAINT form_submissions_form_type_check
    CHECK (form_type IN ('getting_started', 'diagnostic_intake', 'contact', 'clay_intake', 'q2c_intake'));
```

---

## 2. SOW Generator

### 2.1 Architecture

```
Intake Form Data  ──┐
Transcript Upload  ──┼──→  SOW Wizard UI  ──→  n8n Workflow  ──→  Draft SOW  ──→  Review/Edit  ──→  PDF
Diagnostic Results ──┘     (3-step)            (Claude API)       (Supabase)      (in-app)         (branded)
```

### 2.2 New Database Table

```sql
CREATE TABLE sows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'sent', 'accepted', 'declined')),
  sow_type TEXT NOT NULL
    CHECK (sow_type IN ('clay', 'q2c', 'embedded', 'custom')),

  -- Inputs
  intake_submission_id UUID REFERENCES form_submissions(id),
  transcript_text TEXT,
  diagnostic_snapshot JSONB,

  -- Output
  content JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ,

  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sows_customer ON sows(customer_id);
CREATE INDEX idx_sows_status ON sows(status);

-- Apply updated_at trigger
CREATE TRIGGER update_sows_updated_at
  BEFORE UPDATE ON sows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE sows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on sows"
  ON sows FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2.3 SOW Content Schema (JSONB)

The `content` column stores the SOW as structured sections, matching the existing SKILL.md template:

```json
{
  "executive_summary": "...",
  "client_info": {
    "company": "...",
    "primary_contact": "...",
    "stage": "...",
    "crm": "...",
    "industry": "..."
  },
  "scope": [
    {
      "title": "Market Map Implementation",
      "description": "...",
      "deliverables": ["...", "..."]
    }
  ],
  "deliverables_table": [
    { "deliverable": "...", "description": "...", "integration": "..." }
  ],
  "timeline": [
    { "phase": "Week 1-2", "activities": "...", "duration": "10 days" }
  ],
  "investment": {
    "total": 45000,
    "payment_terms": "...",
    "breakdown": [
      { "item": "Market Map", "amount": 45000 }
    ]
  },
  "team": [
    { "role": "Principal Project Owner", "responsibility": "..." },
    { "role": "Architect", "responsibility": "..." }
  ],
  "assumptions": ["...", "..."],
  "acceptance_criteria": ["...", "..."]
}
```

### 2.4 New Files

```
pages/
  sow/
    index.js                   — SOW dashboard (list all SOWs, filter by status/customer)
    [id].js                    — SOW detail view with inline editing
    generate.js                — 3-step SOW generation wizard

  api/
    sow/
      index.js                 — GET (list) / POST (create)
      [id].js                  — GET / PUT / DELETE single SOW
      generate.js              — POST: triggers n8n workflow, returns draft

components/
  SowEditor.js                — Section-by-section SOW editor
  SowPreview.js               — Branded preview / PDF export
```

### 2.5 Generation Flow

**Step 1 — Select Inputs (UI):**
- Pick customer from dropdown
- Paste or upload transcript text
- Select diagnostic type and snapshot to include
- Auto-link intake form if one exists for this customer

**Step 2 — Generate Draft (API):**
- `/api/sow/generate` assembles the full context payload
- Sends to n8n webhook endpoint
- n8n workflow:
  1. Receives context (transcript + diagnostic + intake data)
  2. Constructs prompt using the full SKILL.md template and rules
  3. Calls Claude API (claude-sonnet-4-20250514 or opus) with the assembled prompt
  4. Parses response into the structured JSONB schema
  5. Returns structured SOW content
- API saves draft to `sows` table and returns it

**Step 3 — Review & Edit (UI):**
- Renders each SOW section in editable blocks
- Team can adjust text, pricing, timeline, scope
- Save updates via `PUT /api/sow/[id]`
- Status transitions: draft → review → sent → accepted/declined
- Export to branded PDF (LeanScale purple #301934, lime #E8FFCF)

### 2.6 n8n Workflow Design

The n8n workflow is the critical quality gate. It must:

1. **Use the complete SKILL.md prompt** — not a summary. The full extraction rules, template structure, and formatting instructions get injected into the system prompt.
2. **Include all context** — transcript, diagnostic data, and intake answers concatenated with clear section headers.
3. **Use a capable model** — Claude Sonnet 4 minimum; Opus for complex multi-project SOWs.
4. **Return structured JSON** — The n8n workflow parses the LLM output into the JSONB schema before returning.
5. **Handle errors gracefully** — If generation fails, return a partial draft with sections marked as needing manual input.

### 2.7 PDF Export

Uses the existing LeanScale brand guidelines:
- Primary purple: `#301934`
- Accent lime: `#E8FFCF`
- Professional layout matching the existing SOW output style (see Amilia and Paramify examples)

Implementation: HTML template rendered server-side, converted to PDF via a lightweight library (e.g., `puppeteer` or `@react-pdf/renderer`).

---

## 3. Diagnostics Expansion

### 3.1 New Diagnostic Types

Extend the existing diagnostic system (63+ GTM processes) with two new diagnostic types:

| Diagnostic | Focus | Target User |
|------------|-------|-------------|
| GTM Diagnostic | Existing — 63+ processes across full GTM | Prospects + Customers |
| Clay Diagnostic | Clay-specific enrichment and automation maturity | Clay prospects + customers |
| CPQ Diagnostic | Quote-to-cash process and system maturity | Q2C prospects + customers |

### 3.2 Clay Diagnostic Categories

| Category | What's Assessed |
|----------|----------------|
| **Data Infrastructure** | CRM data quality, enrichment coverage, dedup status, data hygiene practices |
| **Enrichment Stack** | Current tools, waterfall logic, provider coverage, source diversity |
| **Credit Optimization** | Monthly credit spend, waterfall efficiency, source ROI, unused credits, overage frequency, cost-per-enrichment by provider |
| **Inbound Pipeline** | Lead enrichment automation, scoring, routing speed, conversion rates |
| **Outbound Pipeline** | List building, signal monitoring, personalization, sequence integration |
| **Account Intelligence** | ICP definition, TAM coverage, intent signal usage, account scoring |
| **Integration Health** | Clay-to-CRM sync reliability, webhook health, error rates, data latency |

### 3.3 CPQ Diagnostic Categories

| Category | What's Assessed |
|----------|----------------|
| **Quoting Process** | Quote creation speed, template usage, approval flows, rep adoption |
| **Pricing & Catalog** | Product catalog completeness, pricing rule accuracy, discount governance |
| **Contract Management** | CLM maturity, amendment handling, e-signature flow, clause library |
| **Billing Integration** | Invoice automation, billing accuracy, payment collection, dunning |
| **Revenue Recognition** | ASC 606 compliance, rev rec automation, audit readiness, multi-element handling |
| **System Integration** | CRM-CPQ-billing-ERP connectivity, data flow gaps, manual handoff points |

### 3.4 New Files

```
data/
  clay-diagnostic-data.js      — Clay diagnostic processes and health statuses
  cpq-diagnostic-data.js       — CPQ diagnostic processes and health statuses
  diagnostic-registry.js       — Maps diagnostic types to configs (gtm, clay, cpq)

pages/
  try-leanscale/
    clay-diagnostic.js         — Clay diagnostic page
    cpq-diagnostic.js          — CPQ diagnostic page
```

### 3.5 Data Structure

Each diagnostic follows the same pattern as the existing `diagnostic-data.js`:

```js
// Each process in a diagnostic
{
  id: 'credit-waterfall-efficiency',
  category: 'Credit Optimization',
  name: 'Waterfall Enrichment Logic',
  description: 'Ordered provider sequence that minimizes cost per successful enrichment',
  health: 'red',            // red | yellow | green | gray
  notes: 'No waterfall configured — using single provider for all enrichments',
  recommendation: 'Implement 3-tier waterfall: free sources → mid-tier → premium',
}
```

### 3.6 Diagnostic Snapshots Table

Store per-customer diagnostic results over time:

```sql
CREATE TABLE diagnostic_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  diagnostic_type TEXT NOT NULL
    CHECK (diagnostic_type IN ('gtm', 'clay', 'cpq')),
  data JSONB NOT NULL,
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diagnostic_snapshots_customer ON diagnostic_snapshots(customer_id);
CREATE INDEX idx_diagnostic_snapshots_type ON diagnostic_snapshots(diagnostic_type);

ALTER TABLE diagnostic_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access on diagnostic_snapshots"
  ON diagnostic_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

This enables tracking diagnostic changes over time — run a Clay diagnostic at kickoff, again at 90 days, and compare improvements.

### 3.7 Reusing Existing Components

The new diagnostic pages reuse the existing diagnostic UI components:
- Health status indicators (red/yellow/green/gray)
- Category grouping views (by function, by outcome, by metric)
- Gantt-style engagement overview
- Process detail panels

The diagnostic page receives a `diagnosticType` prop and loads the appropriate data file via the `diagnostic-registry.js`.

---

## 4. Customer Portal Mode

### 4.1 Approach

No separate app. The existing multi-tenant routing (`/{customer-slug}/...`) already handles customer-specific views. We add customer-type awareness to change the navigation context.

### 4.2 Schema Change

```sql
ALTER TABLE customers
  ADD COLUMN customer_type TEXT DEFAULT 'prospect'
    CHECK (customer_type IN ('prospect', 'active', 'churned'));
```

### 4.3 Navigation Context

The Layout component checks `customer_type` and adjusts navigation:

| Customer Type | Navigation Sections |
|---------------|-------------------|
| `prospect` | Why LeanScale / Try LeanScale / Buy LeanScale (existing) |
| `active` | Diagnostics / Projects / SOWs |
| `churned` | Same as prospect (re-engagement) |

The navigation bar also shows a context indicator: "Welcome, {Customer Name}" when accessed via a customer slug.

### 4.4 Customer Dashboard

Active customers see:

- **Diagnostics** — GTM, Clay, and CPQ diagnostics with historical snapshots and trend comparison (current vs. previous assessment)
- **Projects** — Active intake form submissions and their status
- **SOWs** — Any SOWs generated for them with status (draft/review/sent/accepted/declined)

### 4.5 Files Modified

```
components/
  Layout.js                    — Modified: customer-type-aware navigation
  CustomerNav.js               — NEW: customer portal navigation component

context/
  CustomerContext.js            — Modified: expose customer_type

middleware.js                  — Modified: pass customer_type to context
```

---

## 5. Implementation Plan

### Phase Dependencies

```
Phase 1 (Intake Forms)  ───────────────────────┐
Phase 3 (Diagnostics)   ─── can run in parallel ├──→ Phase 7 (Customer Portal)
Phase 4 (SOW Database)  ───────────────────────┘
                              │
                              ▼
                        Phase 5 (SOW Generation) ──→ Phase 6 (SOW UI)

Phase 2 (Q2C Intake) depends on Phase 1
```

### Build Order

| Phase | What | New/Modified Files | Depends On |
|-------|------|--------------------|------------|
| **1** | IntakeForm component + Clay intake config + page + API | `components/IntakeForm.js`, `data/intake-configs/clay-intake.js`, `pages/buy-leanscale/clay-intake.js`, `pages/api/intake/submit.js` | None |
| **2** | Q2C intake config + page | `data/intake-configs/q2c-intake.js`, `pages/buy-leanscale/q2c-intake.js` | Phase 1 |
| **3** | Clay & CPQ diagnostic data + pages + registry | `data/clay-diagnostic-data.js`, `data/cpq-diagnostic-data.js`, `data/diagnostic-registry.js`, `pages/try-leanscale/clay-diagnostic.js`, `pages/try-leanscale/cpq-diagnostic.js` | None |
| **4** | SOW + diagnostic_snapshots tables, SOW CRUD API | `supabase/sow-schema.sql`, `pages/api/sow/index.js`, `pages/api/sow/[id].js` | None |
| **5** | SOW generation (n8n workflow + API proxy) | `pages/api/sow/generate.js`, n8n workflow config | Phase 4 |
| **6** | SOW UI (dashboard, detail view, wizard, editor, PDF export) | `pages/sow/index.js`, `pages/sow/[id].js`, `pages/sow/generate.js`, `components/SowEditor.js`, `components/SowPreview.js` | Phase 4 + 5 |
| **7** | Customer portal mode (nav, context, snapshot history) | Edits to `Layout.js`, `middleware.js`, `CustomerContext.js`, new `components/CustomerNav.js` | Phase 3 + 4 |

### Phases 1, 3, and 4 can be built in parallel.

---

## 6. Technical Notes

### Existing Patterns to Follow

- **Inline styles** — The app uses inline React styles throughout, not CSS modules or Tailwind. Continue this pattern.
- **Supabase client** — Use the existing `lib/supabase.js` client for all database operations.
- **API routes** — Follow the existing pattern in `pages/api/submit-form.js` for form handling.
- **Slack webhooks** — Use the existing webhook pattern for notifications on intake submissions and SOW status changes.
- **Layout component** — All pages wrap in `<Layout>` with a `title` prop.
- **CustomerContext** — Multi-tenant customer data is accessed via `useCustomer()` hook.

### File Upload (Q2C Intake)

For the Q2C intake file uploads (example order forms, contracts):
- Use Supabase Storage with a `intake-uploads` bucket
- Files linked to the form submission via the JSONB `data` column
- Implement client-side upload via Supabase JS client

### Data Configurability

All intake form configs and diagnostic data files are designed to be easily editable:
- **Intake configs**: Add questions by appending to the `sections` object
- **Diagnostic data**: Add processes by appending to the data array
- **New diagnostic types**: Add to `diagnostic-registry.js` and create a new data file

This supports the goal of future agents being able to modify and extend the forms and diagnostics as playbooks evolve.
