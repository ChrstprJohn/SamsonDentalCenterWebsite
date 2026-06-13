# User Portal

## Overview

The user portal is the private dashboard for authenticated and verified patients. It allows them to manage their profile, track their appointments, and stay informed through notifications.

---

## Portal Pages & Navigation

| Page | Description |
|---|---|
| **Dashboard** | High-level summary of upcoming appointments, recent activity, and shortcuts |
| **My Appointments** | Deep-dive page with sub-tabs for Upcoming, Pending, and History |
| **Notifications** | In-app notification center |
| **Account Settings** | Manage profile details, avatar, credentials, and notification preferences, Security|

---

## Dashboard

- High-level landing page offering an immediate overview.
- **Next Appointment Widget**: Highlights the single next upcoming appointment (service, date/time, doctor, countdown/status).
- **Recent Notifications Summary**: Displays the latest 3-5 notifications with a quick link to "View All".
- **Quick Action Shortcuts**: Prominent links for "Book New Appointment", "Manage Appointments", and "Update Profile".

---

## My Appointments

The appointments panel is located on its own dedicated page (`/user/appointments`) with three sub-tabs:

### 1. Upcoming Tab
- **Statuses**: `Approved`, `Reschedule Requested`, `Checked-In`
- **Actions**:
  - **Cancel**: Available for approved appointments. Prompts for a mandatory reason, warns of excessive cancellations if `cancelCount` is high, and registers reliability penalty.
  - **Reschedule Request**: Available for approved appointments. Users cannot reschedule directly; they submit a request with a reason (limited to **ONE** reschedule request per appointment). Re-enters the staff review queue as `Reschedule Requested`.

### 2. Pending Requests Tab
- **Statuses**: `Pending`
- **Actions**:
  - **Cancel**: Available at any time. Prompts for a mandatory reason.

### 3. History Tab
- **Statuses**: `Rejected`, `Cancelled`, `Displaced`, `Completed`, `No-Show`, `Treatment Rendered`
- **Actions**: None (Read-only view).
- **Details**: Displays reasons for cancellation/rejection, displacement cause, and credibility indicators if flagged as a No-Show.

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
- Appointment status changes (Approved, Rejected, Cancelled, Rescheduled, Displaced, Treatment Rendered, Completed).
- Appointment reminders (e.g., "Your appointment is tomorrow at 2:00 PM").
- Messages from the clinic (e.g., schedule changes, announcements).

### Notification Preferences
- Users can manage email and notification preferences from **Account Settings**.

---

## Account Settings

The profile page is embedded inside Account Settings (`/user/settings`) to unify personal metadata and security credentials:

### Profile Details
- Displays the user's registered identity fields (first, middle, last name, suffix, contact number, email).
- **Avatar**: Customizable, optional avatar image upload/selector.
- Profile changes can be updated and saved at any time.

### Security & Preferences
- Change email address.
- Change password.
- Manage notification preferences (email, in-app toggles).
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
