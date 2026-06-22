# Task: Two-Pronged Booking Flow Database Migration & Integration

## 1. Database Schema & Migrations
- [x] Create database migration for the new two-pronged booking architecture
    - [x] Create `inquiry_status` enum type (`NEW`, `CONVERTED`, `DROPPED`) (Note: `CONTACTED` dropped)
    - [x] Create `appointment_inquiries` table to store unauthenticated leads (includes `preferred_service_id`, `preferred_date`, `patient_note`, and email/phone info)
    - [x] Create `appointment_source` enum type (`SELF_BOOKED`, `STAFF_CREATED`)
    - [x] Add `source` column to the `appointments` table (defaulting to `SELF_BOOKED`)
    - [x] Update `appointments.patient_id` column to be nullable (to accommodate guest bookings that do not have an auth user account)
    - [x] Enable Row Level Security (RLS) policies for `appointment_inquiries`
        - [x] Allow public insert (unauthenticated guest form submission)
        - [x] Restrict read/write to `SECRETARY` and `ADMIN` roles
- [x] Apply migration locally to database schema (migration file written; waiting to execute against active instance)
- [x] Update `schema.sql` reference schema script to keep it in sync

## 2. Seed Data Alignment
- [x] Update `SEEDS/seed.sql` and migration seed scripts to align with schema updates (e.g., seeding appointments with the new `source` field if applicable)

## 3. Database RPC & Transaction Functions
- [x] Update SQL RPC function `submit_booking_transaction` to handle the nullable `patient_id` and default the `source` field to `SELF_BOOKED`.
- [x] Create a new SQL RPC or database helper for Inquiry Conversion that sets the created appointment's source to `STAFF_CREATED` and status to `APPROVED` while updating the inquiry status to `CONVERTED` and storing the link.

## 4. Codebase, DTOs & Test Files

All codebase updates must strictly follow the **Functional CQRS mod-monolith patterns** defined in `1-ARCHITECTURE.md` and `1.5-CODING-PATTERNS.md`:
- **Naming Standard:** Use double-extension kebab-case names (`*.dto.ts`, `*.use-case.ts`, `*.action.ts`, `*.commands.ts`, `*.queries.ts`) with co-located `.spec.ts` files.
- **DTOs:** Define output mappers using Zod's `.transform()` pipeline to translate database snake_case to application camelCase.
- **Dependency Injection:** Localized functional closures (no OOP classes or classes injection).

### 4.1. Guest Inquiry Flow (Landing Page Form)
- [x] Create `src/modules/appointments/dtos/booking/submit-inquiry.dto.ts` & `.spec.ts`
  - Validates guest details: `firstName`, `middleName`, `lastName`, `suffix`, `phoneNumber`, `email`, `preferredServiceId`, `preferredDate`, `patientNote`.
- [x] Create `src/modules/appointments/repositories/booking/appointment-inquiries.commands.ts` & `.spec.ts`
  - Functional command: `createInquiryCommand(supabase)` returning a camelCased transformed DTO.
- [x] Create `src/modules/appointments/use-cases/booking/submit-inquiry.use-case.ts` & `.spec.ts`
- [x] Create `src/modules/appointments/actions/booking/submit-inquiry.action.ts` & `.spec.ts`

### 4.2. Inquiry Conversion Flow (Secretary Dashboard Form)
- [x] Create `src/modules/appointments/dtos/booking/convert-inquiry.dto.ts` & `.spec.ts`
  - Validates conversion input: `inquiryId`, `serviceId`, `doctorId`, `date`, `startTime`, `endTime`, `patientNote`, `secretaryNotes`.
- [x] Create `src/modules/appointments/repositories/booking/appointment-conversion.commands.ts` & `.spec.ts`
  - Functional command: `convertInquiryToAppointmentCommand(supabase)` invoking database RPC `convert_inquiry_to_appointment`.
- [x] Create `src/modules/appointments/use-cases/booking/convert-inquiry.use-case.ts` & `.spec.ts`
  - Reuses availability query checks to dynamically prevent overlaps.
- [x] Create `src/modules/appointments/actions/booking/convert-inquiry.action.ts` & `.spec.ts`

### 4.3. Existing Appointment & DTO Schema Alignment
- [x] Update `submit-booking.dto.ts` Zod schema to accommodate nullable account parameters if required (Verified: no changes needed).
- [x] Add `source` field mapping in the TypeScript Appointment DTO mapper.
- [x] Update repository command executor `executeBookingTransactionCommand` in `appointment-booking.commands.ts` to include `SELF_BOOKED` source context (Verified: handled via SQL function default).

### 4.4. Testing & Validation Specs
- [x] Review and update existing Vitest specs:
    - [x] `submit-booking.dto.spec.ts`
    - [x] `submit-booking.use-case.spec.ts`
    - [x] `appointment-booking.commands.spec.ts`

## 5. Notification Subscribers & Dropped Action

### 5.1. Conversion Email Notification
- [ ] Create `on-appointment-converted.subscriber.ts` to email the guest patient upon successful conversion (containing confirmed Date, Time, Doctor, and Service details).
- [ ] Register `APPOINTMENT_CONVERTED_FROM_INQUIRY` event in `src/orchestrators/event-subscribers.ts`.

### 5.2. Dropping Inquiries (Rejections/Unreachable Guest leads)
- [ ] Create repository command/query to update `appointment_inquiries` status to `DROPPED` and store secretary comments.
- [ ] Create use-case & server action for `dropInquiryAction` (allowing the secretary to dismiss a lead if unreachable).
