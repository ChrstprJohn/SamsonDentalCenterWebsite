# 📝 Task List: Improving and Fixing Patient Sign-Up & Authentication Flow

This file tracks progress on streamlining patient sign-up, fixing the OTP length mismatch, removing magic links, and verifying transaction atomicity.

---

## 🛠️ Planned Tasks

### 1. Fix OTP Length Mismatch (Support 8-Digit Codes)
Currently, the remote Supabase project is generating **8-digit OTP codes** (e.g., `57194889`), but the frontend form is hardcoded to a 6-digit layout, preventing patients from entering or verifying their codes.

- [x] **Configurable Length Constant**: Introduce a dynamic `OTP_LENGTH` configuration constant (set to `8` by default to match the remote Supabase setting) in `useOTPVerifyView`.
- [x] **Dynamic View Grid**: Refactor `otp-verify-view.tsx` to map over the dynamic `OTP_LENGTH` array and size input boxes responsively.
- [x] **Dynamic Hook Logic**: Update `use-otp-verify-view.hook.ts` and its spec tests to use the `OTP_LENGTH` variable for input indexing, backspace focusing, and length validation.
- [x] **Supabase Dashboard Instructions**: Provide clear documentation on how to change the OTP length back to 6 in the Supabase Dashboard if desired.

### 2. Remove Magic Link / OTP Login Options
We want to keep authentication simple and password-based. Native Supabase magic links and OTP-based logins are not required and should be completely removed.

- [x] **Clean Up Login Form**: Remove the Password/OTP toggle selector from `LoginForm` (`login-form.tsx`) so that the form only accepts standard email and password credentials.
- [x] **Clean Up Login Hook**: Remove the OTP submission branch and redirect parameters from `use-login-view.hook.ts`.
- [x] **Simplify Login Action**: Remove the `signInWithOtp` code block from `loginAction` (`login.action.ts`).
- [x] **Simplify Verify Action**: Refactor `verifyOtpAction` (`verify-otp.action.ts`) to only support `'signup'` verification types and remove references to `'magiclink'`.
- [x] **Simplify Verify Hook**: Clean up routing and search parameter logic related to `type=login` in `use-otp-verify-view.hook.ts`.

### 3. Verify & Guarantee Sign-Up Atomicity
Ensure that patient registration handles downstream failures (e.g., database outbox errors or trigger sync lags) without leaving orphaned accounts or data gaps.

- [x] **Review Repository Command**: Ensure `createPatientCommand` in `patient-profile.commands.ts` accurately triggers application-level rollbacks (deleting the Supabase Auth user if outbox insert or profile fetching fails).
- [x] **Refine Error Handling**: Verify that any Zod validation errors, Supabase errors, or database exceptions are caught and correctly mapped back to frontend input indicators.

---

## 📋 Instructions to Change OTP Length in Supabase Dashboard
If you ever want to change the OTP code length back to **6 digits** in the future:
1. Go to your **Supabase Dashboard**.
2. Select your project.
3. In the left-hand sidebar, navigate to **Authentication** (Key icon) -> **Providers**.
4. Scroll down to the **Email** provider accordion and expand it.
5. Look for the setting **OTP Length** (which is currently set to `8`).
6. Change the value to `6` and click **Save**.
7. Change the `OTP_LENGTH` constant in `use-otp-verify-view.hook.ts` (or our new config) from `8` back to `6`.
