# Git & Vercel Development Workflow Guide

This document outlines the standard Git branching strategy and deployment workflow for **Samson Dental Center Website**.

---

## 🌿 Branching Overview

- **`main`**: Production branch (Live Website: `samsondentalcenter-website.vercel.app`).
- **`staging`**: Staging branch (Preview Website for testing features safely).
- **`feature/*`**: Feature branches for new tasks or bug fixes created off `staging`.

---

## 🚀 Step-by-Step Developer Workflow

### Step 1: Prepare Local Workspace
Before starting any new feature or fix, ensure your local `staging` branch is up to date with GitHub:

```bash
git switch staging
git pull origin staging
```

### Step 2: Create a Feature Branch
Create and switch to a new feature branch from `staging`:

```bash
git switch -c feature/your-feature-name
```

### Step 3: Work & Commit Changes
Make your code changes, then stage and commit:

```bash
git add .
git commit -m "feat: short description of what you built"
```

### Step 4: Deploy to Staging (Test on Vercel Preview)
When feature is complete, merge it into `staging` and push to GitHub:

```bash
git switch staging
git merge feature/your-feature-name
git push origin staging
```
> 💡 **Vercel** will automatically build a **Staging Preview URL**. Open the preview link and verify your changes work cleanly.

### Step 5: Deploy to Production (Live Site)
Once testing on staging is successful, merge `staging` into `main` and push to live production:

```bash
git switch main
git merge staging
git push origin main
```
> 🚀 **Vercel** will automatically deploy the changes to the live production domain!

### Step 6: Switch Back to Staging for Next Task
```bash
git switch staging
```

---

## ⚡ Command Quick Reference (`git switch`)

| Task | Command |
| :--- | :--- |
| **Switch branch** | `git switch <branch-name>` |
| **Create & switch to new branch** | `git switch -c <new-branch-name>` |
| **Pull latest changes from GitHub** | `git pull origin <branch-name>` |
| **Push local changes to GitHub** | `git push origin <branch-name>` |
| **Merge another branch into current** | `git merge <other-branch>` |

---

## ⏰ Cron & Automated Reminders Setup

- **Automated Outbox Handler**: `/api/outbox/process`
- **Cron Service**: Configured on [cron-job.org](https://cron-job.org) (running every 15 minutes).
- **Function**: Pings Next.js outbox endpoint every 15 minutes to send 24h & 48h appointment reminder emails/SMS via Resend/Twilio.

---

## 🔧 Vercel Settings Configuration

- **Root Directory**: `samson-nextjs`
- **Production Branch**: `main`
- **Required Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
