# 🚀 Antigravity Pairing & Usage Guide

This repository is optimized for **Antigravity**—Google's advanced, autonomous AI coding agent. It features project-level directives, standard engineering workflows, and specialized expert personas to deliver incredibly clean code, robust test coverage, and visually stunning user interfaces.

---

## 🆚 GitHub Copilot vs. Antigravity

While **GitHub Copilot** is a valuable autocomplete and chat assistant, **Antigravity** is a fully agentic pair programmer. Here is how their capabilities compare:

| Capability | GitHub Copilot | Antigravity |
| :--- | :--- | :--- |
| **Interaction** | Passive (chat, suggestion) | Active (planning, executing, iterating) |
| **Workspace Control**| Read-only files, context limited | Reads and edits files directly with surgical precision |
| **Command Execution**| None (relies on you to run terminal) | Runs commands, starts dev servers, executes tests |
| **UI Verification** | None | Controls a headless Chrome browser to test and record UI flows |
| **Workflow Tracking**| None | Maintains structured plans, tasks, and walkthroughs in real-time |

---

## 🧩 How Antigravity Uses the Repository Setup

1. **Automatic Root Loading**: Upon starting any task, Antigravity automatically reads the root [.geminirules](file:///c:/Users/picar/Desktop/SamsonDental/.geminirules), which points it directly to [.github/gemini-instructions.md](file:///c:/Users/picar/Desktop/SamsonDental/.github/gemini-instructions.md).
2. **Autonomous Skill Discovery**: Depending on your task (e.g. adding an API, debugging, building a screen), Antigravity scans [.github/skills/](file:///c:/Users/picar/Desktop/SamsonDental/.github/skills/) to find the matching senior workflow. It reads the workflow's `SKILL.md` and implements it step-by-step.
3. **Expert Persona Self-Reviews**: Before presenting code to you, Antigravity uses the specialist personas under [.github/agents/](file:///c:/Users/picar/Desktop/SamsonDental/.github/agents/) (such as `code-reviewer` and `security-auditor`) to audit its own code, preventing bugs and architectural regression.

---

## 💬 Prompting Antigravity Like a Pro

To get the absolute most out of Antigravity, prompt it to leverage its agentic tools alongside the repository skills:

### 1. Test-Driven Development (TDD)
> **Prompt:** *"Antigravity, let's implement validation for user registration. Follow the `test-driven-development` skill—write the test cases first, run the test runner to see them fail, implement the fix, and make them pass."*

### 2. Visually Stunning Frontend Engineering
> **Prompt:** *"Build a custom appointment booking widget. Follow the `frontend-ui-engineering` skill to create a beautiful, modern look with soft gradients and glassmorphism. Once built, use your `browser_subagent` to spin up the local server, test the booking flow, and verify it is responsive and accessible."*

### 3. Rigorous Code Review & Security Audit
> **Prompt:** *"I've made some edits to our authentication routes. Run a self-criticism session using the `security-auditor` and `code-reviewer` personas. Present a summary of any vulnerabilities or readability issues you discover."*

### 4. Interactive Specs & Tasks
> **Prompt:** *"Let's build a new feature. Start by interviewing me using `interview-me`, then create a detailed `implementation_plan.md` and let `plan-critic` analyze it before we write a single line of code."*

---

## 🤝 Best Practices for Pair-Programming

* **Collaborate on Plans**: When Antigravity enters Planning Mode, it writes an `implementation_plan.md` and halts. Use this time to adjust requirements or constraints before approving execution.
* **Track Checklist Progress**: You can open the `task.md` file in the artifacts directory at any time to see exactly what step Antigravity is currently working on and what is completed.
* **Inspect Recordings**: When Antigravity tests visual designs, it saves video recordings and screenshots. You can click on the media links in the `walkthrough.md` to visually review how your application runs in the browser.
