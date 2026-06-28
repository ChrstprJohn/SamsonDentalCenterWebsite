# 🔄 Phase 8: Mock Swap & Schema Alignment Checklist

This is the comprehensive checklist for mapping all of your backend repositories and server actions to the newly created 3NF PostgreSQL schema. 

Previously, your repositories were written targeting hypothetical tables (like `.from('patients')`). We must now align them to the actual, optimized schema (like `.from('users').eq('role', 'PATIENT')`).

## 1. Authentication & Users Domain
- [x] **`register-patient.action.ts`**: Swap the logic to use `supabase.auth.signUp()`. The database trigger we created will automatically insert the user into the `users` table, so the repository `INSERT` can be bypassed entirely.
- [x] **`login.action.ts`**: (Not needed yet) Implement `supabase.auth.signInWithPassword()`.
- [x] **`patient-profile.queries.ts`**: Change `.from('patients')` to `.from('users').eq('role', 'PATIENT')`. Map snake_case database columns to camelCase DTOs.
- [x] **`staff-profile.queries.ts` & `commands`**: Change `.from('staff')`/`.from('doctors')` to `.from('users')` filtering by `SECRETARY`, `DOCTOR`, or `ADMIN`.

## 2. Dependents Domain
- [x] **`patient-dependents.queries.ts`**: Ensure querying `.from('dependents')` joins back correctly to the `users` table as the parent.
- [x] **`patient-dependents.commands.ts`**: Ensure the `INSERT` maps `firstName`, `lastName`, `dateOfBirth`, and `relationship`.

## 3. Appointments & Booking Domain (Most Complex)
- [x] **`appointment-booking.commands.ts`**: Update the `INSERT` into `appointments`. It needs to calculate the `end_time` by adding the service's `duration_minutes` to the `start_time`. 
- [x] **Booking Constraint Handling**: Catch the PostgreSQL `no_overlapping_appointments` constraint error (code `23P01` or similar) in the Server Action and convert it into a clean `ValidationError` for the frontend.
- [x] **`appointment-availability.queries.ts`**: 
  1. Query `doctor_schedules` to get the base operating hours for the specific doctor on that `day_of_week`.
  2. Query `appointments` to get all existing overlapping `start_time` / `end_time` blocks for that doctor on that date.
  3. Calculate and return only the available 30-minute blocks.
- [x] **`patient-appointments.queries.ts`**: Update the Supabase join query from `doctor:doctors(...)` to `doctor:users!doctor_id(first_name, last_name, avatar_url)`.

## 4. Clinic Config & Services Domain
- [x] **`clinic-config.queries.ts`**: Changed `.from('clinic_settings')` to `.from('clinic_config').eq('is_singleton', true)`. (Completed)
- [x] **`service.queries.ts`**: Ensure column names perfectly map `duration_minutes` and `service_type`.

## 5. Billing & Clinical Treatment Domain
- [x] **`treatment.commands.ts`**: When a doctor submits treatment, it must now `INSERT` multiple rows into `appointment_treatments` for the actual services rendered, rather than saving an array of IDs into a text column.
- [x] **`invoice.commands.ts`**: Map `generateInvoice` to create a row in the `invoices` table linked to the `appointment_id`.

## 6. Audit Logs Domain
- [x] **`audit-log.commands.ts`**: Ensure it targets `.from('audit_logs')` with the generic UUID `target_id`.
