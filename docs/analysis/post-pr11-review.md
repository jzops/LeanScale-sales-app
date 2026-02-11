# Post-PR11 Comprehensive Code Review

**Date:** 2026-02-11  
**Branch:** `main` (post-PR11 merge)  
**Reviewer:** Automated analysis  
**Focus Areas:** Customer routing, SOW editing, Diagnostic CTA, Diagnostic edit mode

---

## 1. Customer Routing Issues

### Full Flow Trace

**Entry Points → Cookie → Context → Navigation**

1. **Middleware** (`middleware.js`): Runs on every non-API/static route. Three routing patterns:
   - **Path-based** (`/c/{slug}/...`): Extracts slug, rewrites URL, sets `customer-slug` cookie with `maxAge: 86400` (24h persistent)
   - **Subdomain** (`{slug}.clients.leanscale.team`): Extracts from hostname
   - **Query param** (`?customer=slug`): Development only

2. **Critical Bug — Cookie Lifetime Mismatch (Lines 30-36 vs 52-58)**:
   - Path-based routes (`/c/slug/...`) set cookie with `maxAge: 60 * 60 * 24` (24h persistent cookie)
   - Non-path routes set cookie **without maxAge** (session cookie)
   - **The problem**: When a user visits `/c/formance/diagnostic`, the cookie is set to `formance` with 24h TTL. If they then navigate to `/` (without `/c/` prefix), middleware runs again, sees no customer slug, defaults to `'demo'`, and overwrites the cookie with a session cookie for `demo`. **But the 24h cookie from the path-based route persists in the browser until explicitly overwritten.**
   - **Race condition**: The middleware comment says "Always reset to demo when not on a /c/ path to prevent cookie persistence from showing customer branding on main site" — this is correct intent, but the **maxAge mismatch creates inconsistency**. On the `/c/` path the cookie persists for 24h, on non-`/c/` paths it's a session cookie. Both write to the same cookie name. The session cookie WILL overwrite the persistent one (same path `/`), but the user experience during the transition is unpredictable.

3. **getCustomer.js** (`lib/getCustomer.js`):
   - `getCustomerServer()` reads from: header → cookie → query param → defaults to `'demo'`
   - `getCustomerSlugClient()` reads from `document.cookie` directly
   - `getCustomerClient()` calls `/api/customer` with credentials

4. **CustomerContext** (`context/CustomerContext.js`):
   - On mount (when no `initialCustomer` from SSR), reads cookie via regex match on `document.cookie`
   - Passes slug as query param to `/api/customer?slug={slugFromCookie}`
   - **Gap**: If cookie was just overwritten by middleware to `demo` during a redirect, the context loads demo data even though the user was on a customer page moments ago

5. **Navigation** (`components/Navigation.js`):
   - Uses `customerPath()` from context to prefix links with `/c/{slug}/`
   - `customerPath()` only prefixes when `!isDemo && customer.slug` exists
   - **Bug scenario**: User is on `/c/formance/try-leanscale/diagnostic`. They click a link that was rendered BEFORE context loaded (brief flash). The link goes to `/try-leanscale/engagement` (no prefix). Middleware sees no `/c/` prefix, sets cookie to `demo`. Context reloads with demo. **Customer is lost.**

### Specific Bug: Navigation Between Customer Portal and Main Page

**Root cause**: The `customerPath()` helper in `CustomerContext.js` (line 87-94) correctly builds `/c/{slug}/path` links. But there are **hardcoded routes that bypass it**:

- `SowScopeSection.js` (line ~200): Builds diagnostic URL directly:
  ```js
  const diagUrl = diagType && customerSlug
    ? `/c/${customerSlug}/try-leanscale/...`
    : `/try-leanscale/...`
  ```
  If `customerSlug` is undefined (race condition on context load), the fallback URL has no prefix.

- `SowHeader.js` (line ~110): Builder link:
  ```js
  href={customerSlug && customerSlug !== 'demo'
    ? `/c/${customerSlug}/sow/${sow.id}/build`
    : `/sow/${sow.id}/build`}
  ```
  Manually constructing paths instead of using `customerPath()`.

