# Secretary Portal: Doctor Schedule Management

**Route**: `/secretary/schedules`

This page allows the secretary to manage doctor availability using a tiered 3-layer scheduling architecture.

---

## 1. UI Structure & Tabbed Layout Design

To keep the page clean and structured, the schedule management interface is organized into **three tabs**:

```
[ Tab 1: Clinic Global Hours ]   [ Tab 2: Custom Doctor Shifts ]   [ Tab 3: Time Exclusions & Blocks ]
```

---

### Tab 1: Clinic Global Hours (Layer 1 Configuration)
- **Objective**: Configure clinic-wide fallback hours (e.g., Monday–Saturday, 8:00 AM to 5:00 PM).
- **UI Details**:
  - A clean vertical table listing the days of the week (Monday to Sunday).
  - **Active Toggle**: Turn a day "Open" or "Closed".
  - **Time Range Inputs**: Start Time and End Time fields (using styled custom time selectors).
  - **Save Button**: Prompts a confirmation notice: *"This will update the fallback baseline for all doctors who do not have custom weekly shifts configured."*

---

### Tab 2: Custom Doctor Shifts (Layer 2 Overrides)
- **Objective**: Set a doctor's standard weekly routine.
- **UI Details**:
  - **Doctor Dropdown Selector**: Searchable list of doctors. Selecting a doctor dynamically loads their weekly shifts.
  - **"Inheriting Clinic Baseline" Indicator**: A status message indicating if they are currently falling back to global hours.
  - **Day-by-Day Roster**:
    - Each day of the week features a toggle to **"Enable Custom Shifts"**.
    - If disabled, the day inherits Layer 1 global clinic settings (marked by read-only fields showing the global values).
    - If enabled, the inputs unlock, allowing custom Start/End times (e.g. Dr. Alice working Mon/Wed 9:00 AM - 3:00 PM only, and Tuesdays: Closed).
  - **Action Button**: "Save Weekly Shift Schedule".

---

### Tab 3: Time Exclusions & Blocks (Layer 3 Exclusions)
- **Objective**: Manage one-off calendar exceptions like vacations, clinical meetings, or sick leave.
- **UI Details**:
  - **Split-Screen Sub-Layout**:
    - **Left Side (Block Creator Form)**:
      - **Doctor Selector Dropdown**.
      - **Date Picker**: Multi-date or single-date selector.
      - **Time Range Pickers**: Choose a specific window (e.g. 1:00 PM to 4:00 PM) or check a box for **"All Day Block"**.
      - **Reason/Description Field**: Mandatory text area (e.g., "Personal Vacation", "Dental Seminar").
      - **"Create Schedule Exception" Button**: Submits the block.
    - **Right Side (Active Exceptions List)**:
      - A searchable table displaying active and upcoming time blocks.
      - Columns: Doctor, Date, Time Range, Reason, Created By.
      - **"Revoke Block" Button**: Destructive red action button that removes the exception, immediately restoring standard Layer 2 or Layer 1 availability for those slots.

---

## 2. Data Schema & TS Interfaces

```typescript
export interface GlobalClinicHour {
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  isOpen: boolean;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
}

export interface DoctorShift {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export interface TimeBlock {
  id: string;
  doctorId: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "13:00"
  endTime: string;    // "16:00"
  reason: string;
}
```
