# Samson Dental Center — Appointment Email Specification & Dynamic Data Guide

This document outlines all **Appointment & Booking Email Notifications**, their dynamic data parameters, logo/branding guidelines, and recommendations to optimize patient experience and communication professionalism.

---

## 1. Complete Email Inventory & Dynamic Data Matrix

| # | Email Event / Action | Internal Type Constant | Recipient | Email Subject | Dynamic Data Parameters |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Appointment Request Received** | `APPOINTMENT_BOOKED` | Account Holder Email | Dynamic (Self vs. Dependent subject) | `accountHolderName`, `patientType`, `patientName`, `relationship`, `bookedByName`, `serviceName`, `doctorName`, `dateStr`, `timeRangeStr`, `appointmentId`, `dashboardUrl`, `referenceCode`, `clinicLogoUrl` |
| **2** | **Appointment Confirmed** | `APPOINTMENT_CONVERTED_FROM_INQUIRY`<br>`APPOINTMENT_MANUALLY_BOOKED_PATIENT`<br>`APPOINTMENT_MANUALLY_BOOKED_GUEST` | Patient or Guest Email | *"Appointment Confirmed – Samson Dental Center"* | `patientName`, `serviceName`, `doctorName`, `dateStr`, `timeRangeStr`, `appointmentId`, `chatToken`, `baseUrl`, `referenceCode`, `calendarAddUrl`, `googleMapsUrl`, `preVisitInstructions` |
| **3** | **24-Hour Reminder** | `APPOINTMENT_REMINDER_24H` | Guest / Patient Email | *"Appointment Reminder (24 Hours) – Samson Dental Center"* | `reminderTitle`, `patientName`, `serviceName`, `doctorName`, `dateStr`, `timeRangeStr`, `appointmentId`, `baseUrl`, `googleMapsUrl`, `preVisitInstructions`, `cancellationUrl` |
| **4** | **48-Hour Reminder** | `APPOINTMENT_REMINDER_48H` | Guest / Patient Email | *"Appointment Reminder (48 Hours) – Samson Dental Center"* | `reminderTitle`, `patientName`, `serviceName`, `doctorName`, `dateStr`, `timeRangeStr`, `appointmentId`, `baseUrl`, `calendarAddUrl`, `rescheduleUrl`, `cancellationUrl` |
| **5** | **Cancellation** | `CANCEL_BOOKING` | Patient or Guest Email | *"Appointment Cancelled – Samson Dental Center"* | `patientName`, `dateStr`, `serviceName`, `cancellationReason`, `rebookUrl`, `clinicPhone`, `clinicLogoUrl` |
| **6** | **Rescheduling** | `RESCHEDULE_BOOKING` | Patient or Guest Email | *"Appointment Rescheduled – Samson Dental Center"* | `patientName`, `dateStr`, `timeRangeStr`, `oldDateStr`, `chatToken`, `baseUrl`, `calendarAddUrl`, `googleMapsUrl` |
| **7** | **Staff Chat Reply** | `STAFF_REPLIED_TO_CHAT` | Patient or Guest Email | *"New message from Samson Dental Center regarding your appointment"* | `patientName`, `chatToken`, `baseUrl`, `senderStaffName`, `messageSnippet`, `chatUrl` |
| **8** | **Post-Care / Review Request** | `APPOINTMENT_COMPLETED_POST_CARE` | Patient or Guest Email | *"Thank You for Visiting Samson Dental Center – How Was Your Visit?"* | `reminderTitle`, `patientName`, `serviceName`, `doctorName`, `dateStr`, `timeRangeStr` (*"Visit Completed"*), `appointmentId`, `baseUrl`, `reviewUrl`, `postCareUrl` |

---

## 2. Logo & Header Branding Integration

To ensure the logo renders reliably across all email clients (Gmail, Apple Mail, Outlook, Yahoo):

### Dynamic Logo Parameter
```typescript
clinicLogoUrl: string; // e.g. "https://samson-dental.com/images/email-logo.png"
```

