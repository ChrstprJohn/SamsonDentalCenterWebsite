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
- **Objective**: Configure clinic-wide fallback hours (e.g., Monday–Saturday, 8:00 AM to 5:00 PM) and global break times.
- **UI Details**:
  - A clean vertical table listing the days of the week (Monday to Sunday).
  - **Active Toggle**: Turn a day "Open" or "Closed".
  - **Time Range Inputs**: Start Time and End Time fields (using styled custom time selectors).
  - **Global Break Time**: Configure optional default break times per day (e.g., Lunch: 12:00 PM to 01:00 PM).
  - **Save Button**: Prompts a confirmation notice: *"This will update the fallback baseline and break times for all doctors who do not have custom weekly shifts configured."*
- **Visual Mockup**:
```text
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │  [Tab 1: Clinic Global Hours]   Tab 2: Doctor Weekly Shifts    Tab 3: Blocks     │
  ├──────────────────────────────────────────────────────────────────────────────────┤
  │                                                                                  │
  │  ℹ️ Baseline clinic operating hours and lunch breaks. Doctors without custom      │
  │     weekly shifts will automatically inherit these settings.                      │
  │                                                                                  │
  │  ┌───────────┬──────────────┬──────────────┬────────────┬────────────────────────┐  │
  │  │ Day       │ Open/Closed  │ Work Hours   │ Break Time │ Actions                │  │
  │  ├───────────┼──────────────┼──────────────┼────────────┼────────────────────────┤  │
  │  │ Monday    │  🟢 OPEN     │  08:00-17:00 │ 12:00-13:00│ [Copy to Weekdays]     │  │
  │  │ Tuesday   │  🟢 OPEN     │  08:00-17:00 │ 12:00-13:00│                        │  │
  │  │ Wednesday │  🟢 OPEN     │  08:00-17:00 │ 12:00-13:00│                        │  │
  │  │ Thursday  │  🟢 OPEN     │  08:00-17:00 │ 12:00-13:00│                        │  │
  │  │ Friday    │  🟢 OPEN     │  08:00-17:00 │ 12:00-13:00│                        │  │
  │  │ Saturday  │  🟢 OPEN     │  08:00-13:00 │ --:-- - -- │                        │  │
  │  │ Sunday    │  🔴 CLOSED   │  --:-- - --  │ --:-- - -- │                        │  │
  │  └───────────┴──────────────┴──────────────┴────────────┴────────────────────────┘  │
  │                                                                                  │
  │                                                      [ 💾 Save Global Hours ]    │
  └──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab 2: Custom Doctor Shifts (Layer 2 Overrides)
- **Objective**: Set a doctor's standard weekly routine with a safe, easy-to-use card layout.
- **UI Details**:
  - **Doctor Dropdown Selector**: Searchable list of doctors. Selecting a doctor dynamically loads their weekly shifts.
  - **Global Break Time Indicator**: Displays a clear global banner showing current default break times.
  - **Day-by-Day Roster (Cards)**:
    - Each day of the week is a card displaying either a **[🟢 Inheriting Baseline]** status or a **[⭐ Custom Override]** status.
    - **Safe Edit Option**: Clicking **[ ✏️ Edit Custom ]** unlocks that day's shift inputs for custom timing without deleting previously saved data.
    - **Safe Revert Option**: Clicking **[ ↩️ Revert to Baseline ]** locks the card back to read-only global baseline settings (with confirmation prompt).
    - **Bulk Actions**: Dropdown menu on overridden cards allowing users to clone the active day's settings to all other days.
  - **Action Button**: "Save Weekly Shift Schedule".
- **Visual Mockup**:
```text
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │   Tab 1: Clinic Global Hours  [Tab 2: Doctor Weekly Shifts]   Tab 3: Blocks      │
  ├──────────────────────────────────────────────────────────────────────────────────┤
  │                                                                                  │
  │  Select Doctor: [ Dr. Alice Smith (General Dentist)               | 🔍 | ∨ ]      │
  │                                                                                  │
  │  🌐 Global baseline has lunch break set: 12:00 PM - 01:00 PM (Applies to all)     │
  │                                                                                  │
  │  ┌────────────────────────────────────────────────────────────────────────────┐  │
  │  │ MONDAY  •  [🟢 Inheriting Baseline]                      [ ✏️ Edit Custom ] │  │
  │  │ Hours: 08:00 AM - 05:00 PM  |  Lunch Break: 12:00 PM - 01:00 PM            │  │
  │  └────────────────────────────────────────────────────────────────────────────┘  │
  │  ┌────────────────────────────────────────────────────────────────────────────┐  │
  │  │ TUESDAY  •  [⭐ Custom Override]                   [ ↩️ Revert to Baseline ] │  │
  │  │ Hours: [ 09:00 AM ] to [ 03:00 PM ]                                        │  │
  │  │ [x] Exclude Lunch Break (12:00 PM - 01:00 PM)                              │  │
  │  │ 📑 Actions: [ 📋 Clone schedule to other days... ∨ ]                       │  │
  │  └────────────────────────────────────────────────────────────────────────────┘  │
  │  ┌────────────────────────────────────────────────────────────────────────────┐  │
  │  │ WEDNESDAY  •  [🟢 Inheriting Baseline]                    [ ✏️ Edit Custom ] │  │
  │  │ Hours: 08:00 AM - 05:00 PM  |  Lunch Break: 12:00 PM - 01:00 PM            │  │
  │  └────────────────────────────────────────────────────────────────────────────┘  │
  │                                                                                  │
  │                                                      [ 💾 Save Weekly Roster ]   │
  └──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Tab 3: Time Exclusions & Blocks (Layer 3 Exclusions)
