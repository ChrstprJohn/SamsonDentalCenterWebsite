# Task: Staff Login & Domain Separation

Enforce separate login portals for patients (`samsondental.com/login`) and staff (`staff-samsondental.com/login`) via subdomain detection, Next.js Middleware rewrites, and role-based redirect guards.

---

## 📋 Task List

### 1. Middleware & Routing Separation
- [x] **Create nextjs middleware** at `src/middleware.ts` with optimized matcher (ignores static assets, styles, fonts, images).
- [x] **Add hostname detection** inside middleware using `request.headers.get('host')`.
- [x] **Implement route rewrites**:
  - Rewrite `/login` to `/auth/staff-login` if requesting from `staff-*` subdomain.
  - Rewrite `/login` to `/auth/login` for patients on apex domain.
- [x] **Implement role-based redirect boundaries**:
  - Redirect logged-in staff (`ADMIN`, `SECRETARY`, `DOCTOR`) off apex domain to `staff-samsondental.com`.
  - Redirect logged-in patients (`PATIENT`) off staff subdomain to `samsondental.com`.

### 2. Staff Auth Module Development (Following v3.0 Functional Modulith)
- [x] **Define DTOs**:
  - Create DTO: `src/modules/staff/dtos/auth/staff-login.dto.ts` (validate credentials).
  - Create Response DTO: `src/modules/staff/dtos/auth/staff-login-response.dto.ts` (camelCase metadata mapping). (Note: staffLoginSchema and type StaffLoginDto cover validation; skipped redundant wrapper schemas).
  - Write DTO validation unit tests: `*.dto.spec.ts`.
- [x] **Implement Repository Commands**:
  - Create commands: `src/modules/staff/repositories/auth/staff-login.commands.ts` (wrap supabase signInWithPassword, return transformed data).
  - Write co-located repository tests: `*.commands.spec.ts`.
- [x] **Implement Use Case**:
  - Create use case: `src/modules/staff/use-cases/auth/staff-login.use-case.ts` (contain staff business validation, e.g. reject patient logins).
  - Write co-located use case unit tests: `*.use-case.spec.ts`.
- [x] **Implement Server Action**:
  - Create server action: `src/modules/staff/actions/auth/staff-login.action.ts` (`'use server'`; thin entry point, validate inputs, execute use case).
  - Write co-located server action unit tests: `*.action.spec.ts`.

### 3. UI & Portal Integration
- [x] **Create Staff Login View**:
  - Create `src/modules/staff/views/staff-login-view.tsx` and hook logic `use-staff-login-view.hook.ts`.
- [x] **Create Staff Login Page Routing**:
  - Create `src/app/(public)/auth/staff-login/page.tsx` mapping to `StaffLoginView`.
- [x] **Update Client Redirect Logic**:
  - Update staff login hook to redirect successful login to `/admin`, `/secretary`, or `/doctor` portal.

### 4. Verification & Testing
- [x] **Run Unit Tests**: Check all new `.spec.ts` files pass with Vitest.
- [x] **Verification**: Verify domain routing works in local development environment.

---

## 🛠️ What Was Done
1. **Middleware routing**: Added `src/middleware.ts` to intercept `/login` routing. Uses host header detection (`staff-*`).
2. **Staff Domain Module**: Created clean, functional layer files inside `src/modules/staff` mapping validation DTOs $\rightarrow$ commands $\rightarrow$ use case $\rightarrow$ server actions. Built a rule blocking `PATIENT` logins.
3. **UI Integration**: Added `StaffLoginView`, `StaffLoginForm`, and `/auth/staff-login` page route.

---

## 🧪 How to Test Manually

### 1. Localhost Testing (Query Parameter Fallback)
For easy testing on local server without configuring hosts/DNS:
- **Patient Login View**: Visit `http://localhost:3000/login`
- **Staff Login View**: Visit `http://localhost:3000/login?staff=true`

### 2. Subdomain Simulation (Hosts File)
To test full domain detection locally:
1. Open hosts file (Windows: `C:\Windows\System32\drivers\etc\hosts`) as administrator.
2. Add:
   ```text
   127.0.0.1 samsondental.local
   127.0.0.1 staff-samsondental.local
   ```
3. Run dev server: `pnpm dev`
4. Access:
   - `http://samsondental.local:3000/login` $\rightarrow$ Patient login form.
   - `http://staff-samsondental.local:3000/login` $\rightarrow$ Staff login form.
