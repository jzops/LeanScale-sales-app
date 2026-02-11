# Improvement Plan — Post-PR11

**Date:** 2026-02-11  
**Source:** `docs/analysis/post-pr11-review.md`  
**Organized into sub-agent tasks** (each 3-5 minutes of focused work)

---

## Task 1: Fix Diagnostic CTA Banner
**Priority:** P0 | **Est:** 3 min

**Goal:** Make the bottom CTA banner on diagnostic pages actionable with links to SOW and engagement.

**Files:**
- `components/diagnostic/DiagnosticResults.js` (lines 210-225)

**Steps:**
1. Add two buttons inside the existing `cta-banner` div
2. Primary button: "View Statement of Work" → `customerPath('/sow')` — show only when `hasDiagnosticResult && !isDemo`
3. Secondary button: "View Engagement Overview" → `customerPath('/try-leanscale/engagement')`
4. For demo users: "Start Your Diagnostic" → `customerPath('/try-leanscale/start')`
5. Style buttons consistently with existing `.nav-cta` / `.btn` patterns

**Acceptance:** CTA banner has clickable buttons that navigate correctly for both demo and customer views.

---

## Task 2: Fix SOW Read-Only Logic
**Priority:** P0 | **Est:** 3 min

**Goal:** Fix the inverted `isReadOnly` logic that makes real customers read-only and demo users editable.

**Files:**
- `pages/sow/[id]/index.js` (line ~105)

