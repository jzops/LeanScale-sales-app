# LeanScale: Diagnostic to SOW User Guide

This guide walks you through the complete workflow — from running a customer diagnostic assessment through delivering a branded Statement of Work PDF.

---

## Table of Contents

1. [Overview](#overview)
2. [Step 1: Run a Diagnostic](#step-1-run-a-diagnostic)
3. [Step 2: Review Diagnostic Results](#step-2-review-diagnostic-results)
4. [Step 3: Build a Statement of Work](#step-3-build-a-statement-of-work)
5. [Step 4: Review the SOW Page](#step-4-review-the-sow-page)
6. [Step 5: Export a PDF](#step-5-export-a-pdf)
7. [Step 6: Manage Versions](#step-6-manage-versions)
8. [Step 7: Push to Teamwork](#step-7-push-to-teamwork)
9. [Step 8: Use the Service Catalog](#step-8-use-the-service-catalog)
10. [Step 9: Diagnostic Sync and Section Reordering](#step-9-diagnostic-sync-and-section-reordering)
11. [Managing SOWs](#managing-sows)
12. [Customer View vs Internal View](#customer-view-vs-internal-view)
13. [Glossary](#glossary)

---

## Overview

The Diagnostic-to-SOW workflow lets you:

1. Assess a customer's operational health across GTM, Clay, or CPQ processes
2. Identify problem areas and prioritize what needs fixing
3. Generate a structured Statement of Work directly from the diagnostic findings
4. Build out scope sections with hours, rates, deliverables, and timelines
5. Export a professional branded PDF to share with the customer
6. Track version history so you always know what was sent and when
7. Push accepted SOWs to Teamwork to create project structures with milestones, task lists, and tasks
8. Use the Service Catalog to quickly add pre-configured sections with default hours, rates, and deliverables
9. Stay in sync when diagnostic results change after a SOW is created, and reorder sections with drag-and-drop

**Who this is for:** LeanScale team members running customer assessments and building SOWs. Customers see a read-only version of the finished SOW.

---

## Step 1: Run a Diagnostic

### Getting to the Diagnostic

1. Navigate to **Try LeanScale** from the main navigation
2. You'll see cards for three diagnostic types:
   - **GTM Diagnostic** — Go-to-market process health (63 inspection points across Marketing, Sales, CS, and Partnerships)
   - **Clay Diagnostic** — Data enrichment and automation process health
   - **CPQ Diagnostic** — Quote-to-cash process health

3. Click on the diagnostic type you want to run

### For a New Customer

If this is the first diagnostic for a customer, their results page will be empty. You have two ways to populate it:

**Option A: Import from Markdown**
1. On the diagnostic results page, click **Import Markdown**
2. Paste or upload a `.md` file with the diagnostic data (uses the standard markdown table format)
3. Preview the parsed results to make sure everything looks right
4. Click **Import** to save

**Option B: Manual Entry via Edit Mode**
1. Click the **Edit Mode** toggle at the top of the diagnostic page
2. Click any process item's status badge to cycle through: Healthy → Careful → Warning → Unable
3. Click the star icon to mark items as Priority (these will be flagged for the SOW)
4. Changes auto-save as you work

### Adding Notes

While in Edit Mode, you can add notes to individual diagnostic items:

1. Click the **notes icon** on any row to expand the notes drawer
2. Type your note and press Enter to save
3. Notes include your name and a timestamp
4. You can delete notes you've added

---

## Step 2: Review Diagnostic Results

Once diagnostic data is populated, the results page shows:

- **Summary statistics** — Total items, status breakdown, priority count
- **Donut chart** — Visual distribution of Healthy / Careful / Warning / Unable
- **Bar chart** — Category or function breakdown
- **Item table** — Every process item with status, priority flag, and notes count

### Filtering and Grouping

- Use the **tabs** at the top to switch between:
  - **All Items** — Everything in one list
  - **By Category/Function** — Grouped view by department or category
  - **Priority Only** — Just the items flagged as priority

- Use the **status filter** chips to show/hide items by status

### What to Look For

Before building a SOW, review the diagnostic to identify:
- Items marked **Warning** or **Unable** — these are the most critical
- Items marked as **Priority** — these are what the customer wants addressed
- Patterns by category — if an entire function is unhealthy, that's a scope section

---

## Step 3: Build a Statement of Work

### Starting the SOW

From the diagnostic results page, click the **Build SOW** button (purple button, visible only for real customers — not on the demo).

This creates a new SOW linked to the diagnostic and takes you to the **SOW Builder**.

### The SOW Builder Layout

The builder is a two-panel interface:

**Left Panel: Diagnostic Item Picker**
- Shows all diagnostic process items from the linked assessment
- Pre-selects critical items (Warning and Unable status) automatically when building a new SOW
- Items with **Careful** status are visually highlighted with a yellow left border and a "Suggested" label, indicating they may also warrant inclusion
- You can check/uncheck items to include or exclude them from the SOW

**Right Panel: Section Editors**
- Each section represents a scope area in the SOW (e.g., "Lead Lifecycle Redesign", "CRM Cleanup")
- Sections are where you define the actual work

### Building Sections

You have two ways to add sections:

**Option A: From the Service Catalog** (recommended)
1. Click the green **+ From Catalog** button at the top of the right panel
2. A picker opens showing all available services — search by name or filter by category
3. Click a service to create a section pre-filled with the service's default title, description, hours, rate, and deliverables
4. Adjust any values as needed for this specific engagement

**Option B: Blank Section**
1. Click the purple **+ Blank Section** button
2. Fill in all fields manually

For either option:
1. **Name it** — Give the section a clear title (e.g., "Marketing Automation Setup")
2. **Describe it** — Write what this scope area covers
3. **Set hours and rate** — Enter estimated hours and hourly rate; the subtotal calculates automatically
4. **Set dates** — Add start and end dates for the timeline
5. **Add deliverables** — Click **+ Deliverable** to add specific outputs (e.g., "Lead scoring model configured and tested")

### Linking Diagnostic Items to Sections

1. Click on a section to make it the **active section** (it gets a purple highlight)
2. In the left panel, check the diagnostic items that this section addresses
3. Click **Assign to Section** — the selected items link to the active section
4. Linked items appear in the section card with their diagnostic status dots

This is important because it creates a clear connection between "what's broken" (diagnostic) and "what we'll fix" (SOW scope).

### Filtering the Item Picker

Use the filter buttons above the item list:
- **All** — Every diagnostic item
- **Critical** — Warning + Unable only
- **Careful** — Careful status only
- **Selected** — Items you've checked
- **Unselected** — Items not yet checked

Use the **search box** to find items by name, outcome, function, or category.

Quick actions:
- **Select Critical** — Auto-checks all Warning and Unable items
- **Select All** — Checks everything
- **Clear** — Unchecks everything

### Saving Your Work

- Individual sections auto-save as you type (after a brief pause)
- Click **Save All** in the summary bar at the top to save all sections and update the SOW totals
- The summary bar shows: total sections, total hours, total investment, selected items count, and unassigned items count

---

## Step 4: Review the SOW Page

After building, navigate to the SOW detail page to see the finished presentation. You can get here by:
- Clicking **Back to SOW** from the builder
- Going to **Statements of Work** in the nav and clicking on the SOW

### What You'll See

The SOW page is a rich, interactive view with these sections:

**Header**
- SOW title, status badge, type, creation date
- Total hours and total investment at a glance
- **Builder** button to go back and edit
- **Push to Teamwork** button (when SOW is in Review/Sent/Accepted and hasn't been pushed yet)
- **View in Teamwork** link (green, shown after a successful push)

**Status Bar** (internal only)
- Dropdown to change SOW status: Draft → Review → Sent → Accepted → Declined
- Click **Update** to save the status change

**Executive Summary + Diagnostic Score Card**
- Left: The executive summary text
- Right: A donut chart showing the diagnostic health distribution (Healthy / Careful / Warning / Unable) with an overall rating badge

**Scope of Work**
- Expandable cards for each section
- Click a card to expand and see:
  - Description
  - Hours, rate, and subtotal
  - Start and end dates
  - Deliverables list
  - Linked diagnostic findings with colored status dots — click any finding to navigate to the diagnostic results page

**Team, Assumptions & Acceptance Criteria** (shown when populated)
- **Team** — Lists the team members assigned to the engagement, with roles if provided
- **Assumptions** — Lists key assumptions the SOW is based on
- **Acceptance Criteria** — Defines what "done" looks like for the engagement

**Timeline**
- Horizontal bar chart showing each section's date range
- Month markers along the top
- Color-coded bars for easy visual comparison

**Investment Summary**
- Table with columns: Section, Hours, Rate, Subtotal
- Footer row with totals
- Total investment highlighted in green

**Version History**
- List of all exported versions with version number, date, and who exported
- **Download PDF** link on each version to re-download
- **Export PDF** button to create a new version

---

## Step 5: Export a PDF

When the SOW is ready to share with a customer:

1. Go to the SOW detail page
2. Scroll down to the **Versions** section
3. Click **Export PDF**

What happens:
- A branded PDF is generated with the SOW content in a clean, print-ready format
- The PDF automatically downloads to your computer
- A new version record is created (e.g., v1, v2, v3...)
- The filename follows the format: `CustomerName-SOW-YYYY-MM-DD.pdf`

### What's in the PDF

The PDF includes:
- **Header** — SOW title, customer name, date, type, total hours, investment
- **Executive Summary** — With a branded purple left border
- **Scope of Work** — Numbered sections with descriptions, deliverables, linked diagnostic findings, hours/rate/subtotal
- **Timeline** — Section date ranges in a visual format
- **Investment Summary** — Table matching the web view
- **Footer** — Customer name + "LeanScale" branding on every page

---

## Step 6: Manage Versions

Every time you export a PDF, a version snapshot is saved. This means:

- **Version history is permanent** — You can always see what was sent and when
- **Re-download any version** — Click "Download PDF" next to any version to regenerate the PDF from that point-in-time snapshot
- **Make changes and re-export** — Go back to the Builder, update sections, then export again. The new export becomes the next version number.

### Version Flow Example

1. Build SOW, export → **v1** created
2. Customer requests changes
3. Go to Builder, update hours on two sections, add a new deliverable
4. Export again → **v2** created
5. Both v1 and v2 are available for download at any time
6. The SOW page shows `current_version: 2`

---

## Step 7: Push to Teamwork

Once a SOW is approved, you can push it to Teamwork to create a fully structured project. This sets up the customer's project with milestones, task lists, and tasks — ready for your team to start executing.

### Requirements

- The SOW must be in **Review**, **Sent**, or **Accepted** status
- The SOW must not have been pushed to Teamwork already
- Teamwork API credentials must be configured (handled by your admin)

### How to Push

1. Go to the SOW detail page
2. In the header area, you'll see a green **Push to Teamwork** button (next to the Builder button)
3. Click it to generate a preview

### The Preview Step

Before anything is created in Teamwork, you'll see a detailed preview of everything that will be built:

**Summary Cards**
- Company name — the Teamwork client that will be created or linked
- Project name — matches your SOW title
- Template — the template type applied based on your SOW type
- Milestone, Task List, and Task counts — total items to be created

**Hierarchical Preview**
Each SOW section becomes a **Milestone** in Teamwork. Under each milestone you'll see:

- **SOW Task Lists** (green "SOW" badge) — Your section deliverables become a task list
- **Template Task Lists** (orange "Template" badge) — Standard implementation tasks from the template for that SOW type

Click on any milestone to expand and see its task lists and individual tasks.

### Template Mapping

Each SOW type automatically uses the right project template:

| SOW Type | Template | Example Phases |
|----------|----------|----------------|
| **Clay** | Tool Implementation | Requirements → Configuration → Integration → Training → Optimization |
| **Q2C** | Lifecycle Implementation | Discovery → Design → Implementation → Testing → Enablement |
| **Embedded** | Strategic Initiative | Analysis → Modeling → Documentation → Implementation Support |
| **Custom** | Diagnostic Assessment | Audit → Grading → Recommendations |

### Confirming the Push

Once you've reviewed the preview:

1. Click **Create in Teamwork** (purple button at the bottom)
2. Wait for the creation to complete — this takes a few seconds as it builds everything in Teamwork
3. You'll see a green success banner when it's done

### What Gets Created

When you confirm, the system creates in Teamwork:

1. **Company** — Finds your customer by name, or creates a new client
2. **Project** — Named after the SOW, linked to the company, with start/end dates from your sections
3. **Milestones** — One per SOW section, with deadlines from section end dates
4. **Task Lists** — Deliverables list + template implementation tasks for each milestone
5. **Tasks** — Individual deliverables and template tasks, with dates from the section

### After Pushing

- The "Push to Teamwork" button is replaced by a green **View in Teamwork** link
- Clicking it opens the Teamwork project in a new tab
- The SOW cannot be pushed again (the link is permanent)
- You can close the preview panel by clicking the X

### If Something Goes Wrong

- **Error during preview**: Make sure the SOW has sections and is in the correct status
- **Error during creation**: Check that Teamwork credentials are configured. The error message will show what went wrong
- **Already pushed**: If the SOW was already pushed, you'll see the "View in Teamwork" link instead of the push button

---

## Step 8: Use the Service Catalog

The Service Catalog is a library of pre-defined services that LeanScale offers. Instead of building every SOW section from scratch, you can pick a service from the catalog and get a section pre-filled with default hours, rates, and deliverables.

### What's in the Catalog

The catalog contains over 120 services organized into six categories:

| Category | What It Covers | Examples |
|----------|----------------|----------|
| **Power10** | Core GTM metrics implementation | ARR, Pipeline Production, Net Retention |
| **Strategic** | Go-to-market strategy projects | Growth Model, ICP Analysis, Lead Scoring |
| **Managed Services** | Ongoing operational support | CRM Admin, CS Tools Admin, Sales Ops |
| **Custom Diagnostic** | Custom assessment projects | Custom diagnostic engagements |
| **Tool Diagnostic** | Tool implementation assessments | CRM, Support AI Chatbot, Data Enrichment |
| **Tool Project** | Tool implementation projects | CRM Implementation, Chat Platform Setup |

Each service includes:
- **Name and description** — What the service is
- **Hours range** — Typical low-to-high hour estimate
- **Default rate** — Standard hourly rate
- **Key steps** — Steps that become default deliverables
- **Category and function** — How the service fits into the GTM framework
- **Diagnostic rubric** — Grading criteria linked to diagnostic assessments

### Using the Catalog When Building a SOW

1. In the SOW Builder, click the green **+ From Catalog** button
2. The catalog picker opens as a modal overlay
3. **Search** — Type in the search box to find services by name, description, or function
4. **Filter by category** — Use the dropdown to narrow to a specific category (e.g., "Strategic" or "Power10")
5. **Browse** — Scroll through the list; each service shows its name, category badge, hour range, and rate
6. **Select** — Click a service to create a new SOW section pre-filled with:
   - Title set to the service name
   - Description from the catalog
   - Hours set to the midpoint of the service's hour range
   - Rate set to the service's default rate
   - Deliverables populated from the service's key steps

After selecting, you can edit any of the pre-filled values to customize for the specific customer engagement.

### Managing the Catalog (Admin)

Admins can manage the service catalog from the admin area:

1. Go to **Admin** → **Service Catalog** in the navigation
2. The catalog management page shows all services in a searchable, filterable table
3. **Add a service** — Click **+ Add Service** to open the editor form
4. **Edit a service** — Click the **Edit** button on any row
5. **Delete a service** — Click the **Delete** button (confirmation required)

The editor form lets you set:
- Name, description, and category
- Status (Ready for Diagnostic, Pending Basic Info, Missing Rubric)
- Delivery model (Menu or Custom)
- Hour range and default rate
- Owner and team members
- GTM function and outcomes
- Tools, diagnostic types, and related services

### Seeding the Catalog

The catalog comes with a seed script that imports all 127 services from the LeanScale catalog context files. Your admin can run:

```
node scripts/seed-catalog.js --post --clear
```

This parses the catalog markdown files and populates the database. The `--clear` flag removes existing entries before importing. Use `--dry-run` to preview what will be imported without making changes.

---

## Step 9: Diagnostic Sync and Section Reordering

### Diagnostic Change Detection

When you create a SOW from a diagnostic, the system takes a snapshot of the diagnostic results at that moment. If the diagnostic is later updated (items added, removed, or status changed), the SOW page will show a yellow **"Diagnostic Updated"** banner alerting you to the changes.

### What the Banner Shows

The banner appears at the top of the SOW detail page (below the status bar) when changes are detected:

- **Total change count** — How many items have been added, removed, or had their status changed
- **Show Details** — Click to expand and see the specifics:
  - **Status Changed** — Items whose health status changed (e.g., Warning to Healthy), shown with before/after color-coded status dots
  - **New Items** — Items added to the diagnostic since the SOW was created
  - **Removed Items** — Items that were in the diagnostic at SOW creation but have since been removed

### Responding to Changes

You have two options:

1. **Update SOW** (purple button) — Accepts the current diagnostic state as the new baseline. The banner disappears and the snapshot is refreshed. This does not change your SOW sections — it simply acknowledges that the diagnostic has been updated.

2. **Dismiss** (X button) — Hides the banner for this session. The banner will reappear on your next visit if changes still exist.

After clicking "Update SOW", you may want to go to the SOW Builder to review your sections and adjust them based on the diagnostic changes.

### Reordering Sections with Drag and Drop

In the SOW Builder, you can reorder sections by dragging them:

1. Hover over a section card — the cursor changes to a grab handle
2. Click and drag the section to its new position in the list
3. Release to drop it — the order is saved automatically

The new order is persisted immediately and will be reflected on the SOW detail page, in PDF exports, and when pushing to Teamwork.

---

## Managing SOWs

### SOW List Page

Navigate to **Statements of Work** in the main navigation to see all SOWs.

Each SOW card shows:
- Title
- Status badge (Draft, Review, Sent, Accepted, Declined)
- Type (Clay, Q2C, Custom)
- Creation date

Click any SOW to view its detail page.

### Creating a SOW Without a Diagnostic

If you need a standalone SOW (not linked to a diagnostic):

1. Go to **Statements of Work**
2. Click **Generate New SOW**
3. Fill in the details and generate
4. Navigate to the Builder to add sections manually

### SOW Statuses

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress, still building |
| **Review** | Internal review before sending to customer |
| **Sent** | Shared with the customer |
| **Accepted** | Customer approved the SOW |
| **Declined** | Customer did not accept |

Change the status from the status bar on the SOW detail page.

---

## Customer View vs Internal View

The application serves two audiences:

### Internal View (LeanScale team)
- Full access to all features
- Can edit diagnostic items, import markdown, add notes
- Can build and edit SOWs
- Can change SOW status
- Can export PDFs and manage versions
- Can push SOWs to Teamwork and view linked projects
- Accessed at the base URL or admin routes

### Customer View (read-only)
- Customers access via their branded URL: `clients.leanscale.team/c/CUSTOMERNAME/sow/[id]`
- The middleware automatically detects the `/c/CUSTOMERNAME/` prefix and sets the customer context
- Sees the SOW page without edit controls
- No Builder button, no status bar, no Export button
- Can view scope sections (with clickable diagnostic findings), timeline, investment table, team, assumptions, and acceptance criteria
- Can download previously exported PDFs from version history
- Empty version history is hidden (clean presentation)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Diagnostic** | An assessment of a customer's operational processes (GTM, Clay, or CPQ) |
| **Diagnostic Item** | A single process being evaluated (e.g., "Lead Scoring", "Pipeline Stage Management") |
| **Status** | Health rating for a diagnostic item: Healthy, Careful, Warning, or Unable |
| **Priority** | A flag marking a diagnostic item as important for the engagement |
| **SOW** | Statement of Work — a document defining scope, timeline, and investment |
| **Section** | A scope area within a SOW (e.g., "CRM Configuration", "Reporting Setup") |
| **Deliverable** | A specific output within a section (e.g., "Dashboard configured and tested") |
| **Builder** | The two-panel interface for constructing SOW sections from diagnostic items |
| **Version** | A point-in-time snapshot of a SOW, created each time a PDF is exported |
| **Overall Rating** | Aggregate health score for a diagnostic: Critical, Warning, Moderate, or Healthy |
| **Teamwork** | Project management tool where SOWs are pushed to create structured projects |
| **Milestone** | A Teamwork milestone created from a SOW section, with a deadline matching the section end date |
| **Task List** | A group of tasks in Teamwork — either from SOW deliverables or from a template |
| **Template** | A predefined set of implementation phases and tasks applied based on the SOW type |
| **Service Catalog** | A library of pre-defined services with default hours, rates, and deliverables that can be used to quickly populate SOW sections |
| **Catalog Category** | The grouping for a service: Power10, Strategic, Managed Services, Custom Diagnostic, Tool Diagnostic, or Tool Project |
| **Catalog Picker** | The modal interface in the SOW Builder for searching and selecting services from the catalog |
| **Seed Script** | A command-line tool that imports service definitions from markdown files into the catalog database |
| **Diagnostic Snapshot** | A frozen copy of the diagnostic results taken when a SOW is created, used to detect later changes |
| **Diagnostic Sync Banner** | The yellow notification bar that appears on the SOW page when the linked diagnostic has changed since the SOW was created |
| **Re-sync** | Updating the diagnostic snapshot to match the current live diagnostic data, acknowledging changes |
| **Suggested Item** | A diagnostic item with "Careful" status that is highlighted in the Item Picker as a candidate for inclusion, shown with a yellow border and "Suggested" label |

---

## Quick Reference: The Complete Flow

```
1. Run Diagnostic
   Navigate to Try LeanScale → Choose diagnostic type
   Import markdown or manually set statuses

2. Review Results
   Check status distribution, identify critical items
   Add notes and set priorities

3. Build SOW
   Click "Build SOW" from diagnostic page
   Use "+ From Catalog" to add pre-filled sections, or "+ Blank Section" for custom
   Set hours/rates/dates, link diagnostic items to sections
   Add deliverables

4. Review SOW
   Check the SOW detail page
   Update status to "Review"
   Verify all sections look correct

5. Export PDF
   Click "Export PDF" in version history
   PDF downloads automatically
   Version snapshot is saved

6. Share with Customer
   Update status to "Sent"
   Customer views read-only SOW at their branded URL
   Re-export if changes are needed (new version created)

7. Track Outcome
   Update status to "Accepted" or "Declined"
   All versions remain available for reference

8. Push to Teamwork
   Click "Push to Teamwork" from the SOW page
   Review the preview (milestones, task lists, tasks)
   Click "Create in Teamwork" to push
   Project, milestones, and tasks are created automatically
   Click "View in Teamwork" to open the project
```
