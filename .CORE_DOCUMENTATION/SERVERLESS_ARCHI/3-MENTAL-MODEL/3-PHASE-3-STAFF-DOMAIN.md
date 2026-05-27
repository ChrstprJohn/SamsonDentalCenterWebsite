# Phase 3: Staff Domain (Applying The Pattern)

Now that the flow is established, Phase 3 is about replicating the exact same architectural pattern, but applying it to the Clinic Staff (Doctors, Admins, Secretaries).

## 1. DTO Definition First
We begin by defining the shapes of the data moving in and out of the Staff Domain (e.g., `create-staff.dto.ts`, `update-schedule.dto.ts`).

## 2. Preventing God Classes in Repositories
Just like we split `patient-profile.commands` and `patient-profile.queries`, the Staff domain needs similar isolation:
* `staff-profile.commands.ts` (For updating personal details)
* `staff-schedule.commands.ts` (For modifying clinic working hours)

## 3. Strict Segmentation in Actions
To ensure technical debt stays low, we do not create one massive `staff.action.ts`. We segment by Actor or Sub-resource:
* `admin-staff.actions.ts` (Only Admins can do these - e.g., terminate an employee).
* `doctor-schedule.actions.ts` (Only Doctors can do these - e.g., view their weekly shifts).
* `profile.actions.ts` (Any logged-in staff can update their own phone number).

## Goal
By strictly adhering to the exact same dependency chain (Action -> UseCase -> Repo), the Staff domain will remain fully isolated. If an issue occurs with doctor scheduling, we know exactly which `use-case` to test, and it will have zero risk of breaking the Patients domain.