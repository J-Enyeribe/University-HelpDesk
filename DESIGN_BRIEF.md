# KCA University IT Helpdesk — Design Brief

## 1. Feature Summary

A **role-based ticketing web application** for KCA University ICT Directorate that replaces informal verbal/email fault reporting with a structured system. Three distinct user roles (Students, ICT Technicians, ICT Director) interact with tickets through a defined lifecycle: **Open → Assigned → In Progress → Resolved → Closed** (with Reopen capability). The system provides role-appropriate dashboards, real-time status tracking, audit trails, and PDF resolution reports for institutional record-keeping.

## 2. Primary User Actions

| Role | Primary Action | Success Metric |
|------|----------------|----------------|
| **Student** | Submit a ticket in < 60 seconds on mobile | Time-to-submit < 60s; < 5% abandonment |
| **Technician** | Update ticket status & document resolution in < 30s | Status updates per hour; resolution note completion rate |
| **Director** | View dashboard & generate PDF report in < 3 clicks | Report generation frequency; dashboard daily active use |

## 3. Design Direction

**Expresses the Design Context (`.impeccable.md`):**
- **Clean Institutional** aesthetic — trustworthy, structured, calm
- **Navy (`#192C57`)** as primary brand color for headings, navigation, primary actions
- **Gold (`#CBAE2D`)** as accent for CTAs, focus rings, status highlights, active states
- **Poppins (display) + Lato (body) + JetBrains Mono (technical)** — distinctive, not generic
- **Light mode primary** (institutional trust), **dark mode fully supported** (technician preference)
- **No AI slop tells**: no side-stripe borders, no gradient text, no nested cards, no purple gradients

**Feels like:** GitHub Issues meets Linear.app meets GOV.UK — functional, transparent, accessible, calm.

## 4. Layout Strategy

**Global Shell (Authenticated):**
- **Persistent Sidebar** (280px desktop, collapsible to 64px, drawer on mobile) — role-aware navigation
- **Top Header** (64px) — breadcrumbs, page title, notifications, user menu, theme toggle
- **Main Content** — fluid max-width 1400px, centered, generous padding (24px desktop, 16px mobile)

**Role-Specific Layouts:**

| View | Layout Approach |
|------|-----------------|
| **Student Ticket List** | Card-based on mobile (thumb-scannable), table on desktop (>768px). Empty state with prominent "Report Issue" CTA. |
| **Student Ticket Detail** | Single column, chronological: header (status badge + metadata) → description → timeline/logs → comments → action bar. |
| **Technician Queue** | Two-column: left sidebar (filters + quick stats) + right main (ticket table with inline status actions). Keyboard shortcuts visible. |
| **Director Dashboard** | Asymmetric grid: 3 stat cards (top) → 2 charts (middle, 2/3 + 1/3) → recent tickets table (bottom). Date-range picker persistent. |
| **Director All Tickets** | Full-width data table with column visibility toggle, advanced filters in slide-over panel, bulk actions toolbar. |
| **Ticket Creation** | Single-page progressive form: Required fields first (title, category, description) → Optional (device, location, priority) → Submit. |

**Visual Rhythm:** Varied spacing (not uniform cards). Tight groupings for related fields (12px), generous separation between sections (32px). Asymmetric emphasis — primary actions larger, secondary actions ghost-style.

## 5. Key States

### Student Flows
| State | Description | User Needs |
|-------|-------------|------------|
| **Landing (unauthenticated)** | Clean hero with KCA branding, "Report an Issue" / "Login" CTAs | Understand purpose, quick entry |
| **Login/Register** | Split-screen (form left, brand right on desktop), inline validation | Fast access, clear errors |
| **Ticket List — Empty** | Illustration + "No tickets yet" + primary "Report Issue" button | Know what to do next |
| **Ticket List — Loading** | Skeleton cards (mobile) / skeleton rows (desktop) | Perceived performance |
| **Ticket List — Populated** | Filter tabs (All/Open/Closed), search, pagination | Scan status, find specific ticket |
| **Ticket Detail — Open** | Full context: status timeline, description, comment box | Track progress, add info |
| **Ticket Detail — Closed** | Resolution summary prominent, "Reopen" button accessible | Confirm fix or dispute |
| **Create Ticket — Success** | Toast + redirect to ticket detail with "Your ticket #HD-1234 is submitted" | Confirmation, next steps |

