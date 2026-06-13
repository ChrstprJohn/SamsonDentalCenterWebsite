# Task: Appointment Details Performance Improvements

## Overview
Currently, clicking the "View" button for an appointment detail page exhibits a noticeable delay or UI freeze. This is primarily caused by sequential server-side data fetching and the lack of an immediate loading state during the Next.js route transition.

## 📋 Proposed Tasks (No Caching)

### 1. Add Instant Loading State (`loading.tsx`)
- **Issue**: Without a `loading.tsx` file, Next.js blocks the client-side navigation until the server has completely finished fetching data and rendering the new page. This causes the app to feel unresponsive.
- **Action**: Create `src/app/(portals)/user/appointments/[id]/loading.tsx` to display a skeleton UI immediately upon clicking "View". This provides instant visual feedback while the server fetches data.

### 2. Parallelize Data Fetching
- **Issue**: In `src/app/(portals)/user/appointments/[id]/page.tsx`, `getClinicConfigAction()` and `getAppointmentByIdAction(id)` are awaited sequentially. The page rendering time is the sum of both network requests.
- **Action**: Refactor the page component to initiate both requests concurrently using `Promise.all`. This will cut the server processing time significantly.

### 3. Optimize the Appointment Detail View Loading
- **Issue**: We can further split the page into Suspense boundaries if necessary, though parallel fetching + `loading.tsx` will usually suffice for this level of detail.
- **Action**: Keep the component as a Server Component but ensure any heavy UI components are dynamically loaded or adequately skeleton-backed.

### 4. Optimize Server Action Connection Overhead
- **Issue**: Each server action (`getClinicConfigAction` and `getAppointmentByIdAction`) instantiates its own `createClient()` for Supabase. 
- **Action**: Ensure that connection pooling is utilized (already handled by Supabase Next.js SSR package, but worth verifying no redundant calls are blocking the event loop).

## ⏳ In Progress
- [x] Implement `loading.tsx` for immediate visual feedback.
- [x] Refactor `[id]/page.tsx` to use `Promise.all` for parallel data fetching.
