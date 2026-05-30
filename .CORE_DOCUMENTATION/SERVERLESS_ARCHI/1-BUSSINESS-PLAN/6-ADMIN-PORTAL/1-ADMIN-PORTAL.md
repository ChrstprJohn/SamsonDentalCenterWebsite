# Admin Portal

## Overview

The admin portal is the full-control management interface for clinic owners and system administrators. It provides comprehensive dashboards, management tools for all resources, and a clinic configuration panel for system-wide settings.

---

## Portal Pages & Navigation

| Page | Description |
|---|---|
| **Dashboard** | Overview analytics; prioritizes upcoming appointments and pending requests |
| **Manage Services** | Create, edit, and delete clinic services |
| **Manage Doctors** | Create, edit, delete, assign availability, and create staff accounts |
| **Manage Users** | View, edit, and deactivate patient accounts |
| **Manage Secretaries** | Create, edit, deactivate, and assign secretary accounts |
| **Clinic Config** | Edit system-wide clinic settings without code deployment |
| **Audit Log** | Comprehensive read-only log across all roles and actions |

---

## Dashboard

- Prioritizes:
  1. **Pending requests** requiring attention.
  2. **Upcoming appointments** for the current and next few days.
- Displays high-level analytics:
  - Total appointments (by status).
  - Upcoming appointment count.
  - Pending requests count.
  - Recent audit activity.

---

## Manage Services

| Action | Details |
|---|---|
| Create | Add a new clinic service with name, description, duration, and type (General/Specialized) |
| Edit | Update service details |
| Delete | Remove a service (verify no active appointments linked) |

- Services with variable durations require the booking engine to find contiguous free time blocks.

---

## Manage Doctors

| Action | Details |
|---|---|
| Create | Add a new doctor profile and provision their portal login |
| Edit | Update doctor information and specialties |
| Delete | Remove a doctor profile (verify no active appointments linked) |
| Assign Availability | Set working hours, breaks, and days off per doctor |

- Doctors have **custom schedules** (not tied to clinic-wide hours).
- Doctor calendar conflicts are enforced at the database level with a unique constraint on `(doctor_id, date, time_slot)`.
- If a double-booking occurs, an admin must manually resolve it.

---

## Manage Users

| Action | Details |
|---|---|
| View | See all registered patient accounts |
| Edit | Update user profile information |
| Deactivate | Disable a user account (reversible) |

- Admins can view user **reliability counters** (cancel, no-show, reschedule history).

---

## Manage Secretaries

| Action | Details |
|---|---|
| Create | Provision a new secretary account (secretaries do not self-register) |
| Edit | Update secretary profile and permissions |
| Deactivate | Disable a secretary account |
| Assign to Clinics | If multi-clinic support is added later |

---

## Clinic Config

The clinic config panel allows system-wide settings to be changed **without deploying code**:

| Setting | Default | Notes |
|---|---|---|
| Booking open/closed status | Open | Toggle to enable maintenance mode |
| Maintenance message | — | Displayed on booking page when closed |
| Clinic name | — | Shown on public site and documents |
| Clinic address | — | Shown in footer and contact section |
| Clinic phone | — | Shown in footer and contact section |
| Clinic email | — | Shown in footer and contact section |
| Operating hours | — | Shown in footer; used in booking availability |
| Appointment slot duration | — | Default duration unit for booking slots |
| Max reschedules per appointment | 1 | Configurable user reschedule limit |
| Other clinic-wide constants | — | Extendable without code changes |

---

## Audit Log

- Comprehensive read-only log across **all roles** (users, secretaries, admins).
- Entries include:
  - Actor (name and role)
  - Timestamp
  - Action type
  - Reason
  - Target appointment or resource
- Only **final decisions** are logged — not intermediate or draft states.
- Admins can filter audit logs by date, role, action type, and actor.

---

## Admin Role Capabilities Summary

| Capability | Allowed |
|---|---|
| View and manage all services | ✅ |
| View and manage all doctors | ✅ |
| View and manage all users | ✅ |
| Create and manage secretary and doctor accounts | ✅ |
| Configure clinic settings | ✅ |
| Toggle booking open/closed | ✅ |
| Set maintenance message | ✅ |
| View comprehensive dashboard analytics | ✅ |
| View all audit logs | ✅ |
| View financial invoices | ✅ (read-only final records) |
| Reschedule appointments (unlimited) | ✅ |
| Cancel appointments | ✅ (with reason) |
| Approve / reject appointments | ✅ |