### Technician Flows
| State | Description | User Needs |
|-------|-------------|------------|
| **Queue — Empty** | "No tickets assigned" + "Check unassigned pool" link | Know where to find work |
| **Queue — Loading** | Skeleton table rows | Perceived performance |
| **Queue — Populated** | Grouped by status (Assigned → In Progress), inline status dropdown, priority badges | Triage quickly, act fast |
| **Ticket Detail — Technician** | Student view + status transition control (dropdown), resolution notes field, "Reassign" button | Update status, document fix |
| **Status Transition** | Modal with required note for Resolved/Closed, valid next states only | Prevent invalid transitions |

### Director Flows
| State | Description | User Needs |
|-------|-------------|------------|
| **Dashboard — Loading** | Skeleton stat cards + chart placeholders | Perceived performance |
| **Dashboard — Data** | Stats cards (large numbers, trend indicators), charts (responsive), recent tickets | At-a-glance health |
| **All Tickets — Loading** | Skeleton table | Perceived performance |
| **All Tickets — Data** | Dense table, multi-select, bulk assign/export, column picker | Manage at scale |
| **User Management** | Table with role badges, inline role edit, deactivate toggle | Administer access |
| **PDF Generation** | Loading spinner in button → auto-download | Get report fast |

### Universal States
| State | Handling |
|-------|----------|
| **Error (API)** | Toast with actionable message ("Failed to load tickets. Retry?"), not raw error codes |
| **Network Offline** | Banner "You're offline. Changes will sync when reconnected." + queue mutations |
| **Unauthorized** | Redirect to login with `?redirect=` preserve intent |
| **Not Found** | Friendly 404 with "Back to Dashboard" + search |
| **Session Expired** | Modal "Session expired. Log in again?" with one-click re-auth |

## 6. Interaction Model

**Navigation:**
- Sidebar: hover → expand labels (collapsed), click → navigate, keyboard: `Tab`/`Enter`
- Breadcrumbs: click any segment to navigate up
- Deep links: `/tickets/HD-1234` opens detail directly

**Ticket Creation (Student):**
1. Click "Report Issue" → `/tickets/new`
2. Progressive form: Title (required) → Category (required) → Description (required, min 20 chars) → Priority (default Medium) → Device/Location (optional)
3. Inline validation on blur, submit disabled until valid
4. Submit → optimistic UI: ticket appears in list with "Submitting..." badge → server confirms → badge removed

**Ticket List (All Roles):**
- **Filters:** Tabs (status), Select (category), Date picker (range), Search (debounced 300ms)
- **Sort:** Click column header (createdAt, status, priority), toggle asc/desc
- **Pagination:** 20/page, "Load more" on mobile, numbered on desktop
- **Row click:** Navigate to detail (student/tech), checkbox select (director bulk)

**Ticket Detail:**
- **Timeline/Logs:** Auto-expanded for recent, collapsible older entries
- **Comments:** Real-time feel (SWR revalidate on focus), markdown support (basic)
- **Actions:** Sticky bottom bar on mobile, right-aligned on desktop
  - Student: "Add Comment", "Reopen" (if closed)
  - Technician: Status dropdown, "Add Resolution Note", "Reassign"
  - Director: All above + "Assign Technician", "Delete"

**Status Transitions (Technician/Director):**
```
OPEN → ASSIGNED (Director assigns)
ASSIGNED → IN_PROGRESS (Tech starts work)
IN_PROGRESS → RESOLVED (Tech completes, requires note)
RESOLVED → CLOSED (Student confirms OR auto-close after 7 days)
CLOSED → REOPENED (Student disputes)
REOPENED → ASSIGNED (Back to pool)
```
- Invalid transitions hidden/disabled
- Note required for RESOLVED/CLOSED/REOPENED
- Optimistic update → server confirm → rollback on error with toast