- `pages/sow/[id]/index.js` (line ~105): `isReadOnly` logic:
  ```js
  const isReadOnly = customer?.isDemo === false;
  ```
  This means **all real customers see read-only SOWs**, and demo users get edit mode. This is likely inverted — should be checking for admin auth, not demo status.

### Recommendations

1. **Normalize cookie lifetime**: Both code paths in middleware should use the same strategy. Use `maxAge: 86400` consistently for `/c/` paths, and explicitly set `maxAge: 0` (or delete) for non-`/c/` paths to ensure clean override.

2. **Never build `/c/{slug}/` URLs manually**: Replace all manual URL construction with `customerPath()`. Audit every file for hardcoded `/c/` patterns.

3. **Add SSR customer hydration everywhere**: `getCustomerServerSideProps` is used on diagnostic and SOW pages — good. But the `initialCustomer` prop needs to be passed through `_app.js` to `CustomerProvider`. Verify this chain is complete.

4. **Fix `isReadOnly` logic** in `pages/sow/[id]/index.js`: This should check authentication status, not demo status.

---

## 2. SOW Editing Gaps

### What CAN Be Edited Inline

| Field | Component | Status |
|-------|-----------|--------|
| SOW Title | `SowHeader.js` → `EditableField` | ✅ Working |
| SOW Status | `SowHeader.js` → status buttons | ✅ Working (immediate save) |
| Executive Summary | `SowExecutiveSummary.js` → `EditableTextArea` | ✅ Working |
| Section Title | `SowScopeSection.js` → `EditableField` | ✅ Working |
| Section Description | `SowScopeSection.js` → `EditableTextArea` | ✅ Working |
| Section Hours | `SowScopeSection.js` → `EditableNumber` | ✅ Working |
| Section Rate | `SowScopeSection.js` → `EditableNumber` | ✅ Working |
| Section Start/End Date | `SowScopeSection.js` → `<input type="date">` | ✅ Working |
| Section Deliverables | `SowScopeSection.js` → add/remove list | ✅ Working |
| Investment Table cells | `InvestmentTable.js` → `EditableField`/`EditableNumber` | ✅ Working |
| Delete Section | `SowScopeSection.js` → delete button | ✅ Working |

### What CANNOT Be Edited Inline (Gaps)

| Field | Current State | Issue |
|-------|--------------|-------|
| **Team members** | `SowPage.js` line ~230: Read-only `<ul>` | No edit capability — renders static content from `content.team` |
| **Assumptions** | `SowPage.js` line ~250: Read-only `<ul>` | No edit capability — renders static content from `content.assumptions` |
| **Acceptance Criteria** | `SowPage.js` line ~265: Read-only `<ul>` | No edit capability — renders static content from `content.acceptance_criteria` |
| **SOW Type** | `SowHeader.js` line ~100: Static `<span>` | Display only, no edit |
| **Overall Rating** | Computed, not directly editable | N/A — derived from diagnostic |
| **Add New Section** | No UI for creating a new section inline | Must go through Builder or diagnostic import |
| **Reorder Sections** | `lib/sow-sections.js` has `reorderSections()` | Backend exists, no drag-and-drop UI |
| **Diagnostic Items per Section** | Read-only chips in `SowScopeSection.js` | No way to add/remove linked diagnostic items inline |
| **Content fields (team, assumptions, etc.)** | Static render in `SowPage.js` | These should use `EditableTextArea` for arrays or a list editor |

### How the Recalculate Bar Works

`SowRecalculateBar.js` is a sticky bottom bar that appears when `dirtyFields.size > 0`:

1. **Dirty tracking** (`SowPage.js`): A `Set<string>` tracks changed field paths like `sow.title`, `content.executive_summary`, `sections.{id}.hours`
2. **Projected totals**: Recalculated locally from `localSections.reduce(...)` on every render
3. **Save flow** (`handleRecalculate`):
   - Saves SOW-level changes (title, content, totals) via `PUT /api/sow/{id}`
   - Saves each dirty section individually via `PUT /api/sow/{id}/sections/{sectionId}`
   - Updates local state + server refs
   - Clears dirty set
