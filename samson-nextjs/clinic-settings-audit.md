# Clinic Settings Audit: Dynamic vs. Static Data

Exhaustive audit of hardcoded static data vs. dynamic database-driven clinic configuration across **Landing Page**, **Email Templates**, and **Secretary V2 (`sec-v2`)**.

---

## 1. Landing Page (`(public)/(marketing)`)

### Files Analyzed:
* `src/app/(public)/(marketing)/layout.tsx`
* `src/app/(public)/(marketing)/page.tsx`
* `src/components/ui/footer.tsx`
* `src/components/ui/navbar-v1.tsx`
* `src/components/ui/navbar-v2.tsx`
* `src/modules/patients/components/landing/*`

### Detailed Audit Table:

| Component / Element | Current Implementation Status | Source File & Line Number | Database Field / Proposed Fix |
| :--- | :--- | :--- | :--- |
| **Clinic Name** | 🟢 **Dynamic** (`config.clinicName ?? 'Samson Dental Center'`) | `src/components/ui/footer.tsx` (L36) | `clinic_config.clinicName` |
| **Address Text** | 🟢 **Dynamic** (`config.address ?? 'lot 9 Upper Session Rd...'`) | `src/components/ui/footer.tsx` (L37) | `clinic_config.address` |
| **Contact Phone Number** | 🟢 **Dynamic** (`config.phone ?? '+1 (555) 234-8890'`) | `src/components/ui/footer.tsx` (L38) | `clinic_config.phone` |
| **Contact Email** | 🟢 **Dynamic** (`config.email ?? 'contact@samsondental.com'`) | `src/components/ui/footer.tsx` (L39) | `clinic_config.email` |
| **Operating Hours** | 🟢 **Dynamic** (`config.operatingHours ?? DEFAULT_HOURS`) | `src/components/ui/footer.tsx` (L35, L174) | `clinic_config.operatingHours` |
| **Google Maps Embed & Direction Link** | 🟢 **Dynamic** (Derived from `config.address`) | `src/components/ui/footer.tsx` (L43, L77) | Dynamic `maps.google.com` query |
| **Navbar Brand Title** | 🔴 **Static** (`Samson Dental Center`) | `src/components/ui/navbar-v1.tsx` (L99), `src/components/ui/navbar-v2.tsx` (L95) | Change to `config.clinicName` |
| **Facebook Social Link** | 🔴 **Static** (`https://facebook.com`) | `src/components/ui/footer.tsx` (L144) | Add `clinic_config.socialFacebook` |
| **WhatsApp Social Link** | 🔴 **Static** (`https://wa.me/15552348890`) | `src/components/ui/footer.tsx` (L155) | Add `clinic_config.socialWhatsapp` |

---

## 2. Transactional Email Templates (`src/components/emails/*`)

### Files Analyzed:
* `src/components/emails/appointment-confirmed-email.tsx`
* `src/components/emails/appointment-reminder-email.tsx`
* `src/components/emails/appointment-rescheduled-email.tsx`
* `src/components/emails/appointment-cancelled-email.tsx`
* `src/components/emails/appointment-request-received-email.tsx`
* `src/components/emails/post-care-email.tsx`
* `src/components/emails/request-rejected-email.tsx`
* `src/components/emails/staff-reply-email.tsx`
* `src/modules/staff/views/secretary/sub-components/email-design-studio/email-design-preview.tsx`
* `src/shared/services/email/resend.service.ts`

### Detailed Audit Table:

| Element / Copy | Current Implementation Status | Source File & Line Numbers | Database Field / Proposed Fix |
| :--- | :--- | :--- | :--- |
| **Footer Phone Number** | 🔴 **Static** (`(02) 8123-4567` & `tel:028123456`) | All email templates (e.g. `appointment-confirmed-email.tsx` L134, L147) | Pass `clinic_config.phone` to template props |
| **Footer Website Text** | 🔴 **Static** (`samsondentalcenter.com.ph`) | All email templates (e.g. `appointment-confirmed-email.tsx` L149) | Pass `clinic_config.websiteUrl` |
| **Footer Base Link Target** | 🟢 **Dynamic** (`href={baseUrl}`) | All email templates (L148) | Uses `baseUrl` (`NEXT_PUBLIC_APP_URL`) |
| **Terms of Service Link** | 🟢 **Dynamic URL** (`href="${baseUrl}/terms"`) | All email footers (L159) | Domain dynamic, text static |
| **Privacy Policy Link** | 🟢 **Dynamic URL** (`href="${baseUrl}/privacy"`) | All email footers (L163) | Domain dynamic, text static |
| **Signature Clinic Name** | 🔴 **Static** (`Samson Dental Center`) | All email signatures (L145) | Pass `clinic_config.clinicName` |
| **Resend Sender Name** | 🔴 **Static / Fallback** (`process.env.RESEND_SENDER_NAME \|\| 'Samson Dental Center'`) | `src/shared/services/email/resend.service.ts` (L241) | `clinic_config.clinicName` |
| **Clinic Logo Header** | 🔴 **Static Image URL** (`SamsonLOGOGO-removebg-preview.png`) | `src/shared/utils/get-base-url.util.ts` (L3, L17) | Pass `clinic_config.logoUrl` |

---

## 3. Secretary V2 Views (`sec-v2`)

### Files Analyzed:
* `src/app/(portals)/secretary-v2/*`
* `src/modules/staff/views/secretary/secretary-pending-requests-view-v2.tsx`
* `src/modules/staff/views/secretary/secretary-book-appointment-view.tsx`
* `src/modules/staff/views/secretary/secretary-invoice-management-view.tsx`
* `src/modules/staff/views/secretary/sub-components/doctor-timeline.tsx`

### Detailed Audit Table:

| Element / Area | Current Implementation Status | Source File & Line Numbers | Database Field / Proposed Fix |
| :--- | :--- | :--- | :--- |
| **Calendar Start/End Mins** | 🔴 **Static** (`07:50 AM` / 470 mins to `05:00 PM` / 1020 mins) | `src/modules/staff/views/secretary/sub-components/doctor-timeline.tsx` (L52-L53) | Calculate dynamically from `clinic_config.operatingHours` or doctor shifts |
| **Calendar Time Labels Start** | 🔴 **Static** (`minutes >= 480` / `8:00 AM`) | `doctor-timeline.tsx` (L290, L326) | Calculate dynamically from earliest opening hour |
| **Receipt Title Banner** | 🔴 **Static** (`Samson Dental Receipt`) | `secretary-invoice-management-view.tsx` (L104) | `${clinic_config.clinicName} Receipt` |
| **Time Slot Default Fallbacks**| 🔴 **Static Fallback** (`08:00`) | Booking hooks & forms (e.g. `doctor-weekly-shifts-tab.tsx` L47) | Set fallback to earliest open hour from `clinic_config` |

---

## Action Plan to Unify Clinic Settings

To make everything 100% manageable from **Clinic Settings**:
1. **Database Schema**: Ensure `clinic_config` table has columns:
   - `clinic_name`, `address`, `phone`, `email`, `website_url`, `logo_url`, `social_facebook`, `social_whatsapp`, `operating_hours`.
2. **Email Templates**: Update email props to receive `clinicConfig` so phone numbers, clinic signatures, and website links reflect Clinic Settings.
3. **Doctor Timeline**: Dynamically calculate grid `startTimeMins` and `endTimeMins` based on saved operating hours.
