# Task: Secretary Portal — Services Management Page

**Route**: `/secretary/services`
**Spec Reference**: `12-SERVICES.md`
**Architecture Rules**: Backend `1-ARCHITECTURE.md`, `1.5-CODING-PATTERNS.md`, `2-NEXTJS.md`, `3-CLEAN_CODE.md`, `4-TESTING_GUIDELINES.md` | Frontend `1-ARCHITECTURE.md`, `2-REACT-COMPONENTS.md`, `3-REACT-HOOKS.md`, `4-CODING-PATTERNS.md`, `5-TESTING_GUIDELINES.md`

---

## 🗄️ PHASE 1: Backend — Module Setup (`src/modules/services/`)

> One file = one operation. No combining. All layers must match subfolders (`management/`).

### DTOs

- [x] Create `src/modules/services/dtos/management/create-service.dto.ts`
  - Zod schema: `createServiceSchema` (name, description, tag, basePrice, durationMinutes, imageUrl?)
  - Export inferred type: `CreateServiceDto`
  - camelCase fields only (no snake_case in app layer)
- [x] Create `src/modules/services/dtos/management/create-service.dto.spec.ts`
  - Test: valid input passes
  - Test: missing required field fails
  - Test: invalid tag value fails
  - Test: negative price fails
- [x] Create `src/modules/services/dtos/management/update-service.dto.ts`
  - Extends `createServiceSchema.partial()` + adds `id: z.string().uuid()`
  - Export: `updateServiceSchema`, `UpdateServiceDto`
- [x] Create `src/modules/services/dtos/management/update-service.dto.spec.ts`
  - Test: partial update (only name) passes
  - Test: missing `id` fails
- [x] Create `src/modules/services/dtos/management/service-response.dto.ts`
  - `serviceDbSchema` (snake_case raw DB shape)
  - `serviceResponseSchema` with `.transform()` → camelCase output
  - Export: `ServiceResponseDto`
  - Fields: `id`, `name`, `description`, `tag`, `basePrice`, `durationMinutes`, `imageUrl`, `status`, `displayOrder`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- [x] Create `src/modules/services/dtos/management/service-response.dto.spec.ts`
  - Test: transform maps `base_price` → `basePrice`, `duration_minutes` → `durationMinutes`, etc.
  - Test: invalid DB row throws
- [x] Create `src/modules/services/dtos/index.ts`
  - Barrel re-export only (no logic)

### Repositories

- [x] Create `src/modules/services/repositories/management/service.queries.ts`
  - `getServicesQuery(supabase)` → async fn: returns `ServiceResponseDto[]`, parsed via `serviceResponseSchema`
  - `getServiceByIdQuery(supabase)` → async fn: returns `ServiceResponseDto | null`
  - Never filter by `service.status` in appointment-related queries (decoupling rule)
- [x] Create `src/modules/services/repositories/management/service.queries.spec.ts`
  - Mock Supabase client via `vi.mock`
  - Test: returns mapped camelCase list
  - Test: returns null when not found
- [x] Create `src/modules/services/repositories/management/service.commands.ts`
  - `createServiceCommand(supabase)` → async fn: inserts, returns `ServiceResponseDto`
  - `updateServiceCommand(supabase)` → async fn: updates, returns `ServiceResponseDto`
  - `archiveServiceCommand(supabase)` → async fn: sets `status = 'ARCHIVED'`
  - `toggleServiceVisibilityCommand(supabase)` → async fn: toggles `status` between `ACTIVE` ↔ `HIDDEN`
  - All commands parse result through `serviceResponseSchema.parse()`
- [x] Create `src/modules/services/repositories/management/service.commands.spec.ts`
  - Mock Supabase client
  - Test: `createServiceCommand` inserts correct `snake_case` DB payload
  - Test: `archiveServiceCommand` sets `status = 'ARCHIVED'` only
  - Test: `toggleServiceVisibilityCommand` flips ACTIVE→HIDDEN and HIDDEN→ACTIVE

### Use Cases

- [x] Create `src/modules/services/use-cases/management/create-service.use-case.ts`
  - Pure fn: `createServiceUseCase(createService)` → accepts `CreateServiceDto`, returns `ServiceResponseDto`
  - Full write chain required (Clean Code write rule)
