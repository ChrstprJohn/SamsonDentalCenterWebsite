# Email Sender (OTP) Features

## Overview
The Email Sender feature provides a robust and reliable way to send transactional emails, currently focused strictly on OTPs (One-Time Passwords) for patient registration. 

Rather than relying on Supabase's native email sender which offers limited UI customization and observability, this feature uses **Resend** and **React Email**.

## Key Capabilities

### 1. Custom OTP Generation
The system generates a secure OTP code (dynamically configured to match the 8-digit Supabase project setting) programmatically via the backend, ensuring full control over the code format and lifecycle.

### 2. Transactional Integrity
Emails are not dispatched directly during the HTTP request. Instead, the OTP and email payload are stored in an `email_outbox` database table within the same transaction as the user creation. This guarantees that:
* If the user fails to create, the email is never sent.
* If the email fails to send immediately, it remains safely in the outbox to be retried.

### 3. Beautiful React Email Templates
The actual email sent to the patient is built using `react-email`. This allows for highly customizable, branded, and responsive email designs that match the Samson Dental aesthetic.

### 4. Zero-Blocking Background Dispatch
The email dispatching process uses the Next.js `after()` API. This means the sign-up API route returns a response to the user instantly, while the email sending process runs transparently in the background.
