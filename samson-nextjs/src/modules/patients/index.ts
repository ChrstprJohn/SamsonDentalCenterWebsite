// src/modules/patients/index.ts

// Export Data Transfer Objects & Types
export * from './dtos/register-patient.dto';

// You can optionally export Repositories or UseCases if cross-domain Orchestrators need them later
export * from './use-cases/register-patient.use-case';
export * from './repositories/patient-profile.commands';
export * from './repositories/patient-profile.queries';

// 🛑 EXTREMELY IMPORTANT: DO NOT EXPORT ACTIONS HERE
// Actions must be imported directly into UI components from the /actions folder!