- [x] Create `src/modules/services/use-cases/management/create-service.use-case.spec.ts`
  - Mock `createService` command fn
  - Test: valid input calls command with correct data
- [x] Create `src/modules/services/use-cases/management/update-service.use-case.ts`
  - Pure fn: `updateServiceUseCase(updateService)` → accepts `UpdateServiceDto`
- [x] Create `src/modules/services/use-cases/management/update-service.use-case.spec.ts`
- [x] Create `src/modules/services/use-cases/management/archive-service.use-case.ts`
  - Pure fn: `archiveServiceUseCase(archiveService)` → accepts `{ id: string }`
- [x] Create `src/modules/services/use-cases/management/archive-service.use-case.spec.ts`
- [x] Create `src/modules/services/use-cases/management/toggle-service-visibility.use-case.ts`
  - Pure fn: `toggleServiceVisibilityUseCase(toggleVisibility)` → accepts `{ id: string, currentStatus: ServiceStatus }`
- [x] Create `src/modules/services/use-cases/management/toggle-service-visibility.use-case.spec.ts`

### Server Actions

> Thin actions: parse → inject deps → call use-case. `'use server'` at top. Must verify session before execution.

- [x] Create `src/modules/services/actions/management/get-services.action.ts`
  - `'use server'`
  - Read shortcut allowed (no use-case needed — pure query per Clean Code §4)
  - Verify session. Call `getServicesQuery`. Return `{ data }` or `{ error }`
- [x] Create `src/modules/services/actions/management/get-services.action.spec.ts`
  - Mock `getServicesQuery`
  - Test: returns data list on success
  - Test: returns error object on failure
- [x] Create `src/modules/services/actions/management/create-service.action.ts`
  - `'use server'`
  - Parse with `createServiceSchema` → inject deps → call use-case → `revalidatePath('/secretary/services')`
- [x] Create `src/modules/services/actions/management/create-service.action.spec.ts`
  - Mock use-case and Supabase client
  - Test: invalid input returns `{ error }` without calling use-case
  - Test: valid input returns `{ data }` and calls `revalidatePath`
- [x] Create `src/modules/services/actions/management/update-service.action.ts`
  - `'use server'`
  - Parse `updateServiceSchema` → inject deps → call use-case → `revalidatePath`
- [x] Create `src/modules/services/actions/management/update-service.action.spec.ts`
- [x] Create `src/modules/services/actions/management/archive-service.action.ts`
  - `'use server'`
  - Verify session → call `archiveServiceUseCase` → `revalidatePath`
- [x] Create `src/modules/services/actions/management/archive-service.action.spec.ts`
  - Test: already ARCHIVED service returns early / no-op
- [x] Create `src/modules/services/actions/management/toggle-service-visibility.action.ts`
  - `'use server'`
  - Verify session → call `toggleServiceVisibilityUseCase` → `revalidatePath`
- [x] Create `src/modules/services/actions/management/toggle-service-visibility.action.spec.ts`

### Module Facade

- [x] Create `src/modules/services/index.ts`
  - Re-export DTOs via `./dtos/index`
  - Re-export query functions only
  - ⚠️ Do NOT re-export server actions here (import them directly in UI components)

---

## 🎨 PHASE 2: Frontend — Module Setup (`src/modules/services/`)

> `'use client'` only in hooks/, views/, and stateful components. RSC page fetches data, passes as props.

### Types

- [x] Create `src/modules/services/types.ts` (or co-locate with hooks)
  - `ServiceStatus = 'ACTIVE' | 'HIDDEN' | 'ARCHIVED'`
  - `ServiceTag = 'GENERAL' | 'SPECIALIZED'`
  - `Service` interface (camelCase: `basePrice`, `durationMinutes`, `imageUrl`, `createdBy`, etc.)

### Zod Form Schemas (Hook-Layer)

- [x] Create `src/modules/services/hooks/use-service-form-schema.ts`
  - `createServiceFormSchema` → validates: name, description, tag, basePrice, durationMinutes, imageFile
  - Export: `CreateServiceFormValues`

### Custom Hooks

- [x] Create `src/modules/services/hooks/services/use-services-view.ts`
  - `'use client'`
  - Manages: selected service ID, status filter, tag filter, search query
  - Derives filtered list from props (no `useEffect` data fetch — data comes from RSC props)
  - Export: `selectedServiceId`, `setSelectedServiceId`, `statusFilter`, `setStatusFilter`, `tagFilter`, `setTagFilter`, `searchQuery`, `setSearchQuery`, `filteredServices`
