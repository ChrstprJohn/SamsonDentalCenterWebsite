# Footer

## Overview

The footer is consistent across all public and private portal pages. It provides key clinic information, legal links, and navigation to policy pages.

---

## Footer Sections

| Section | Contents |
|---|---|
| **Pages** | Terms of Service, Privacy Policy |
| **Contact** | Clinic address, phone number, email address |
| **Hours** | Operating hours (fetched from clinic config) |
| **Social Links** | Links to clinic social media profiles (if applicable) |
| **Legal** | Copyright notice |

---

## Footer Behavior

- Footer links for **Terms of Service** and **Privacy Policy** open as **separate pages**, not inline modals or expandable sections.
- Footer is rendered consistently on:
  - Public landing page
  - User portal pages
  - Secretary portal pages
  - Admin portal pages
- Operating hours and contact info should be pulled from **clinic config** so they stay in sync without a code deployment.

---

## Footer Pages

| Page | Route (TBD) | Notes |
|---|---|---|
| Terms of Service | `/terms` | Standalone page, linked from footer and booking flow |
| Privacy Policy | `/privacy` | Standalone page, linked from footer and booking flow |

---

## Notes

- Additional legal or policy pages can be added to the footer later if needed.
- Social media links should only appear if configured in clinic settings; they should not render empty placeholder links.
