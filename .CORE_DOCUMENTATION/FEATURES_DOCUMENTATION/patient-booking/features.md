# Patient Booking Flow Feature: High-Level Overview & Flow

This document details the Patient Booking Feature flow, requirements, and system design at a high level. For detailed implementation guides of specific layers, see the [Frontend Guide](frontend.md) and [Backend Guide](backend.md).

---

## 🌟 Feature Overview

The Patient Booking Flow is a guided wizard designed to be a standalone, distraction-free experience for authenticated patients. It allows users to seamlessly schedule appointments for themselves or their dependents.

### Key Capabilities & Rules
1. **Standalone Full-Page Wizard**:
   * The booking wizard runs on its own dedicated page (`/booking`), independent from the standard Patient Portal layout, minimizing distractions.
2. **Smart Redirection & Authentication**:
   * **Signed In (Direct)**: Directs securely to `/booking`.
   * **Signed Out (Redirect)**: Clicking "Book Now" prompts login via `/auth/login?redirect=/booking`. Post-login, it automatically routes users to the wizard.
3. **Multi-Patient Support**:
   * Patients can book appointments for themselves or create new dependent profiles directly within the wizard.
4. **Atomic Submission**:
   * No slots are held during navigation. The final submit step performs a robust atomic check to avoid double-booking.

---

## 🔄 End-to-End Main Architectural Flow

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant View as booking-view (Frontend UI)
    participant Hook as useUserBooking (View Hook)
    participant ServerAction as submitBookingAction
    participant DB as Supabase DB

    Patient->>View: Interacts with wizard (Selects Service, Date, Patient)
    View->>Hook: Updates local booking state
    Patient->>View: Clicks Submit on Step 4 (Review)
    View->>Hook: handleSubmit()
    Hook->>ServerAction: Invokes submitBookingAction(payload)
    
    rect rgb(245, 245, 245)
        note right of ServerAction: Secure Server-Side Execution
        ServerAction->>DB: Validates atomic slot availability
        ServerAction->>DB: Inserts new appointment (and dependent if applicable)
    end

    ServerAction-->>Hook: Returns success or error
    
    alt Booking Successful
        Hook->>Hook: Updates isSuccess state
        Hook->>View: Renders BookingSuccessView
    else Booking Failed
        Hook->>View: Displays error toast notification
    end
```
