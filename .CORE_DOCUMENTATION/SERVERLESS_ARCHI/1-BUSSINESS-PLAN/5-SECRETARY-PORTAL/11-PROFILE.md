# Secretary Portal: Profile

**Route**: `/secretary/profile`

Allows the logged-in secretary to manage their personal profile details (modifying records in the `users` table where `role` is `SECRETARY`).

---

## 1. Edit Profile Form
Fields:
- **First Name** (Required)
- **Middle Name** (Optional)
- **Last Name** (Required)
- **Suffix** (Optional)
- **Email** (Read-only; managed by admin)
- **Phone Number** (Optional)

---

## 2. Password & Security
- Option to trigger password resets or updates.
