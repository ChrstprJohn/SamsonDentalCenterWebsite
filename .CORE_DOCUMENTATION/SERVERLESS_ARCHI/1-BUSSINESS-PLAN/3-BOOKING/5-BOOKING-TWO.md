# Booking — Two-Pronged Architecture (Inquiry + Self-Service)

## Overview

The booking system supports two distinct entry points. They are architecturally separate and must never be mixed in the same queue or status lifecycle.

| Entry Point | Who | Auth Required | Goal |
|---|---|---|---|
| **Landing Page Inquiry Form** | Guest / Unauthenticated Visitor | ❌ No | Capture intent; secretary coordinates the rest via phone/email |
| **Self-Service Booking Wizard** | Logged-in Patient | ✅ Yes | Patient does all the work; secretary only approves |

---

## Entry Point 1 — Landing Page Inquiry Form (Unauthenticated)

### Concept

A low-friction form visible only to **unauthenticated visitors** on the public landing page. It is not a booking — it is an **intent signal**. The guest is expressing interest in scheduling an appointment. The clinic staff then coordinates the actual booking over the phone.

> If a visitor is already logged in, this form is hidden and replaced with a direct link to the Self-Service Booking Wizard inside their portal.

---

### Form Fields

The inquiry form collects the minimum information needed for staff to reach and identify the patient:

| Field | Required | Notes |
|---|---|---|
| First Name | ✅ | |
| Middle Name | ❌ | Optional |
| Last Name | ✅ | |
| Suffix | ❌ | Optional (e.g., Jr., Sr.) |
| Phone Number | ✅ | E.164 format; primary contact for clinic call-back |
| Email Address | ✅ | Used for status notifications after coordination (see Email Role below) |
| Preferred Service | ✅ | Dropdown of active clinic services; treated as intent only — can be changed by secretary |
| Preferred Date | ✅ | Date picker; treated as a rough preference, not a confirmed slot |
| Patient Note | ❌ | Optional text area for patient to describe their specific needs/symptoms |

> **Important:** No time slot, no doctor, and no confirmed schedule is collected at this stage. These are all set later by the secretary during conversion.

---

### Why Email is Required on the Inquiry Form

The guest has no account and no in-app notification channel. Email is the **only delivery channel** available to keep them informed after they submit. Once the secretary converts the inquiry into a real appointment, all subsequent appointment lifecycle notifications (approved, cancelled, rescheduled, reminder, etc.) are sent to the email they provided.

| When | What Email is Used For |
|---|---|
| Immediately after form submission | Confirmation receipt — "We received your request and will contact you shortly." |
| After phone coordination & conversion | Appointment confirmation email with finalized date, time, doctor, and service |
| All subsequent status changes | Approved, Cancelled, Rescheduled, Displaced, Reminder, Completed, No-Show notices |

---

### Inquiry Lifecycle

Inquiries are stored in a **separate table** (`appointment_inquiries`) and have their own status track. They are **never mixed** with the main appointment status lifecycle.

#### Inquiry Status Constants

| Status | Description |
|---|---|
| **New** | Form submitted. Awaiting secretary review and patient call-back. |
| **Contacted** | Secretary has reached out to the patient and is coordinating the final slot. |
| **Converted** | Secretary finalized the booking. A real appointment record has been created and linked. |
| **Dropped** | Patient was unreachable, declined, or the inquiry was dismissed. No appointment created. |

#### Inquiry Status Flow

```
[Guest submits form]
        ↓
   Status: New (Acts as a Scheduling Draft)
        ↓ 
 (Secretary reviews draft, calls patient)
        ↓
 [Agreement reached on Call]            [Patient unreachable / declines]
        ↓                                              ↓
 Secretary configures doctor & slot             Status: Dropped
        ↓                                       (Nothing created in appointments)
 Secretary converts draft
        ↓
 Status: Converted
 linked_appointment_id set
        ↓
 appointments record created 
 → status: Approved (Automatically active; skips pending stage)
```

---

## The Two Flows Visualized Side-by-Side

To understand how the draft inquiry differs from the self-booking path, here is how the data flows from creation to activation:

