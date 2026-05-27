# Public Site — Landing Page

## Overview

One public-facing landing page that presents the clinic, its services, and drives visitors toward booking an appointment.

---

## Page Sections

The landing page is composed of the following scrollable sections in order:

| # | Section | Purpose |
|---|---|---|
| 1 | **Hero** | First impression — clinic name, tagline, and primary CTA |
| 2 | **Services** | Overview of available dental services with cards |
| 3 | **About Us** | Clinic story, mission, and team introduction |
| 4 | **Gallery** | Photos of the clinic, procedures, or team |
| 5 | **Contact** | Contact form or details, map embed |

---

## Navigation Bar

- Fixed/sticky navigation that stays visible on scroll.
- Navigation items:
  - Logo (links back to top / Hero)
  - Section links: Hero, Services, About Us, Gallery, Contact
  - **Login** button
  - **Book Now** button (primary CTA)
- Section links use smooth in-page scroll anchors.
- Navigation should stay minimal — no dropdowns or mega menus on the public bar.
- If a user is logged in, the **Login** button is replaced with a profile/avatar indicator and a notification bell icon.

---

## Services Section

- Services are displayed as cards.
- Each service card shows: service name, short description, and duration.
- Clicking a service card opens a **service detail view** (modal or dedicated page).
- Service detail includes: full description, duration, and a **Book This Service** CTA.

---

## Booking CTA Behavior

- **Not logged in:** Clicking "Book Now" or "Book This Service" prompts the visitor to log in or create an account before proceeding to the booking wizard.
- **Logged in:** Clicking "Book Now" or "Book This Service" sends the user directly into the booking wizard.

---

## Terms of Service and Privacy Policy

- These pages are **not** embedded on the landing page.
- They are linked from the footer and open as separate pages.
- See `2-FOOTER.md` for footer specification.