4. **Discard**: Reverts to `serverSowRef.current` and `serverSectionsRef.current`

**Issue**: The recalculate bar only saves fields that have corresponding dirty tracking. If `content.team` or `content.assumptions` were made editable, the `handleRecalculate` function only checks for `content.executive_summary` (line ~115 of SowPage.js):
```js
if (dirtyFields.has('content.executive_summary')) {
  sowUpdates.content = { ...localSow.content };
}
```
This actually saves ALL content when executive_summary is dirty (because it spreads `localSow.content`), but only triggers on that one field. **Fix**: Check for any `content.*` dirty field.

### Additional Editing Needed

1. **Team, Assumptions, Acceptance Criteria** — Need list editors (add/remove/reorder items)
2. **Add New Section button** — Simple form or modal to add a blank section
3. **Section reordering** — Drag-and-drop or up/down arrows
4. **Quick edit all sections from Investment Table** — Already partially works via `EditableNumber` in `InvestmentTable.js`

---

## 3. Diagnostic CTA Banner

### Current State

In `DiagnosticResults.js` (lines ~210-225), the CTA banner is at the bottom of the page:

```jsx
<div className="cta-banner" style={{ marginTop: '2rem' }}>
  <h3 className="cta-title">
    {diagnosticType === 'clay'
      ? 'Ready to optimize your Clay implementation?'
      : diagnosticType === 'cpq'
      ? 'Ready to optimize your Quote-to-Cash process?'
      : 'Ready to see your recommended engagement?'}
  </h3>
  <p className="cta-subtitle">
    View prioritized projects and timeline based on your diagnostic results.
  </p>
</div>
```

### Problems

1. **No link/button**: The CTA banner has no `<a>` or `<button>`. It's just text with a styled background. Completely non-actionable.
2. **Should link to SOW**: For customers with a diagnostic result, the natural next step is viewing the SOW. The banner should link to `/sow` (which auto-creates a SOW from diagnostic if none exists).
3. **Engagement page also a valid target**: The engagement page (`/try-leanscale/engagement`) shows a timeline/projects view but is a different perspective than the SOW.

### Recommended Fix

Add two CTA buttons:
- **Primary**: "View Statement of Work" → `customerPath('/sow')` (if diagnostic result exists)
- **Secondary**: "View Engagement Overview" → `customerPath('/try-leanscale/engagement')`

For demo users (no diagnostic result), show:
- "Start Your Diagnostic" → link to the diagnostic start page
- Or "View Sample Engagement" → engagement page

The `hasDiagnosticResult` and `isDemo` state is already available in `DiagnosticResults.js`.

---

## 4. Diagnostic Edit Mode — Configurability

### Current Item Editing UX

When `editMode` is true:

1. **Status cycling** (`DiagnosticItemCard.js` line 17-22): Click the status badge to cycle through `healthy → careful → warning → unable`. Simple, effective.
2. **Priority toggle** (`DiagnosticItemCard.js` line 24-28): Click "Set Priority" / "Priority" button to toggle `addToEngagement`.
3. **Notes** (`DiagnosticItemCard.js` line 70-80): Click the 💬 button to open `NoteDrawer` (rendered at the bottom of `PriorityView.js`).
4. **Auto-save**: All changes debounced 800ms, saved to `/api/diagnostics/{type}`.

### What's Missing — Modal for Notes/Details

**Current notes UX issues:**
- `NoteDrawer` renders **below all sections** in `PriorityView.js` (line ~80). User clicks 💬 on a card, then has to scroll down to see the drawer. Poor UX.
- No way to add **details/context per item** beyond free-text notes. No structured fields like:
  - Current state description
  - Desired state
  - Impact assessment
  - Estimated effort
  - Owner/responsible party

**Recommended: Item Detail Modal**

When clicking a diagnostic item card in edit mode, show a modal with:

1. **Header**: Item name, current status (editable), priority toggle
2. **Details tab**:
   - Description (from static data, read-only)
   - Function/outcome tags
   - Linked service from catalog (with hours estimate)
3. **Notes tab**:
   - All notes for this item (currently in NoteDrawer)
   - Add new note
4. **Configuration tab** (new):
   - Custom description override (text area)
   - Estimated hours override
   - Owner/assignee field
   - Tags/labels

The `DiagnosticItemCard` already has `onOpenNotes` — extend this to open a full modal instead of the drawer.

---

## 5. Navigation Consistency

### How Nav Changes Between Customer/Non-Customer Views

**Prospect/Demo nav** (`prospectSections` in Navigation.js):
- Three dropdowns: Why LeanScale? / Try LeanScale / Buy LeanScale
- "Get Started" CTA button

**Customer (active) nav** (`buildCustomerNav()` in Navigation.js):
- Flat links: Dashboard / Diagnostic / SOW
- "More" dropdown with secondary items
- No "Get Started" CTA

**Switch logic** (line ~98): `isActive ? buildCustomerNav(diagnosticType) : prospectSections`
- `isActive` = `customerType === 'active'`
- Prospects (even real prospects with a slug) see the full prospect nav

### Where It Breaks

1. **Customer type timing**: If `CustomerContext` hasn't loaded yet (no `initialCustomer` from SSR), the default `customerType` is `'prospect'` (from `defaultCustomer`). The nav briefly shows prospect layout, then flashes to customer layout. **Fix**: Use loading skeleton or ensure SSR hydration.

2. **customerPath inconsistency**: All nav links use `customerPath()`, which is correct. But `customerPath()` returns unprefixed paths for demo users. If a customer's session degrades to demo (cookie lost), all nav links lose the `/c/` prefix, and the user can't get back to their portal without re-entering the URL.

3. **No "return to portal" mechanism**: If a customer lands on the main site (no `/c/` prefix), there's no way to get back. Consider adding a banner: "Return to {customerName} portal" when the customer slug is known but the current URL isn't prefixed.

4. **Mobile menu**: Works correctly — same items, hamburger toggle. No mobile-specific issues found.

---

## 6. Cross-cutting Issues

### Authentication

**There is no real authentication system.** The entire app relies on:
- Customer slug from URL/cookie for "identity"
- `readOnly` flag in SOW that's based on `customer?.isDemo === false` (inverted logic)
- No login, no JWT, no session tokens
- The `/api/customer` endpoint serves customer data including passwords to anyone who knows the slug

**Risk**: Anyone who knows a customer slug can access their diagnostic data and SOW. The password field exists in the DB but is never checked on the frontend.

**Immediate mitigation**: The `isReadOnly` logic in `pages/sow/[id]/index.js` should be based on an admin flag or authentication, not demo status.

### Data Flow

- **SSR → Client hydration**: `getCustomerServerSideProps` provides `customer` prop, but `_app.js` must pass it to `CustomerProvider` as `initialCustomer`. This prevents the flash-of-wrong-content.
- **Diagnostic data**: Loaded client-side in `DiagnosticResults.js` via `useEffect`. No SSR for diagnostic data. This means a brief loading state for customer-specific data.
- **SOW data**: Also loaded client-side in `pages/sow/[id]/index.js` via `useEffect`. Same pattern.

### Performance

- **Framer Motion everywhere**: Every card, section, view transition uses Framer Motion animations. On pages with 50+ diagnostic items, this could cause jank on low-end devices.
- **No pagination**: All diagnostic items rendered at once. Fine for 30-60 items, could be an issue at scale.
- **Service catalog lookup**: `engagement.js` does a waterfall: fetch diagnostic → collect serviceId slugs → fetch catalog entries. Could be parallelized.

### Mobile

- **Diagnostic cards**: Grid layout should stack on mobile. Check `priority-section-grid` CSS.
- **Investment table**: Full-width table with 4 columns. May need horizontal scroll on mobile (already has `overflow: hidden` on container).
- **SOW scope sections**: The hours/rate/subtotal cluster on the right of each section header will likely overflow on narrow screens.
- **Recalculate bar**: Full-width fixed bottom bar — good on mobile, but content may wrap poorly.