```
A. SELF-SERVICE BOOKING LIFE (Automated Routing)
┌─────────────────────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│ Patient schedules slot in app   │ ───> │ Appointment created as PENDING  │ ───> │ Secretary reviews & Approves    │
│ (Patient sets all parameters)   │      │ (Occupies calendar slot)        │      │ (Status changes to APPROVED)    │
└─────────────────────────────────┘      └─────────────────────────────────┘      └─────────────────────────────────┘

B. GUEST INQUIRY LIFE (Draft Routing)
┌─────────────────────────────────┐      ┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│ Guest submits form on Landing   │ ───> │ Inquiry created as NEW (Draft)  │ ───> │ Secretary handles call & sets   │
│ (Rough Service & Date intent)   │      │ (Does NOT occupy calendar slot) │      │ doctor, date, time slot         │
└─────────────────────────────────┘      └─────────────────────────────────┘      └─────────────────────────────────┘
                                                                                                   │
                                                                                                   ▼
                                                                                  ┌─────────────────────────────────┐
                                                                                  │ Click Convert: Inquiry status   │
                                                                                  │ becomes CONVERTED; Appointment  │
                                                                                  │ created directly as APPROVED    │
                                                                                  └─────────────────────────────────┘
```

---

### Secretary Workflow — Converting an Inquiry

When a secretary opens an inquiry from the **Triage Queue**, they see the patient's submitted info and a conversion panel alongside it.

#### What the Secretary Can Do During Conversion

| Field | Editable | Notes |
|---|---|---|
| Service | ✅ | **Can be changed.** The original submission is just intent. If the patient changed their mind on the call, the secretary updates this before converting. |
| Preferred Date (original) | Read-only reference | Shown for context from the original form |
| Confirmed Date | ✅ | Secretary picks the final confirmed date |
| Confirmed Time | ✅ | Secretary picks the confirmed time slot |
| Doctor Assignment | ✅ | Secretary assigns the doctor |
| Patient Note (original) | ✅ | **Editable draft.** Populated with the guest's landing page `patient_note`. The secretary can edit/expand this on the call based on patient feedback. Saved to `appointments.user_note`. |
| Secretary Notes | ✅ | Internal field to log notes about the phone call or scheduling process. Saved directly to `appointments.status_reason` (acting as the Approval Note) and recorded in `appointment_status_history.reason`. |

#### Naming of the Action Button
In the Secretary UI, the action button is named **"Confirm & Book"** (or **"Convert to Booking"**). This represents the atomic confirmation of guest details combined with slot scheduling.

#### Dynamic Calendar & Doctor Selection During Conversion

To prevent scheduling conflicts and keep scheduling rules consistent with the User Booking Wizard, the conversion panel implements the exact same logic as Step 2 (`DateTimeStep`) of the patient wizard:

1. **Doctor Selection Dropdown:**
   - **Any Doctor (Default):** The system aggregates availability schedules of all active doctors. The backend will implicitly assign the least busy doctor who is free at the selected time.
   - **Specific Doctor:** The secretary selects a specific doctor if requested by the patient on the call.
2. **Date Picker:**
   - Highlights available dates dynamically based on the selected **Service** and **Doctor Selection** choice.
3. **Time Slot Picker:**
   - Queries live availability from the exact same engine (`getAvailableTimeSlots`).
   - Slices the open timeslots mathematically based on the selected **Service Duration** (duration updates dynamically if the secretary edits the Service).
   - Hides slots that overlap with existing `APPROVED` or `PENDING` appointments.
4. **Validation:**
   - The secretary cannot select a blocked slot in the UI.
   - The backend validates conflict-free slot availability atomically at final submission.

#### On Submission of Conversion

The system performs the following atomically:

1. Validates the chosen slot is still available.
2. Creates an `appointments` record with:
   - `source: STAFF_CREATED`
   - `status: Approved`
   - Patient name parts and contact from the inquiry (no linked user account)
   - Finalized service, doctor, date, and time
   - `user_note` populated automatically with the `patient_note` from the inquiry draft
   - `status_reason` populated with the `secretary_notes` typed during conversion