**PDF Generation:**
- Single ticket: Button in detail view → `GET /api/tickets/[id]/pdf` → auto-download `HD-1234-resolution.pdf`
- Range report: Director dashboard → "Export Report" → date picker modal → `GET /api/reports/range?from=...&to=...` → auto-download `helpdesk-report-2026-Q1.pdf`

**Keyboard Shortcuts (Technician/Director):**
- `j`/`k` — next/previous ticket in queue
- `Enter` — open selected ticket
- `s` — focus status dropdown
- `c` — focus comment box
- `?` — show shortcuts help

## 7. Content Requirements

**Microcopy (Tone: Clear, Helpful, Human):**

| Context | Copy |
|---------|------|
| **Empty ticket list (student)** | "No tickets yet. When something breaks — Wi-Fi, portal, lab PC — report it here and we'll track it to resolution." |
| **Empty queue (technician)** | "No tickets assigned. [View unassigned pool →] to pick up new work." |
| **Ticket submitted** | "Ticket #HD-1234 submitted. A technician will be assigned shortly. You'll get updates here." |
| **Status changed toast** | "Ticket #HD-1234 moved to *In Progress* by J. Kamau." |
| **Resolution note prompt** | "Describe what you fixed (required for closure). This helps the student and future reference." |
| **Reopen confirmation** | "Reopen this ticket? The technician will be notified. Only reopen if the issue isn't actually fixed." |
| **PDF generating** | "Preparing your report…" (spinner in button) |
| **Error generic** | "Something went wrong. Please try again. If it persists, contact ICT support." |
| **Login error** | "Invalid email or password. Forgot your password? [Reset link — stub v1]" |

**Dynamic Content Ranges:**
- Ticket title: 5–100 chars
- Description: 20–5000 chars
- Comments: 1–2000 chars
- Resolution note: 10–3000 chars
- Ticket list: 0–500+ (paginated)
- Dashboard stats: 0–10,000+ tickets

**Labels & ARIA:**
- Status badges: `aria-label="Status: Open"` (not just color)
- Priority: `aria-label="Priority: High"`
- Tables: proper `<th scope="col">`, row headers for detail views
- Forms: `<label for="...">` always, `aria-describedby` for hints/errors
- Modals: `aria-modal="true"`, `aria-labelledby` title, focus trap

## 8. Recommended References (from impeccable)

| Reference | Applies To |
|-----------|------------|
| `reference/interaction-design.md` | Forms (ticket creation, login), focus management, loading patterns, optimistic UI |
| `reference/spatial-design.md` | Asymmetric dashboard layouts, container queries for sidebar/card responsiveness, spacing rhythm |
| `reference/typography.md` | Type scale (fixed rem for app), heading hierarchy, monospace for ticket IDs/codes |
| `reference/color-and-contrast.md` | OKLCH tokens, status color mapping (accessible), dark mode tinting toward navy |
| `reference/motion-design.md` | Staggered entrance (100ms), 200ms transitions, `prefers-reduced-motion`, grid-template-rows for accordion |
| `reference/responsive-design.md` | Mobile-first ticket creation, table→card flip at 768px, sidebar drawer, touch targets 44px |
| `reference/ux-writing.md` | Empty states that teach, error messages with action, no redundant headers |

## 9. Open Questions

1. **Auto-assignment logic**: Round-robin by current workload? Or Director-only manual assignment for v1?
2. **SLA/Escalation**: Should tickets auto-escalate after X hours unassigned? (v2?)
3. **Attachments**: File uploads for screenshots/error logs? (v1 scope says optional)
4. **Email notifications**: Implement in v1 or stub? (Proposal says "optional")
5. **Ticket ID format**: `HD-YYYY-NNNN` (e.g., HD-2026-0042) or UUID? Human-readable preferred.
6. **Auto-close timer**: 7 days after Resolved? Configurable?
7. **Technician "unassigned pool" view**: Separate tab or filter?
8. **Director "technician workload" metric**: Simple count or weighted by priority?

---

*Generated via `/shape` — this brief guides all design and implementation decisions for the KCA University IT Helpdesk System.*