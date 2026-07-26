# Secretary Portal V2 - Feature Improvement & UI Optimization Task List

## Overview & Goal
This task list documents all essential UI enhancements, performance optimizations, state management improvements, and feature completions for the Secretary Portal V2 pages.

---

## Group 1: Core Daily Operations (Focus on UI Polish, Speed & Smooth State Updates)

These pages are functionally established, but several user actions currently trigger a **full page reload / full view re-render** upon saving, or suffer from silent saving without feedback toasts/alerts.

### 1. Chat Inbox (`/secretary-v2/chat`)
- [ ] **Fix Full Page Reloads on Save**: Updating appointment details or saving notes inside the right panel currently reloads/re-fetches the entire view. Change this to local state mutation.
- [ ] **Missing Action Alerts & Toasts**: Saving notes, sending receipts, or switching thread status completes quietly without visual toast alerts. Add interactive toast alerts on success/failure.
- [ ] **UI Polish & Animations**: Refine message balloon animations and mobile response drawer transition.
- [ ] **Scroll Memory**: Retain scroll position when switching between active and archived chat tabs.

### 2. Appointment Requests (`/secretary-v2/pending`)
- [ ] **Fix Full Page Reloads on Approval/Rejection**: Approving or rejecting a pending request triggers a full page refetch. Convert to optimistic item removal with smooth exit animation.
- [ ] **Missing Action Alerts & Toasts**: Replace standard browser `alert()` popups or silent saves with modern toast feedback notifications.
- [ ] **Filter & Search Speed**: Memoize table search and doctor filter dropdowns to provide instant <10ms text filtering without lagging the list.

### 3. Calendar & Booking (`/secretary-v2/book`)
- [ ] **Fix Full Page Reloads on Booking**: Booking a new appointment or saving a schedule change causes the entire calendar view to reload. Update local appointment state immediately upon creation.
- [ ] **Missing Action Alerts & Toasts**: Show explicit progress overlays during slot reservation and display interactive success/error toasts.
- [ ] **Fast Slot Loading & Speed**: Cache fetched doctor schedules and available time slots locally to eliminate slot picker loading flicker.
- [ ] **Responsive Day Grid**: Improve high-DPI and mobile calendar grid layout so time slots don't overlap on smaller viewports.

### 4. Appointments Directory (`/secretary-v2/appointments`)
- [ ] **Fix Full Page Reloads on Edit/Cancel/Reschedule**: Modifying guest info, rescheduling, or cancelling an appointment reloads the entire page. Convert to optimistic row/drawer state updates.
- [ ] **Missing Action Alerts & Toasts**: Display confirmation toasts containing direct links to newly updated appointment details after saving.
- [ ] **Pagination & Search Speed**: Implement client-side virtualization or cached pagination for fast scroll through large historical appointment sets.

### 5. Check-In / Out Tracker (`/secretary-v2/check-in`)
- [ ] **Fix Full Page Reloads on Checkout/Resolution**: Completing a patient checkout, resolving a no-show, or editing details triggers a full page re-fetch. Update column items optimistically.
- [ ] **Missing Action Alerts & Toasts**: Add clear toast notifications and receipt confirmation alerts when completing patient checkout and resolving no-shows.
- [ ] **Height & Overflow Polish**: Retain fixed card heights (`shrink-0`) across all 4 columns for clean, consistent vertical scrolling.

---

## Group 2: Clinic Catalogs

### 1. Doctors Directory (`/secretary-v2/doctors`)
- [ ] **Functional Status**: Operational for viewing doctor profiles, sub-specialties, and shift preferences.
- [ ] **Fix Reloads & Missing Alerts**:
  - Convert doctor profile edit forms to auto-saving drawer/modal with instant feedback toasts instead of full page refresh.
  - Add quick doctor availability toggle (Active/On-Leave) directly on directory cards with local state update.

### 2. Services Catalog (`/secretary-v2/services`)
- [ ] **Functional Status**: Partially operational for viewing clinic services and price tiers.
- [ ] **Fix Reloads & Missing Alerts**:
  - Add service creation and edit modal forms with price formatting and category selector.
  - Implement instant status feedback on service enable/disable toggles with toasts.
  - Eliminate page refresh on service search and category filtering.

---

## Group 3: System & Logs

### 1. Notifications (`/secretary-v2/notifications`)
- [ ] **Functional Status**: In-app secretary notifications list is operational.
- [ ] **UI & Alert Improvements**:
  - Implement "Mark All as Read" with optimistic badge count decay.
  - Add real-time visual indicator for incoming reminder alerts.

### 2. Email Logs (`/secretary-v2/emails`)
- [ ] **Functional Status**: Read-only log viewer currently available.
- [ ] **Future Feature & UI Roadmap**:
  - Convert email log view into a full Outbox / Email Inbox dashboard for tracking email delivery, bounce rates, and manual resends.
  - Add resend action buttons with instant feedback toasts.

### 3. Audit Logs (`/secretary-v2/audits`)
- [ ] **Functional Status**: Read-only activity audit trail currently available.
- [ ] **Future Feature & UI Roadmap**:
  - Enhance audit log filter controls (Filter by Staff Member, Action Type, Date Range).
  - Add detailed change diff viewer modal (showing before/after values for edited appointment/patient records).

### 4. Profile Settings (`/secretary-v2/profile`)
- [ ] **Functional Status**: Functional for viewing and updating secretary profile details.
- [ ] **Fix Reloads & Missing Alerts**:
  - Add inline validation and immediate success/error toast alerts on avatar update or password change.
  - Eliminate full page reload on profile save.
