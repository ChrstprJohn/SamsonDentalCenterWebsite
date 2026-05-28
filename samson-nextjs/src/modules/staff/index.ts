// src/modules/staff/index.ts

// Export Data Transfer Objects & Types
export * from './dtos/create-staff.dto';
export * from './dtos/update-staff.dto';
export * from './dtos/doctor-schedule.dto';

// You can optionally export Repositories or UseCases if cross-domain Orchestrators need them later
export * from './use-cases/create-staff.use-case';
export * from './use-cases/update-staff.use-case';
export * from './use-cases/terminate-staff.use-case';
export * from './use-cases/update-doctor-schedule.use-case';
export * from './repositories/staff-profile.commands';
export * from './repositories/staff-profile.queries';
export * from './repositories/staff-schedule.commands';

// 🛑 EXTREMELY IMPORTANT: DO NOT EXPORT ACTIONS HERE
// Actions must be imported directly into UI components from the /actions folder!
