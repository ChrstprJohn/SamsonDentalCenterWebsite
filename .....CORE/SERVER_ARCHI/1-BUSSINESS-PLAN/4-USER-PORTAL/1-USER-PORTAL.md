# User Portal

## Overview

The user portal is the private dashboard for authenticated and verified patients. It allows them to manage their profile, track their appointments, and stay informed through notifications.

---

## Portal Pages & Navigation

| Page | Description |
|---|---|
| **Dashboard** | Overview of upcoming appointments and recent activity |
| **Upcoming Appointments** | List of approved and pending future appointments |
| **Appointment History** | Past and completed appointments |
| **My Requests** | All submitted booking requests and their current statuses |
| **Notifications** | In-app notification center |
| **Profile** | View and edit personal information and avatar |
| **Account Settings** | Email, password, notification preferences |

---

## Profile

- Displays the user's registered identity fields (first, middle, last name, suffix, contact number, email).
- **Avatar** field is available for customization — editable and optional.
- Users can update their profile information at any time.

---

## Dashboard

- Prioritizes **upcoming appointments** and **pending requests** at a glance.
- Shows a quick summary of recent notification activity.
- Provides direct action shortcuts (e.g., "Book an Appointment", "View History").

---

## Appointments

### Upcoming Appointments
- Lists all appointments with status: **Approved** or **Pending**.
- Each appointment row shows: service, date/time, doctor, status badge.
- Available actions per appointment:
  - **Cancel** (if pending or approved, with a reason).
  - **Reschedule** (if approved and reschedule limit not yet reached).
  - If reschedule limit is reached, a UI indicator is shown with a message to contact staff.

### Appointment History
- Lists completed, cancelled, rejected, and displaced appointments.
- Read-only; no actions available.
- Useful for tracking past visits and outcomes.

### My Requests
- All submitted booking requests regardless of status.
- Provides a unified view of the user's full appointment lifecycle.

---

## Notifications

### Channels
| Channel | Notes |
|---|---|
| **In-app** | Shown in the notification center inside the portal |
| **Email** | Sent to the registered email address |
| **SMS** | Can be added later for booking decisions |

### Notification Bell (Nav)
- When logged in, the main navigation displays a **notification bell icon** with an unread indicator badge.
- Clicking the bell opens the notification panel or navigates to the Notifications page.

### Notification Types
- Appointment status changes (Approved, Rejected, Cancelled, Rescheduled, Displaced, Completed).
- Appointment reminders (e.g., "Your appointment is tomorrow at 2:00 PM").
- Messages from the clinic (e.g., schedule changes, announcements).

### Notification Preferences
- Users can manage email and notification preferences from **Account Settings**.

---

## Account Settings

- Change email address.
- Change password.
- Manage notification preferences (email, in-app).
- Deactivate account (optional, can be added later).

---

## User Role Capabilities Summary

| Capability | Allowed |
|---|---|
| Browse services | ✅ |
| Book appointments | ✅ (verified accounts only) |
| View upcoming appointments | ✅ |
| View appointment history | ✅ |
| Cancel pending requests | ✅ |
| Cancel approved appointments | ✅ (with reason) |
| Reschedule approved appointments | ✅ (once by default, configurable) |
| View notifications | ✅ |
| Manage profile and avatar | ✅ |
| Manage notification preferences | ✅ |