**Steps:**
1. Change `const isReadOnly = customer?.isDemo === false;` to a proper check
2. For now (no auth system): `const isReadOnly = false;` — all users can edit (admin-only pages aren't publicly linked)
3. Or better: add a query param `?edit=true` that enables editing, default to read-only for customer portal views
4. Add a comment explaining the auth gap and future plan

**Acceptance:** Admin users visiting `/sow/{id}` can edit. Customer portal views (`/c/{slug}/sow/{id}`) are read-only.

---

## Task 3: Fix Cookie Middleware Consistency
**Priority:** P0 | **Est:** 5 min

**Goal:** Prevent customer slug from persisting incorrectly when navigating between customer portal and main site.

**Files:**
- `middleware.js` (lines 30-36 and 48-60)

**Steps:**
1. For `/c/{slug}/` routes: Keep `maxAge: 86400` (24h persistent) — this is correct
2. For non-`/c/` routes: Explicitly set `maxAge: 0` or use `response.cookies.delete('customer-slug')` then re-set as session cookie
3. Alternative: Use a **different cookie name** for path-based routing (e.g., `customer-portal-slug`) vs. the general detection cookie
4. Test scenarios:
   - Visit `/c/formance/diagnostic` → cookie = `formance`
   - Navigate to `/` → cookie = `demo` (session)
   - Return to `/c/formance/diagnostic` → cookie = `formance` again

**Acceptance:** Cookie is always correct for the current route. No cross-contamination.

---

## Task 4: Replace Hardcoded `/c/` URLs with `customerPath()`
**Priority:** P1 | **Est:** 5 min

**Goal:** Eliminate all manually constructed `/c/{slug}/` URLs to prevent routing breakage.

**Files:**
- `components/sow/SowScopeSection.js` (~line 200)
- `components/sow/SowHeader.js` (~line 110)
- Run `grep -rn '"/c/' components/ pages/` to find all occurrences

**Steps:**
1. In `SowScopeSection.js`: Replace manual `diagUrl` construction with `customerPath()`
   - Pass `customerPath` as a prop (already available in parent `SowPage.js` via `useCustomer`)
2. In `SowHeader.js`: Replace manual builder link with `customerPath(`/sow/${sow.id}/build`)`
3. For any other occurrences found by grep: Replace with `customerPath()`
4. Ensure `customerPath` is available in each component (either via prop drilling or `useCustomer()` hook)

**Acceptance:** `grep -rn '"/c/' components/ pages/` returns zero results (excluding test files and comments).

---

## Task 5: Make SOW Content Fields Editable (Team, Assumptions, Acceptance Criteria)
**Priority:** P2 | **Est:** 5 min

**Goal:** Add inline editing for Team, Assumptions, and Acceptance Criteria sections in the SOW page.

**Files:**
- `components/sow/SowPage.js` (lines 225-275)
- May create: `components/sow/EditableList.js` (reusable list editor)

**Steps:**
1. Create `EditableList` component modeled after the deliverables editor in `SowScopeSection.js`:
   - Render items as `<li>` with remove button
   - Add input + "Add" button at bottom
   - `onCommit` callback with updated array
2. Replace static Team render in `SowPage.js` with `EditableList`
3. Replace static Assumptions render with `EditableList`
4. Replace static Acceptance Criteria render with `EditableList`
5. Wire up to `handleContentFieldChange('team', newArray)` etc.
6. Fix `handleRecalculate` to detect ANY `content.*` dirty field (not just `executive_summary`)

**Acceptance:** All three sections editable inline. Changes tracked as dirty. Saved via Recalculate bar.

---

## Task 6: Add "New Section" Button to SOW
**Priority:** P2 | **Est:** 3 min

**Goal:** Allow adding blank sections to a SOW without going through the Builder.

**Files:**
- `components/sow/SowPage.js` (after the sections `motion.div` block)

**Steps:**
1. Add an "Add Section" button after the last section
2. On click: `POST /api/sow/{id}/sections` with default values (title: "New Section", hours: 0, rate: 0)
3. Append returned section to `localSections` state
4. Update `serverSectionsRef` to include the new section
5. Auto-focus the new section's title for immediate editing

**Acceptance:** "Add Section" button visible in edit mode. Creates a new editable section.

---

## Task 7: Fix Recalculate Save for All Content Fields
**Priority:** P2 | **Est:** 3 min

**Goal:** Ensure the recalculate function saves all dirty content fields, not just executive_summary.

**Files:**
- `components/sow/SowPage.js` (`handleRecalculate` function, ~line 115)

**Steps:**
1. Change the content dirty check from:
   ```js
   if (dirtyFields.has('content.executive_summary')) {
     sowUpdates.content = { ...localSow.content };
   }
   ```
   To:
   ```js
   const hasContentChanges = [...dirtyFields].some(f => f.startsWith('content.'));
   if (hasContentChanges) {
     sowUpdates.content = { ...localSow.content };
   }
   ```
2. This already saves all content (because of the spread), just needs the broader trigger

**Acceptance:** Editing any content field (team, assumptions, etc.) triggers save on Recalculate.

---

## Task 8: Build Diagnostic Item Detail Modal
**Priority:** P3 | **Est:** 5 min

**Goal:** Replace the NoteDrawer with a proper modal for viewing/editing diagnostic item details.

**Files:**
- New: `components/diagnostic/DiagnosticItemModal.js`
- Modify: `components/diagnostic/DiagnosticResults.js`
- Modify: `components/diagnostic/DiagnosticItemCard.js`

**Steps:**
1. Create `DiagnosticItemModal` component with:
   - Item name header
   - Status selector (same cycle as card)
   - Priority toggle
   - Function/outcome display
   - Notes section (move NoteDrawer content here)
   - Service catalog info (if `item.serviceId` exists)
2. Add state in `DiagnosticResults.js`: `const [modalItem, setModalItem] = useState(null)`
3. On card click (in edit mode): `setModalItem(item)` instead of expanding notes
4. Pass modal open handler down to cards
5. Render modal at the top level of `DiagnosticResults`

**Acceptance:** Clicking a diagnostic item in edit mode opens a centered modal with details and notes.

---

## Task 9: Add Section Reordering UI
**Priority:** P3 | **Est:** 5 min

**Goal:** Allow reordering SOW sections via up/down arrows.

**Files:**
- `components/sow/SowPage.js`
- `components/sow/SowScopeSection.js`
- Backend: `lib/sow-sections.js` `reorderSections()` already exists

**Steps:**
1. Add up/down arrow buttons to each `SowScopeSection` header (next to delete button)
2. On click: Swap the section with its neighbor in `localSections` array
3. Update `sort_order` values
4. Mark as dirty for save via Recalculate bar
5. Alternatively: Save reorder immediately via `PUT /api/sow/{id}/sections/reorder`

**Acceptance:** Sections can be reordered. Order persists after save.

---

## Task 10: Diagnostic Card Touch/Mobile Fixes
**Priority:** P4 | **Est:** 3 min

**Goal:** Fix hover-only interactions that don't work on touch devices.

**Files:**
- `components/diagnostic/DiagnosticItemCard.js` (line ~90: `opacity: 0` on SOW link)
- `styles/globals.css`

**Steps:**
1. Change "View in SOW" link from `opacity: 0` (hover-reveal) to always visible with subtle styling
2. Or use CSS `@media (hover: none)` to show it on touch devices
3. Ensure diagnostic cards have adequate touch targets (min 44x44px for interactive elements)
4. Test card click targets don't conflict between status cycle, priority toggle, and notes

**Acceptance:** All interactive elements on diagnostic cards work on touch devices.

---

## Task 11: SOW Mobile Responsiveness
**Priority:** P4 | **Est:** 5 min

**Goal:** Fix SOW scope section layout on narrow screens.

**Files:**
- `components/sow/SowScopeSection.js`
- `components/sow/SowPage.js`
- `styles/globals.css`

**Steps:**
1. Make the section header (title + hours/rate/subtotal) stack vertically on mobile
2. Add `@media (max-width: 640px)` rules for:
   - Section header: `flex-direction: column`
   - Hours/Rate/Subtotal: horizontal row below title
   - Executive Summary + Diagnostic Score grid: single column
3. Ensure Investment Table has `overflow-x: auto` on mobile
4. Test Recalculate bar content wrapping on narrow screens

**Acceptance:** SOW page readable and usable on 375px wide screen.

---

## Dependency Graph

```
Task 1 (CTA)          — independent
Task 2 (ReadOnly)      — independent
Task 3 (Cookie)        — independent
Task 4 (URLs)          — independent, but easier after Task 3
Task 5 (Editable lists) — depends on Task 7
Task 6 (New Section)   — independent
Task 7 (Content save)  — independent
Task 8 (Modal)         — independent
Task 9 (Reorder)       — independent
Task 10 (Touch)        — independent
Task 11 (Mobile)       — independent
```

**Recommended execution order:** 1, 2, 3, 7, 4, 6, 5, 8, 9, 10, 11
