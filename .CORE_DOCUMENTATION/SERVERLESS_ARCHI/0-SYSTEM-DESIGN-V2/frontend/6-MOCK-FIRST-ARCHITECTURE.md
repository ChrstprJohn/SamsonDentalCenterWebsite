# Component Generation Protocol: Mock-First Architecture

> **System Note:** Governed by `agent-skills/frontend-ui-engineering` and `agent-skills/api-and-interface-design`.
> Part of the Samson Dental system design suite. See the master index for navigation: [0-GUIDELINES.md](0-GUIDELINES.md).

This document establishes the official **Interface-Driven Development** (or **Mock-First Architecture**) workflow for the Samson Dental frontend. This protocol creates a perfect firewall between backend engineering and frontend UI design. It ensures your frontend developer can build 100% of the visual layout, responsive grids, and elegant micro-animations in parallel, without waiting for database tables or live API endpoints.

---

## 1️⃣ The 4-Step Component Lifecycle Flow

To prevent technical debt, God components, and logic leakage from the start, all new features must follow this exact development sequence.

```text
STEP 1: Define Type Contract  ──>  STEP 2: Build Mock Data Layer  ──>  STEP 3: Write Dumb UI Layout  ──>  STEP 4: Swap Mock for Live DB
     (types.ts)                   (mock-data + stub hooks)              (feature-card.tsx)               (Production Phase)
```

### 📋 Detailed Step Guidelines:

* **Step 1: Define the Data Shape (`types.ts`)**  
  Establish the exact, strictly typed TypeScript interfaces that the presentational component will require. This acts as the unchangeable contract between frontend and backend.
  
* **Step 2: Build the Mock Data Layer**  
  Create two things:
  * **Mock data file** (`mocks/[feature].mock.ts`): Hardcode comprehensive, realistic sample data matching the type contract. This data represents what the RSC page will eventually fetch from the database.
  * **Stub hook** (`hooks/use-[feature].ts`): If the component requires interactive mutations (form submissions, toggles with side-effects), write a companion hook with simulated handlers (`isLoading`, `isError`, and event callbacks). For read-only views, a stub hook is not needed.
  
* **Step 3: Build the Presentational Dumb UI (`components/[feature].tsx`)**  
  Consume mock data via props (injected from the page-level mock RSC) and any mutation handlers from the stub hook. Craft the page layout, responsive CSS grids, HSL color highlights, hover transitions, and keyboard accessibility.
  
* **Step 4: The Live Swap (Backend Integration)**  
  Once the backend APIs or Supabase schemas are live:
  * Replace the mock data imports in the RSC page with real `async` database queries.
  * Replace simulated hook handlers with real **Server Action** calls.
  * **The presentational UI components remain entirely untouched.**

---

## 2️⃣ Reference Blueprint: Patient Treatment History Tracker

Here is the complete reference blueprint demonstrating this protocol for a **Patient Treatment History** panel.

### Step 1: The Type Contract (`types.ts`)
```typescript
// src/modules/patients/types.ts
export type TreatmentStatus = "completed" | "scheduled" | "cancelled";

export interface TreatmentRecord {
  id: string;
  date: string;
  dentistName: string;
  procedure: string;
  cost: string;
  status: TreatmentStatus;
  notes?: string;
}
```

### Step 2A: The Mock Data File (`mocks/treatment-history.mock.ts`)
```typescript
// src/modules/patients/mocks/treatment-history.mock.ts
import { TreatmentRecord } from "../types";

// Comprehensive mock data that allows the frontend designer to test various visual flows immediately.
// This mirrors what the RSC page will eventually fetch from the database.
export const MOCK_TREATMENT_HISTORY: TreatmentRecord[] = [
  {
    id: "rec-1",
    date: "2026-05-12",
    dentistName: "Dr. Christopher Samson",
    procedure: "Root Canal Therapy (Tooth #14)",
    cost: "$850.00",
    status: "completed",
    notes: "Patient tolerated procedure well. Scheduled follow-up in 2 weeks.",
  },
  {
    id: "rec-2",
    date: "2026-05-28",
    dentistName: "Dr. Sarah Samson",
    procedure: "Routine Scaling and Polishing",
    cost: "$120.00",
    status: "completed",
    notes: "Recommended daily flossing and soft-bristle brush.",
  },
  {
    id: "rec-3",
    date: "2026-06-15",
    dentistName: "Dr. Christopher Samson",
    procedure: "Porcelain Crown Placement",
    cost: "$1,200.00",
    status: "scheduled",
  },
];
```

### Step 2B: The Mock RSC Page (Server-Level Data Injection)
```tsx
// src/app/(portals)/user/treatment-history/page.tsx
// During development: import mock data. During production: replace with real DB query.
import { MOCK_TREATMENT_HISTORY } from "@/modules/patients/mocks/treatment-history.mock";
import { TreatmentHistoryView } from "@/modules/patients/views/treatment-history-view";

export default function TreatmentHistoryPage() {
  // DEV: Use mock data directly. PROD: Replace with `await supabase.from(...)` query.
  const records = MOCK_TREATMENT_HISTORY;

  return (
    <main className="p-8">
      <TreatmentHistoryView records={records} />
    </main>
  );
}
```