- [x] Create `src/modules/services/hooks/services/use-services-view.spec.ts`
  - Test: status + tag filters are independent and stack correctly
  - Test: search filters by name (case-insensitive)
  - Test: default statusFilter = `'ACTIVE'`, default tagFilter = `'ALL'`
- [x] Create `src/modules/services/hooks/services/use-service-form.ts`
  - `'use client'`
  - Zod + RHF form hook for Add/Edit
  - Delegates mutations to `createServiceAction` or `updateServiceAction`
  - Manages: `isSubmitting`, `serverError`, `isSuccess`
  - On success: calls provided `onSuccess` callback
- [x] Create `src/modules/services/hooks/services/use-service-form.spec.ts`
  - Mock `createServiceAction`
  - Test: invalid form (empty name) blocks action call
  - Test: valid form calls action with correct payload
  - Test: server error sets `serverError` without hiding form
- [x] Create `src/modules/services/hooks/services/use-service-detail.ts`
  - `'use client'`
  - Manages: edit mode toggle (`isEditing`, `setIsEditing`), archive confirmation modal open state
  - Delegates: archive → `archiveServiceAction`, toggle → `toggleServiceVisibilityAction`
  - Manages: `isPending`, `serverError`
- [x] Create `src/modules/services/hooks/services/use-service-detail.spec.ts`
  - Mock `archiveServiceAction`, `toggleServiceVisibilityAction`
  - Test: archive calls action and closes modal on success
  - Test: toggle flips ACTIVE→HIDDEN correctly

### Dumb Presentational Components

> 150-line max per file. No business logic. No DB calls. Strictly typed props.

- [x] Create `src/modules/services/components/service-card.tsx`
  - Displays: thumbnail, name, base price (₱), duration, tag badge, status badge
  - Props: `service: Service`, `isSelected: boolean`, `onClick: () => void`
  - Named export `ServiceCard`
- [x] Create `src/modules/services/components/service-list.tsx`
  - Renders scrollable list of `<ServiceCard />` items
  - Props: `services: Service[]`, `selectedId: string | null`, `onSelect: (id: string) => void`
  - Renders empty state if `services.length === 0`
  - Named export `ServiceList`
- [x] Create `src/modules/services/components/service-list-header.tsx`
  - Search bar, Status filter dropdown, Tag filter dropdown, "+ Add Service" button
  - Props: `searchQuery`, `onSearchChange`, `statusFilter`, `onStatusFilterChange`, `tagFilter`, `onTagFilterChange`, `onAddService: () => void`
  - Named export `ServiceListHeader`
- [x] Create `src/modules/services/components/service-detail-panel.tsx`
  - Displays: large image banner, name, tag, description, base price, duration
  - Top header: "Online Booking" toggle switch, "Archive" button, "Edit" button
  - Props: `service: Service`, `onToggleVisibility`, `onArchive`, `onEdit`, `isPending: boolean`
  - Renders empty selection state if no service selected
  - Named export `ServiceDetailPanel`
- [x] Create `src/modules/services/components/service-form.tsx`
  - Inline form: name, description, tag radio, base price, duration select, image dropzone
  - Props: `register`, `errors`, `serverError`, `isSubmitting`, `onSubmit`, `onCancel`, `defaultValues?`
  - Image dropzone: JPG/PNG/WebP, max 2MB
  - Named export `ServiceForm`
- [x] Create `src/modules/services/components/archive-confirm-modal.tsx`
  - Confirmation modal with warning message per spec
  - Props: `isOpen: boolean`, `onConfirm: () => void`, `onCancel: () => void`, `isPending: boolean`
  - Named export `ArchiveConfirmModal`

### View Orchestrator

- [x] Create `src/modules/services/views/services-view.tsx`
  - `'use client'`
  - Binds `useServicesView` hook + `useServiceForm` hook + `useServiceDetail` hook
  - Props from RSC: `initialServices: Service[]`
  - Renders 2-column split-pane (`lg:grid-cols-12`, left `lg:col-span-5`, right `lg:col-span-7`)
  - Left: `<ServiceListHeader />` + `<ServiceList />`
  - Right: `<ServiceDetailPanel />` or `<ServiceForm />` depending on edit mode
  - Named export `ServicesView`

