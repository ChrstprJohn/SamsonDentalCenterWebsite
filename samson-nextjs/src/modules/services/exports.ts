/**
 * Public facade for the Services module.
 * Direct cross-module imports through this file to avoid boundary bleeding.
 */

// Export DTOs (via barrel — each DTO is in its own file)
export * from "./dtos/exports";

// Export Repositories
export * from "./repositories/management/service.commands";
export * from "./repositories/management/service.queries";

// Export Use Cases
export * from "./use-cases/management/create-service.use-case";
export * from "./use-cases/management/get-services.use-case";
export * from "./use-cases/management/get-service-by-id.use-case";
export * from "./use-cases/management/update-service.use-case";
export * from "./use-cases/management/delete-service.use-case";
export * from "./use-cases/management/archive-service.use-case";
export * from "./use-cases/management/toggle-service-visibility.use-case";
