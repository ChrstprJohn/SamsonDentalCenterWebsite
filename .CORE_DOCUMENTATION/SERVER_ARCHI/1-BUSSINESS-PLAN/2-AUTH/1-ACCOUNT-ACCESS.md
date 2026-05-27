# Account Access — Authentication Flow

## Overview

All booking access requires a confirmed user account. Visitors must sign up or log in before they can enter the booking wizard. Account creation is confirmed via OTP sent to the user's email.

---

## Registration

### Required Fields

| Field | Required | Notes |
|---|---|---|
| Email | ✅ Yes | Used for login and OTP verification |
| First Name | ✅ Yes | |
| Last Name | ✅ Yes | |
| Middle Name | Optional | |
| Suffix | Optional | e.g. Jr., Sr., III |
| Contact Number | ✅ Yes | Phone number for the account |
| Password | ✅ Yes | Account password |

> Only the minimum fields needed for booking and account access are collected at registration.

---

## OTP Verification

- After registration, an OTP (One-Time Password) is sent to the user's registered email.
- The user must enter the OTP to confirm their account before booking access is enabled.
- Unverified accounts cannot access the booking wizard.

---

## Login

- Login is by email and password.
- After a successful login, the user is directed to their intended destination (booking wizard or user portal dashboard).

---

## Terms of Service & Privacy Policy Acceptance

- During the **booking flow**: the user must check and accept the Terms of Service and Privacy Policy before submitting a booking request.
- During **sign up**: the user must agree to the Terms of Service and Privacy Policy before creating their account.
- During **sign in**: acknowledgment of the Terms is displayed (passive acceptance or prompted if policy has been updated).

---

## Access Rules

| State | Booking Access | Portal Access |
|---|---|---|
| Not logged in | ❌ Prompted to log in or register | ❌ None |
| Logged in, unverified | ❌ Blocked until OTP confirmed | ❌ Limited |
| Logged in, verified | ✅ Full booking access | ✅ Full user portal |

---

## Secretary and Admin Accounts

- Secretary accounts are **created by admins** from the admin portal — secretaries do not self-register.
- Admin accounts are seeded or created through a controlled provisioning process.
- OTP / email verification flow applies to user self-registration only.
