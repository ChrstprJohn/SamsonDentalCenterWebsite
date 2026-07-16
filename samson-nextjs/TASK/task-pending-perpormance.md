# Audit: Pending Page Performance

## Findings

1. **Unused Server-Side Queries in Layout**
   - File: `src/app/(portals)/secretary-v2/layout.tsx`
   - Queries `getClinicConfigAction()`, `getUnreadNotifications()`, and `getUnreadCount()` executed on every SSR request.
   - Values never passed to components or used in layout.
   - Causes ~600ms-800ms of blocking sequential database calls before document HTML loads.

2. **Missing Database Indexes**
   - Table: `appointment_inquiries`
   - Query: `select(*).eq('status', status).order('created_at', { ascending: false })`
   - No index on `(status, created_at DESC)`. Leads to table scans as queue grows.

3. **Multiple Client Initialization**
   - Action: `getInquiriesAction`
   - Creates Supabase client twice: once in `getAuthenticatedUser()` and once in the action itself.

## Recommendations

1. **Remove Unused Layout Queries**
   - Clean up `clinicConfig`, `unreadNotifications`, and `unreadCount` from `src/app/(portals)/secretary-v2/layout.tsx`.
   - Result: Document load speed drops from ~1.03s to <200ms.

2. **Create Database Index**
   - Add index on `appointment_inquiries(status, created_at DESC)`.

3. **Optimize Client Instantiation**
   - Pass Supabase client or reuse context to avoid creating client multiple times per action.
