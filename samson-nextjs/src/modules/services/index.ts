// Public API Facade for Services Domain
// Note: Per architecture rules, DO NOT export server actions here.

// Export DTOs (via barrel — each DTO is in its own file)
export * from "./dtos/index";

// Export Repositories
export * from "./repositories/management/service.commands";
export * from "./repositories/management/service.queries";

// Export Use Cases
export * from "./use-cases/management/create-service.use-case";
export * from "./use-cases/management/get-services.use-case";
export * from "./use-cases/management/get-service-by-id.use-case";
export * from "./use-cases/management/update-service.use-case";
export * from "./use-cases/management/delete-service.use-case";
