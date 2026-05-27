# Booking — Availability Rules

## Overview

Availability rules govern which time slots are shown to users in the booking wizard. They protect inventory integrity, prevent double-booking, and ensure the public time picker only shows genuinely available slots.

---

## Public Availability Exclusions

The public time picker must **exclude** the following slot states:

| Excluded State | Reason |
|---|---|
| Approved appointments | Slot is already taken |
| Pending appointments | Slot is under review and should not be double-offered |

Rejected and cancelled appointments **return inventory** to the public availability pool.

---

## Caching & Revalidation

| Rule | Detail |
|---|---|
| Client-side cache duration | 2–5 minutes |
| Revalidation trigger | Server revalidates at the final submission step (Step 4 of Wizard) |
| Stale slot behavior | If the slot was taken by another user during the wizard flow, the final submission fails and the user is prompted to pick a new time |
| Eager refresh | Availability is **not** refreshed eagerly on every filter change — only re-fetched if submission fails |

---

## Atomicity & Double-Booking Prevention

- Double-booking is prevented at the database level using a transaction during final submission.
- Since there are no slot holds, two users can start the wizard for the same slot. The first to submit wins; the second receives an error and must select a new time.

---

## Q&A — Common Edge Cases

**Q: What happens if a Pending request sits too long?**  
A: Pending requests auto-expire after a clinic-defined SLA and return inventory to the availability pool. The user is notified that the request expired.

**Q: How are overlaps calculated across different service durations?**  
A: Availability uses the full time range `[start, end)` based on service duration plus any clinic-defined buffer. Any overlap with an existing Approved or Pending appointment blocks the slot.

**Q: How is capacity handled if there are multiple doctors**  
A: Availability is generated per resource (doctor). A slot is only shown when at least one eligible resource has capacity. Final submission enforces resource-level uniqueness.

**Q: Which timezone is used for availability?**  
A: Slots are generated in the clinic's timezone and stored in UTC. All display formatting is localized back to the clinic timezone.

---

## Booking Closed / Maintenance Mode

- If booking is toggled **off** in clinic config, the booking entry page shows a **closed page** with a message and no booking actions.
- Admins can set a custom maintenance message from the clinic config panel.
- When booking is closed, no slots are shown and no holds can be created.
