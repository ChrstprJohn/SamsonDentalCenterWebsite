# Project Rules & Design Guidelines

## Appointment Details Shared Panel Styling

The shared appointment detail components (`AppointmentDetailPane` & `SharedAppointmentDetail`) are used across three main views:
1. **Calendar Page** (`secretary-book-appointment-view.tsx`): Passes `compact={true}`.
2. **Chat Inbox Page** (`secretary-chat-inbox-view.tsx`): Passes `compact={true}`.
3. **Appointments Directory Page** (`secretary-appointments-view.tsx`): Passes `compact={false}` (default).

### Background & Styling Conventions:
- **Calendar & Chat (`compact={true}`)**:
  - Container context: Sidebar / drawer panel.
  - Tab header background: `bg-sidebar` (matches sidebar background, not white).
  - Bottom action bar background: `bg-sidebar`.
- **Appointments Directory (`compact={false}`)**:
  - Container context: Main central content area.
  - Tab header background: `bg-card` (white in light mode).
  - Bottom action bar background: `bg-card` (white in light mode).
