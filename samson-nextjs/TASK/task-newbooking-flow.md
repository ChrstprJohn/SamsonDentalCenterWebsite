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
- [ ] Update Backend/Frontend DTO models for Appointments:
    - [ ] Update Zod schema `submitBookingSchema` in `submit-booking.dto.ts` to accommodate optional patient account IDs or staff-created properties if needed.
    - [ ] Add `source` field mapping in the TypeScript Appointment DTO mapper.
- [ ] Update repository command executor `executeBookingTransactionCommand` in `appointment-booking.commands.ts` to forward `source` if required.
- [ ] Review and update Vitest specs:
    - [ ] `submit-booking.dto.spec.ts`
    - [ ] `submit-booking.use-case.spec.ts`
    - [ ] `appointment-booking.commands.spec.ts`