3. Links `appointment_inquiries.linked_appointment_id` to the new appointment.
4. Sets `appointment_inquiries.status` to `Converted`.
5. Triggers an email to the patient with the confirmed appointment details.

If the slot was taken between selection and submit, the transaction rolls back and the secretary is prompted to pick a new slot.

---

### UI Placement

| Location | What Shows |
|---|---|
| Public landing page (unauthenticated) | Inquiry form is visible |
| Public landing page (authenticated) | Inquiry form is hidden; replaced with "Book an Appointment" link to the self-service wizard |
| Secretary portal | New **Triage Queue** section separate from the Approval Queue |
| Secretary triage item view | Inquiry details + call notes + conversion panel with dynamic calendar |

---

## Entry Point 2 — Self-Service Booking Wizard (Authenticated)

> This flow is already fully documented in [`1-BOOKING-WIZARD.md`](./1-BOOKING-WIZARD.md). The details below summarize how it relates to this two-pronged architecture.

### Concept

A logged-in patient does all the scheduling work themselves. They browse real-time availability, pick a service, doctor, date, and time slot — all conflict-checked dynamically — then submit. The resulting appointment enters the standard `Pending` status and awaits secretary approval.

The secretary's role here is purely **validation and approval**. There is no coordination step, no parameter-setting, and no phone call required.

| Field Set By | Who |
|---|---|
| Service | Patient |
| Doctor preference | Patient (Any or Specific) |
| Date and Time | Patient (from live availability) |
| Approval | Secretary |

### Appointment Source Tag

Self-booked appointments are tagged with `source: SELF_BOOKED` so the secretary dashboard can visually distinguish them from staff-created ones.

---

## Key Architectural Rule: Two Separate Entities

| Dimension | Inquiry (`appointment_inquiries`) | Appointment (`appointments`) |
|---|---|---|
| Has confirmed slot | ❌ No | ✅ Yes |
| Blocks availability | ❌ No | ✅ Yes (Pending + Approved) |
| Has user account | ❌ No (guest) | ✅ Yes (self-booked) or ❌ No (staff-created) |
| In-app notifications | ❌ Not applicable | ✅ Yes (for self-booked) |
| Email notifications | ✅ Yes (only channel available) | ✅ Yes (all status changes) |
| Reliability tracking | ❌ Not tracked | ✅ Yes (cancel, no-show, reschedule counters) |
| Secretary queue | Triage Queue | Approval Queue |
| Status lifecycle | New → Contacted → Converted / Dropped | Full appointment status lifecycle (see `3-APPOINTMENT-STATUSES.md`) |

---

## Notifications Summary for Inquiry Flow

Since the patient has no account, all notifications are **email-only**.

| Trigger | Email Sent |
|---|---|
| Inquiry form submitted | "We received your appointment request. We will contact you shortly to confirm your schedule." |
| Inquiry converted to appointment | Full appointment confirmation — date, time, doctor, service, clinic address. |
| Appointment Cancelled (by clinic) | Cancellation notice with reason and instructions to re-submit an inquiry or call the clinic. |
| Appointment Rescheduled | Updated schedule details. |
| Appointment Reminder | Day-before or configurable reminder. |
| Appointment Completed | Post-visit summary. |
| Inquiry Dropped | Optional — "We were unable to reach you. Please contact the clinic to reschedule." |

---

## Availability Rules — No Change to Core Logic

Inquiries **do not consume or block any slots**. Only `Pending` and `Approved` appointments affect availability. This keeps the availability engine clean regardless of how many open inquiries exist.

The secretary's conversion panel pulls availability using the exact same rules defined in [`2-AVAILABILITY-RULES.md`](./2-AVAILABILITY-RULES.md).

---

## Source Field on Appointments Table

All appointment records must carry a `source` field to track origin:

| Source Value | Created By | Description |
|---|---|---|
| `SELF_BOOKED` | Patient (authenticated) | Created via the self-service booking wizard |
| `STAFF_CREATED` | Secretary | Created by converting an inquiry, or manually created by staff |

This field is informational and does not affect the appointment status lifecycle. It is visible to secretaries and admins for audit and reporting.

---

## Open Questions

- None. Architecture is frozen.