### Step 2C: The Stub Hook (For Interactive Mutations Only)
```typescript
// src/modules/patients/hooks/use-treatment-history.ts
'use client';

import { useState } from "react";
import { TreatmentStatus } from "../types";

export function useTreatmentHistory() {
  const [filterStatus, setFilterStatus] = useState<TreatmentStatus | "all">("all");
  // Track which specific row is loading by ID, not a blanket boolean.
  // This prevents the "Row State Cascade" bug where clicking one row locks ALL rows.
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Simulated handler callback (will become a Server Action in production)
  const handleDownloadReport = async (recordId: string) => {
    setLoadingId(recordId);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoadingId(null);
    alert(`Downloaded clinical summary for record: ${recordId}`);
  };

  return {
    filterStatus,
    setFilterStatus,
    loadingId,
    onDownloadReport: handleDownloadReport,
  };
}
```

### Step 3A: The View Orchestrator (`views/treatment-history-view.tsx`)
This client-side view glues the RSC-provided data with the interactive hook.
```tsx
// src/modules/patients/views/treatment-history-view.tsx
'use client';

import { TreatmentRecord } from "../types";
import { useTreatmentHistory } from "../hooks/use-treatment-history";
import { TreatmentHistoryList } from "../components/treatment-history-list";

interface TreatmentHistoryViewProps {
  records: TreatmentRecord[];
}

export function TreatmentHistoryView({ records }: TreatmentHistoryViewProps) {
  const { filterStatus, setFilterStatus, loadingId, onDownloadReport } = useTreatmentHistory();

  // Client-side filtering of server-provided data
  const filteredRecords = records.filter((record) => {
    if (filterStatus === "all") return true;
    return record.status === filterStatus;
  });

  return (
    <TreatmentHistoryList
      records={filteredRecords}
      activeFilter={filterStatus}
      loadingId={loadingId}
      onFilterChange={setFilterStatus}
      onDownload={onDownloadReport}
    />
  );
}
```

### Step 3B: The Presentation UI Component (`components/treatment-history-list.tsx`)
```tsx
// src/modules/patients/components/treatment-history-list.tsx
import { TreatmentRecord, TreatmentStatus } from "../types";

interface TreatmentHistoryListProps {
  records: TreatmentRecord[];
  activeFilter: TreatmentStatus | "all";
  loadingId: string | null; // Track which specific row is loading
  onFilterChange: (status: TreatmentStatus | "all") => void;
  onDownload: (id: string) => void;
}

export function TreatmentHistoryList({
  records,
  activeFilter,
  loadingId,
  onFilterChange,
  onDownload,
}: TreatmentHistoryListProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
      {/* Header and Filter Switches */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Treatment History</h2>
          <p className="text-xs text-slate-400">Clinical dental logs and scheduled treatments</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 p-1 border border-white/5">
          {(["all", "completed", "scheduled", "cancelled"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeFilter === filter
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Records List */}
      {records.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-white/5 rounded-2xl">
          No records match this selection.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map((record) => {
            // Row-specific loading state: only THIS row shows loading indicator
            const isRowLoading = loadingId === record.id;

            return (
              <div
                key={record.id}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/20 p-5 transition-all duration-300 hover:border-blue-500/20 hover:bg-slate-900/40"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-slate-200">{record.procedure}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        record.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : record.status === "scheduled"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                  
                  <span className="text-xs text-slate-400">
                    {record.date} • {record.dentistName}
                  </span>
                  
                  {record.notes && (
                    <p className="text-xs italic text-slate-500 mt-2 bg-black/10 rounded-lg p-2.5 border border-white/5">
                      {record.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 border-t border-white/5 pt-4 md:border-t-0 md:pt-0 justify-between">
                  <span className="text-lg font-bold text-slate-300">{record.cost}</span>
                  <button
                    onClick={() => onDownload(record.id)}
                    disabled={loadingId !== null}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-300 hover:bg-white/10 hover:border-white/30 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isRowLoading ? "Downloading..." : "Summary"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

## 3️⃣ The Shared UI Components Container (DRY Core Storage)

To avoid duplicate layouts, messy typography variants, or conflicting input fields across different portals, all generic UI elements must be housed inside the **Shared UI kernel Container**: `src/components/ui/` and `src/components/forms/`.

### Guidelines for UI Primitives:
* **Storage Location**: `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/select.tsx`.
* **DRY Code Rule**: If your friend creates a layout button, modal shell, skeleton loader, or custom text input that will be used more than once, it **MUST** go in the shared UI folder. No custom styling overrides should be copy-pasted across domain modules.
* **Primitive Props Structure**: Primitives must accept native React elements and styling wrappers (`className`) to ensure they are flexible but unified:

```typescript
// Example: src/components/ui/button.tsx
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const baseStyle = "rounded-xl px-5 py-2.5 font-semibold text-xs transition-all duration-300 active:scale-[0.98] disabled:opacity-50";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500",
    secondary: "border border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-900",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "text-slate-400 hover:text-slate-200",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
```

By following this **Mock-First Architecture** and combining it with the **Trivial State Exemption** (any component may manage simple layout toggles inline), your frontend developer has everything they need to write gorgeous, high-performance interfaces independently, while the backend code remains isolated and scalable.
