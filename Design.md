# Dental

## Mission
Create implementation-ready, token-driven UI guidance for Dental that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Dental
- URL: https://dental-template.framer.website/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: clean, premium, split-screen editor style
- Fonts: `font.family.primary=Inter`, `font.family.serif=Playfair Display`, `font.size.base=12px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=16px`, `font.size.lg=26px`, `font.size.xl=30px`, `font.size.2xl=44px`, `font.size.3xl=80px`
- Color palette: `color.surface.base=#000000`, `color.text.secondary=#5e646d`, `color.text.tertiary=#4041d1`, `color.text.inverse=#0000ee`, `color.surface.muted=#ffffff`, `color.surface.strong=#11081c`
- Spacing scale: `space.1=4px`, `space.2=10px`, `space.3=15px`, `space.4=18px`, `space.5=20px`, `space.6=22px`, `space.7=25px`, `space.8=30px`
- Radius/shadow/motion tokens: `radius.xs=10px`, `radius.sm=20px`, `radius.md=60px`, `radius.lg=100px` | `motion.duration.instant=300ms`
- Layout patterns:
  - **Centered Split Hero Overlap**: Viewport split into solid color (left) and background image (right) with a primary asset card centered absolute on the screen overlap line (`hidden lg:block` on mobile).
  - **Top-Left/Bottom-Left Text Layout**: Elegant serif title at top-left, sans-serif sub-description and appointment button at bottom-left.
  - **Bottom Wave Transition**: Wavy SVG curved shape at the bottom of the hero to blend with subsequent sections.
  - **Header Scroll State**: Transparent layout overlay at rest with thin bottom border separator `border-white/10`. Scroll turns it into a solid bar (`bg-white` / `bg-[#061814]`) with sticky layout.

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (53), navigation (19), inputs (15), buttons (13).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.


---
name: design-system-dental
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Dental

## Mission
Deliver implementation-ready design-system guidance for Dental that can be applied consistently across marketing site interfaces.

## Brand
- Product/brand: Dental
- URL: https://dental-template.framer.website/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: clean, premium, split-screen editor style
- Fonts: `font.family.primary=Inter`, `font.family.serif=Playfair Display`, `font.size.base=12px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=16px`, `font.size.lg=26px`, `font.size.xl=30px`, `font.size.2xl=44px`, `font.size.3xl=80px`
- Color palette: `color.surface.base=#000000`, `color.text.secondary=#5e646d`, `color.text.tertiary=#4041d1`, `color.text.inverse=#0000ee`, `color.surface.muted=#ffffff`, `color.surface.strong=#11081c`
- Spacing scale: `space.1=4px`, `space.2=10px`, `space.3=15px`, `space.4=18px`, `space.5=20px`, `space.6=22px`, `space.7=25px`, `space.8=30px`
- Radius/shadow/motion tokens: `radius.xs=10px`, `radius.sm=20px`, `radius.md=60px`, `radius.lg=100px` | `motion.duration.instant=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
