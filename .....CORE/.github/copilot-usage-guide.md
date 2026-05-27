# GitHub Copilot Usage Guide

This repo is set up for GitHub Copilot with project instructions, skills, and specialist personas.

## What Is Already Set Up

- Project instructions live in [.github/copilot-instructions.md](../.github/copilot-instructions.md).
- Copilot skills live in [.github/skills/](../.github/skills/).
- Copilot personas live in [.github/agents/](../.github/agents/).

## How To Use It

1. Open this repository in VS Code.
2. Sign in to GitHub Copilot and make sure chat/agent mode is enabled.
3. Ask Copilot to work on a task normally, and it should use the project instructions automatically.
4. Use the personas when you want a specialized review:
   - `@code-reviewer` for code review
   - `@test-engineer` for test coverage or test design
   - `@security-auditor` for security review
5. For task-specific workflows, refer to the matching skill under [.github/skills/](../.github/skills/).

## Good Prompts

- "Follow the testing workflow and add coverage for this bug."
- "Review this change for correctness, security, and performance."
- "Use the security-auditor persona to check this endpoint."
- "Apply the incremental-implementation workflow for this feature."

## If Copilot Does Not Pick It Up

- Reload the VS Code window.
- Confirm the files above still exist in the repo.
- Check that GitHub Copilot is signed in for the current workspace.
- Make sure you are asking Copilot inside this repository, not in a different folder.

## Notes

- Keep new skills short and focused.
- Put reusable project rules in [.github/copilot-instructions.md](../.github/copilot-instructions.md).
- Put specialized review workflows in [.github/agents/](../.github/agents/).