---

## 7. Specific Improvement Plan (Prioritized)

### P0 — Critical Bugs

1. **Fix CTA banner in diagnostic** — Add actual buttons/links to SOW and engagement pages
   - File: `components/diagnostic/DiagnosticResults.js` lines 210-225
   - 5 min fix

2. **Fix `isReadOnly` logic in SOW detail page** — Currently inverted
   - File: `pages/sow/[id]/index.js` line ~105
   - Change to admin auth check or flip logic

3. **Fix cookie lifetime mismatch in middleware** — Normalize cookie behavior
   - File: `middleware.js` lines 30-36 and 52-58
   - Ensure non-`/c/` routes explicitly clear the persistent cookie

### P1 — Customer Portal Consistency

4. **Replace all hardcoded `/c/{slug}/` URLs with `customerPath()`**
   - Files: `SowScopeSection.js` (~line 200), `SowHeader.js` (~line 110)
   - Audit: `grep -r '"/c/' components/ pages/` for other occurrences

5. **Add "Return to Portal" banner** when customer slug is known but URL is unprefixed
   - File: New component or addition to `Navigation.js`

6. **Ensure SSR customer hydration prevents nav flash**
   - File: `_app.js` — verify `initialCustomer` prop chain

### P2 — SOW Editing Enhancements

7. **Make Team, Assumptions, Acceptance Criteria editable**
   - File: `SowPage.js` lines 225-275
   - Use list editor pattern (similar to deliverables in `SowScopeSection.js`)

8. **Add "New Section" button**
   - File: `SowPage.js` after the sections list
   - Creates blank section via `POST /api/sow/{id}/sections`

9. **Fix recalculate save to handle all content fields**
   - File: `SowPage.js` `handleRecalculate` — check for any `content.*` dirty field, not just `content.executive_summary`

10. **Add section reordering UI**
    - File: `SowPage.js` — add up/down arrows or drag-and-drop
    - Backend: `lib/sow-sections.js` `reorderSections()` already exists

### P3 — Diagnostic Configurability

11. **Build DiagnosticItemModal component**
    - New file: `components/diagnostic/DiagnosticItemModal.js`
    - Shows status, priority, notes, description, linked service, custom fields
    - Replace current `NoteDrawer` pattern with modal

12. **Add structured fields per diagnostic item**
    - Custom description, estimated hours override, owner, tags
    - Requires schema extension in diagnostic_results processes JSON

### P4 — UX Polish

13. **SOW mobile responsiveness** — Fix scope section header layout on narrow screens
14. **Diagnostic card "View in SOW" link visibility** — Currently `opacity: 0` with CSS hover (line 90 of DiagnosticItemCard.js). Won't work on touch devices.
15. **Loading states** — Add skeleton for nav during customer context load

---

## File Reference Index

| Area | Key Files |
|------|-----------|
| Customer routing | `middleware.js`, `lib/getCustomer.js`, `context/CustomerContext.js`, `pages/api/customer.js` |
| Navigation | `components/Navigation.js` |
| Diagnostic display | `components/diagnostic/DiagnosticResults.js`, `DiagnosticItemCard.js`, `PriorityView.js`, `CategoryView.js`, `TableView.js` |
| Diagnostic data | `data/diagnostic-registry.js`, `data/diagnostic-data.js`, `lib/diagnostics.js` |
| SOW display | `components/sow/SowPage.js`, `SowHeader.js`, `SowScopeSection.js`, `SowExecutiveSummary.js` |
| SOW editing | `EditableField.js`, `EditableNumber.js`, `EditableTextArea.js`, `SowRecalculateBar.js`, `InvestmentTable.js` |
| SOW data | `lib/sow.js`, `lib/sow-sections.js`, `lib/sow-auto-generate.js` |
| SOW pages | `pages/sow/index.js`, `pages/sow/[id]/index.js` |
| Engagement | `pages/try-leanscale/engagement.js` |
| Styles | `styles/globals.css` |