- **Objective**: Manage one-off calendar exceptions like vacations, clinical meetings, sick leave, or clinic-wide holidays.
- **UI Details**:
  - **Split-Screen Sub-Layout**:
    - **Left Side (Block Creator Form)**:
      - **Scope Radio Buttons / Toggle**: Choose between "Specific Doctor" and "Clinic-wide (All Doctors)".
      - **Doctor Selector Dropdown**: Only visible/enabled if "Specific Doctor" is selected.
      - **Date Picker**: Multi-date or single-date selector.
      - **Time Range Pickers**: Choose a specific window (e.g. 1:00 PM to 4:00 PM) or check a box for **"All Day Block"**.
      - **Reason/Description Field**: Mandatory text area (e.g., "Personal Vacation", "Dental Seminar", "Christmas Holiday").
      - **"Create Schedule Exception" Button**: Submits the block.
    - **Right Side (Active Exceptions List)**:
      - A searchable table displaying active and upcoming time blocks.
      - Columns: Scope (Doctor Name or "🏥 Clinic-wide"), Date, Time Range, Reason, Created By.
      - **"Revoke Block" Button**: Destructive red action button that removes the exception, immediately restoring standard Layer 2 or Layer 1 availability for those slots.
- **Visual Mockup**:
```text
  ┌──────────────────────────────────────────────────────────────────────────────────┐
  │   Tab 1: Clinic Global Hours   Tab 2: Doctor Weekly Shifts  [Tab 3: Blocks]      │
  ├──────────────────────────────────────────────────────────────────────────────────┤
  │                                                                                  │
  │  ┌───────────────────────────────┐  ┌──────────────────────────────────────────┐  │
  │  │  🚫 ADD SCHEDULE BLOCK        │  │  📋 ACTIVE EXCLUSIONS & VACATIONS        │  │
  │  ├───────────────────────────────┤  ├──────────────────────────────────────────┤  │
  │  │ Scope:                        │  │ Search: [ Filter by Scope/Reason     ]   │  │
  │  │ ( ) Specific Doctor           │  │                                          │  │
  │  │ (●) Clinic-wide (All Doctors) │  │ 🏥 CLINIC-WIDE BLOCK                     │  │
  │  │                               │  │ 📅 Jul 04, 2026 (All Day)                │  │
  │  │ [ Doctor selector is hidden ] │  │ 🏷️ Reason: Independence Day Holiday      │  │
  │  │                               │  │ [ Revoke Block ]                         │  │
  │  │ Date:                         │  │ ──────────────────────────────────────── │  │
  │  │ [ 2026-07-04              ]   │  │ Dr. Alice Smith                          │  │
  │  │                               │  │ 📅 Jul 08, 2026 (01:00 PM - 04:00 PM)    │  │
  │  │ Time Period:                  │  │ 🏷️ Reason: Offsite Dental Conference     │  │
  │  │ [x] Block Entire Day          │  │ [ Revoke Block ]                         │  │
  │  │ [ ] Custom Hours:             │  │                                          │  │
  │  │     [12:00 PM] to [03:00 PM]  │  │                                          │  │
  │  │                               │  │                                          │  │
  │  │ Reason / Note:                │  │                                          │  │
  │  │ [ Independence Day Holiday  ] │  │                                          │  │
  │  │                               │  │                                          │  │
  │  │ [ ➕ Create Exception ]       │  │                                          │  │
  │  └───────────────────────────────┘  └──────────────────────────────────────────┘  │
  │                                                                                  │
  └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Schema & TS Interfaces

```typescript
export interface GlobalClinicHour {
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
  isOpen: boolean;
  startTime: string; // "08:00"
  endTime: string;   // "17:00"
  breakStartTime: string | null; // e.g., "12:00"
  breakEndTime: string | null;   // e.g., "13:00"
}

export interface DoctorShift {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
  isCustom: boolean; // Indicates if this doctor overrides clinic baseline for this day
  breakStartTime: string | null;
  breakEndTime: string | null;
}

export interface TimeBlock {
  id: string;
  doctorId: string | null; // null represents a Clinic-wide (Global) Block
  date: string;            // "YYYY-MM-DD"
  startTime: string;       // "13:00"
  endTime: string;         // "16:00"
  reason: string;
}
```
