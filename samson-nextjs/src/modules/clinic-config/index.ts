// Public API Facade for Clinic Config Domain
// Note: Per architecture rules, DO NOT export server actions here.

// Export DTOs (via barrel — each DTO is in its own file)
export * from "./dtos/index";

// Export Repositories
export * from "./repositories/settings/clinic-config.commands";
export * from "./repositories/settings/clinic-config.queries";

// Export Use Cases
export * from "./use-cases/settings/get-clinic-config.use-case";
export * from "./use-cases/settings/update-clinic-config.use-case";
