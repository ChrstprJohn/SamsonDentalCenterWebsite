# Forgot Password Flow - Tasks

## Issues Identified
The user reported that navigating through the forgot password flow fails to redirect them properly (or they end up on a 404 page). The root cause is a mismatch between the route pushed by the hook and the actual directory structure. Furthermore, the OTP input length was set to 6 digits, while the application requires an 8-digit OTP.

## Action Items
- [x] **Fix Forgot Password Hook Redirect**: 
  - **File**: `use-forgot-password-view.hook.ts`
  - **Change**: Update `router.push('/auth/verify-otp?...')` to `router.push('/auth/verify?...')`. 
  - **Reason**: The route directory is `src/app/(public)/auth/verify`, not `verify-otp`. This causes a 404 error during redirection.
- [x] **Ensure OTP Verification Hook Redirects Correctly**: 
  - **File**: `use-otp-verify-view.hook.ts`
  - **Status**: The hook correctly identifies `type === 'recovery'` and redirects to `/auth/reset-password` after successful verification. No action needed here.
- [x] **Ensure Reset Password Action Updates Auth**: 
  - **File**: `reset-password.action.ts`
  - **Status**: It correctly uses `supabase.auth.updateUser({ password })` and expects the session to be established by the OTP verification. No action needed here.
- [x] **Align OTP Length**:
  - **File**: `use-otp-verify-view.hook.ts`
  - **Change**: Updated `OTP_LENGTH` from 6 to 8. This correctly renders 8 input fields for both signup and forgot password flows. Unit tests confirm all parsing logic holds for an 8-digit OTP.
- [x] **Prevent Automatic Login After Reset**:
  - **File**: `reset-password.use-case.ts`, `reset-password.commands.ts`
  - **Change**: Added and injected a `signOutCommand` that invalidates the temporary session established by the OTP immediately after `supabase.auth.updateUser` succeeds.
  - **Reason**: Forces the user to manually log in using their new credentials, enhancing security and meeting the user's expected flow.