### Module Exports

- [x] Create `src/modules/services/exports.ts`
  - Export `ServicesView` and shared types only
  - Never use `index.ts` barrel for mixed server/client exports

---

## 🗺️ PHASE 3: Routing & RSC Page

- [x] Create `src/app/(portals)/secretary/services/page.tsx`
  - **No** `'use client'`
  - Fetch initial services via `getServicesQuery` (or action) at RSC boundary
  - Map raw DB result through `serviceResponseSchema` before passing to view
  - Verify session (redirect to login if unauthorized)
  - Pass `initialServices` as prop to `<ServicesView />`
  - No inline business logic

---

## 🖼️ PHASE 4: Image Upload (Supabase Storage)

- [x] Implement image upload helper: `src/modules/services/utils/upload-service-image.ts`
  - Client-side util: uploads file to `services-images` Supabase Storage bucket
  - Returns public URL
  - Validates format (JPG/PNG/WebP) and size (≤ 2MB) before upload
- [x] Wire image upload into `use-service-form.ts` hook flow
  - Upload image first → get URL → include in form submission payload
- [x] Adding and editing of service images is already working

---

## 📺 PHASE 4.5: Frontend Image Display & Stale Data Fixes

- [x] Frontend displays the service images properly
  - Render image thumbnails in `service-card.tsx`
  - Render large image banner in `service-detail-panel.tsx`
  - Render existing image preview in `service-form.tsx`
- [x] Adding, editing, and visibility toggling are fully working without stale data issues
  - Call `revalidatePath('/secretary/services')` in backend server actions (`create-service.action.ts`, `update-service.action.ts`)
  - Use `router.refresh()` on success in form hook (`use-service-form.ts`) and details action hook (`use-service-detail.ts`) to sync props immediately



---

## ✅ PHASE 5: Testing Checklist Summary

### Unit Tests (80%) — Vitest, no real DB

- [x] All `.dto.spec.ts` files (Zod validation edge cases)
- [x] All `.use-case.spec.ts` files (mocked repo commands)
- [x] All `.action.spec.ts` files (mocked use-cases + Supabase)
- [x] All `use-*.spec.ts` hook files (mocked server actions via `vi.mock`)

### Integration Tests (15%) — Real Supabase (isolated env)

- [x] `service.queries.spec.ts` against test DB
- [x] `service.commands.spec.ts` against test DB

### E2E Tests (5%) — Playwright

- [x] Create `e2e/portals/secretary-services.spec.ts`
  - Test: secretary can log in and view services list
  - Test: secretary can add a new service → appears in list as ACTIVE
  - Test: secretary can toggle service to HIDDEN → disappears from status=ACTIVE filter
  - Test: secretary can archive service → confirmation modal appears → service moves to ARCHIVED
  - Test: secretary can edit service name → changes reflected in detail pane

---

## 📋 Naming & Convention Checklist

- [x] All filenames: `kebab-case` with double extension (`create-service.action.ts`, `service.queries.ts`)
- [x] All component filenames: `kebab-case.tsx`, named exports PascalCase
- [x] All hook filenames: `use-kebab-case.ts`, named exports camelCase
- [x] Zod schemas: camelCase ending in `Schema` (`createServiceSchema`)
- [x] Inferred types (backend DTOs): PascalCase ending in `Dto` (`CreateServiceDto`)
- [x] Inferred types (frontend forms): PascalCase ending in `FormValues` (`CreateServiceFormValues`)
- [x] No `any` types — use `unknown` + Zod parse instead
- [x] No `snake_case` in app layer — only in DB payloads inside repositories
- [x] No default exports — named exports only
- [x] `'use client'` on: all files in `hooks/`, `views/`, and stateful components
- [x] `'use server'` on: all files in `actions/`
- [x] `import 'server-only'` on: `*.server.ts` files if created
- [x] All server actions verify session before executing logic
- [x] No component exceeds 150 lines — extract to `sub-components/` if exceeded
- [x] No `useEffect` for data fetching in hooks — initial data from RSC props only
- [x] Errors rendered **alongside** forms, never **replacing** them (no disappearing form bug)
