# Business Plan — Overview

> **Samson Dental Appointment Website**
> Build a dental appointment website with a public landing experience and role-based private portals for users, secretaries, and admins.

---

## Goal

Build a dental appointment website with a public landing experience and role-based private portals for users, secretaries, and admins. The first focus is the business flow, booking logic, and account access flow. System design decisions can be finalized later.

---

## Folder Structure

| Folder | Contents |
|---|---|
| `1-LANDING-PAGE/` | Public site layout, nav, footer |
| `2-AUTH/` | Sign up, login, OTP verification |
| `3-BOOKING/` | Wizard, slot holds, availability rules, status constants |
| `4-USER-PORTAL/` | User dashboard, appointments, notifications |
| `5-SECRETARY-PORTAL/` | Secretary dashboard and workflow |
| `6-ADMIN-PORTAL/` | Admin dashboard, management, clinic config |
| `7-BILLING/` | Invoice workflows and check-out process |
| `8-DOCTOR-PORTAL/` | Doctor dashboard, schedules, and clinical workflows |

---

## Roles Summary

| Role | Core Access |
|---|---|
| **User** | Browse services, book appointments, manage profile and history |
| **Secretary** | Review and act on appointments, check-in/out, execute financial billing, audit |
| **Doctor** | View assigned upcoming appointments, submit clinical treatments |
| **Admin** | Manage everything — services, doctors, users, secretaries, clinic config |

---

## MVP Priority

1. Landing page and service presentation.
2. Authentication with OTP email verification.
3. User booking wizard with dynamic availability and slot holds.
4. Pending appointment workflow.
5. Secretary and admin approval flow with grouped row visibility.
6. Admin management for services, doctors, users, and secretaries.
7. User dashboard, notifications, and appointment tracking.

---

## Technical Direction

- Keep system architecture decisions flexible for now.
- Focus first on business flow and feature planning.

---

## Next Step

Once the business flow is confirmed, move into system design, data model design, and route/module planning.
