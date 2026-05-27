# Samson Dental Copilot Instructions

## Project Rules
- Follow the project design documents in `0-SYSTEM-DESIGN/` before making changes.
- Keep changes small, focused, and easy to verify.
- Prefer the existing `agent-skills` workflows in `.github/skills/` when the task matches.

## Default Workflow
- For behavior changes or bug fixes, write or update tests first.
- Implement in small increments, then validate the touched slice with the cheapest useful check.
- Before merge, review correctness, readability, architecture, security, and performance.

## Safety Boundaries
- Ask before changing database schemas, introducing new dependencies, or modifying auth/security behavior.
- Do not commit secrets or weaken validation to make tests pass.
- Keep API and interface changes aligned with the versioning and boundary rules in `0-SYSTEM-DESIGN/`.

## Copilot Usage
- Use the skills in `.github/skills/` as the source of truth for task-specific workflows.
- Use the personas in `.github/agents/` for review, testing, and security-focused work.