### HTML Boilerplate Pattern
```html
<div style="background-color: #ffffff; padding: 24px 32px; text-align: center; border-bottom: 1px solid #f1f5f9;">
  <a href="{{baseUrl}}" target="_blank" style="text-decoration: none; display: inline-block;">
    <img 
      src="{{clinicLogoUrl}}" 
      alt="Samson Dental Center" 
      width="180" 
      height="48" 
      style="display: block; max-width: 180px; height: auto; border: 0; outline: none; margin: 0 auto;" 
    />
  </a>
</div>
```

* **Asset Hosting**: Always use an absolute HTTPS URL hosted on a public web server/CDN.
* **Resolution**: Use 2x resolution PNG/SVG (e.g. 360px x 96px) scaled down in HTML via `width="180"` to keep it crisp on Retina displays.

---

## 3. Professional Email Recommendations (Add / Remove / Modify)

### ➕ What to ADD
1. **Short Reference Code (`referenceCode`)**: Display a clean code like `SDC-8921` instead of showing raw 36-character UUIDs.
2. **Add-to-Calendar CTA (`calendarAddUrl`)**: Include a 1-click button to add the appointment to Google Calendar, Apple Calendar, or Outlook.
3. **Clinic Address & Google Maps Link (`googleMapsUrl`)**: Helps patients find directions without needing to search manually.
4. **Pre-Visit Patient Instructions (`preVisitInstructions`)**: Helpful checklist (e.g., *"Arrive 10 minutes early"*, *"Bring photo ID"*).
5. **Self-Service Buttons (`rescheduleUrl`, `cancellationUrl`)**: Allows patients to manage their booking directly.
6. **Review / Post-Care Link (`reviewUrl`)**: Direct patients to Google Reviews or clinic post-care instructions after completed visits.

### ➖ What to REMOVE
1. **Raw Database UUIDs**: Hide `f616dc57-4194-428c-901b-2e30205c97e4` from main body copy.
2. **Internal Technical Jargon**: Avoid using terms like `INQUIRY_PATIENT`, `MANUALLY_BOOKED_GUEST`, or system enums in email text.

### ✏️ What to MODIFY
1. **Subject Lines with Date/Time**: E.g. *"Reminder: Your Dental Appointment Tomorrow at 10:00 AM – Samson Dental Center"*.
2. **Visual Status Colors**:
   - 🟢 **Green (`#16a34a`)**: Confirmed / Booked
   - 🔵 **Blue (`#2563eb`)**: 24h & 48h Reminders
   - 🟠 **Amber (`#d97706`)**: Rescheduled
   - 🔴 **Red (`#dc2626`)**: Cancelled
   - 🌐 **Teal (`#0d9488`)**: Post-Care & Review

---

## 4. TypeScript Payload Interface

```typescript
export interface AppointmentEmailPayload {
  // Core Reference
  appointmentId: string;
  referenceCode?: string; // Short code e.g. "SDC-8921"
  
  // Branding
  clinicLogoUrl?: string;
  baseUrl: string;
  
  // Patient & Staff Info
  patientName: string;
  accountHolderName?: string;
  patientType?: 'SELF' | 'DEPENDENT' | 'GUEST';
  relationship?: string;
  doctorName?: string;
  
  // Appointment Details
  serviceName: string;
  dateStr: string;
  timeRangeStr: string;
  oldDateStr?: string;
  
  // Location & Contact
  clinicBranchName?: string;
  clinicAddress?: string;
  googleMapsUrl?: string;
  clinicPhone?: string;
  
  // Interactive Action Links
  calendarAddUrl?: string;
  rescheduleUrl?: string;
  cancellationUrl?: string;
  chatToken?: string;
  chatUrl?: string;
  reviewUrl?: string;
  postCareUrl?: string;
  
  // Custom Notices
  reminderTitle?: string;
  preVisitInstructions?: string[];
  cancellationReason?: string;
}
```
