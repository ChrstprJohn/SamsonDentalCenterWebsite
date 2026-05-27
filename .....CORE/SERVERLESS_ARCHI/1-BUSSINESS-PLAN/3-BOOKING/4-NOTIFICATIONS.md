# Booking — Notifications (In-App & Email)

## Overview

This document outlines the notification triggers for both patients (users) and clinic staff (secretaries/admins) throughout the entire appointment lifecycle. 

The system uses two main delivery channels:
1. **In-App Notifications**: Real-time alerts visible within the portal bell icon and notification center (triggers red badge counters).
2. **Email Notifications**: Formal email dispatches sent to the user's registered email address.

> **Time Display Standard:** Whenever an appointment time is displayed in any notification, it is formatted as a full **Time Range** (e.g., `October 12 at 2:00 PM - 3:00 PM`) based on the service duration, rather than just the initial start time.

---

## Patient Notifications

Because bookings are handled strictly one-by-one (no bulk processing), notifications are dispatched **immediately** as the state of the appointment changes.

| Trigger Event (Status) | In-App Notification | Email Notification |
|---|---|---|
| **Booking Submitted (Pending)** | "Your appointment request for [Date / Time Range] has been submitted and is awaiting approval." | Confirmation of receipt with appointment details and pending status. |
| **Appointment Approved** | "Your appointment on [Date / Time Range] has been approved!" | Approval confirmation, calendar invite attachment, and clinic instructions. |
| **Appointment Rejected** | "Your appointment request for [Date / Time Range] was declined. Reason: [Reason]" | Rejection notice including the secretary's reason and a link to re-book. |
| **Cancelled (by User)** | "You have successfully cancelled your appointment on [Date / Time Range]." | Cancellation confirmation. |
| **Cancelled (by Clinic)**| "Your appointment on [Date / Time Range] has been cancelled by the clinic. Reason: [Reason]" | Cancellation notice with the provided reason and instructions to re-book. |
| **Reschedule Requested** | "Your request to reschedule the [Date / Time Range] appointment is pending approval." | Confirmation that the reschedule request was received. |
| **Appointment Displaced** | "Urgent: Your appointment on [Date / Time Range] requires your attention due to schedule changes." | Notice of displacement, explaining the cause (e.g., doctor unavailable), and a link prompting them to pick a new time. |
| **Checked-In** | *(None)* | *(None)* |
| **Completed** | "Thank you for visiting! Your appointment is complete." | Post-appointment summary, draft invoice link, and a prompt for feedback/review. |
| **No-Show** | "You missed your appointment on [Date / Time Range]." | Notice of missed appointment and a warning regarding the negative impact on their booking credibility. |

---

## Staff (Secretary/Admin) Notifications

Staff notifications are primarily kept within the app to prevent email clutter, though a daily digest or instant email can be toggled in the clinic config.

| Trigger Event (Status) | In-App Notification | Action Required |
|---|---|---|
| **New Booking (Pending)** | "New appointment request received for [Patient Name] on [Date / Time Range]." | Review and Approve/Reject |
| **Reschedule Requested** | "[Patient Name] requested a reschedule for their [Date / Time Range] appointment. Reason: [Reason]" | Review and Approve/Reject the new proposed time |
| **Cancelled (by Patient)** | "[Patient Name] cancelled their appointment for [Date / Time Range]. Reason: [Reason]" | None (Informational, slot automatically freed) |
| **System Displacement** | "Warning: [X] appointments were displaced due to your recent schedule changes." | Review displaced queue to assist patients with re-booking |

---

## Special Rules

### 1. Dependent Bookings
If a user books an appointment for a dependent (family member), the notification is sent to the primary account holder's email and in-app feed, but the message is personalized. 
- *Example:* "Your dependent **Timmy's** appointment for Tomorrow at 2:00 PM - 3:00 PM has been approved."

### 2. Badge Management
- Unread in-app notifications increment a red badge counter on the navigation bar.
- Clicking a notification marks it as read and redirects the user to the relevant page (e.g., the specific appointment details page or the approval queue for secretaries).

---

## Q&A — Common Edge Cases

**Q: What if an email fails to send?**  
A: The in-app notification still appears. Email delivery is retried and failures are logged for admin review.

**Q: What if a Pending request expires automatically?**  
A: The user receives an in-app and email notice that the request expired, with a prompt to re-book.
