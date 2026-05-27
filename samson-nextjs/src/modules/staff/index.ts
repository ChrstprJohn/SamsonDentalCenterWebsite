// src/modules/patients/index.ts

// Export Data Transfer Objects & Types
export * from './dtos/create-staff.dto';

// You can optionally export Repositories or UseCases if cross-domain Orchestrators need them later
export * from './use-cases/create-staff.use-case';
export * from './repositories/staff-profile.commands';
export * from './repositories/staff-profile.queries';

// 🛑 EXTREMELY IMPORTANT: DO NOT EXPORT ACTIONS HERE
// Actions must be imported directly into UI components from the /actions folder!