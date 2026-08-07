# Git & Vercel Development Workflow Guide

This document outlines the standard Git branching strategy, fork workflow for contributors, and deployment process for the **Samson Dental Center Website**.

---

## 1. Branch Structure

- **`main`**: Production branch (Live Website: `samsondentalcenter-website.vercel.app`). Only the Repository Owner merges into `main`.
- **`staging`**: Staging branch for development and testing (Vercel Preview URL). All Pull Requests target this branch.
- **`feature/*`**: Feature branches created off `staging` for specific tasks or bug fixes.



---

## 2. Contributor Guide (Forking Workflow)

Classmates and contributors must follow these steps to propose code changes:

```text
[ MAIN REPOSITORY ]              [ YOUR FORK ]                 [ LOCAL PC ]

staging (Target) <--- Open PR --- feature/my-task <--- push --- feature/my-task
    │                                  ▲                             ▲
    └── Sync / Pull ───────────────────┴────── checkout from ────────┘
```

### Step 1: Fork & Clone
1. Click **Fork** on the main GitHub repository.
2. Clone your fork locally to your computer.

### Step 2: Create a Feature Branch
Always create a feature branch off `staging`:

```bash
git switch staging
git switch -c feature/your-feature-name
```
*Note: Do not commit directly to `main` or `staging`.*

### Step 3: Commit & Push
Make your changes, stage them, and push to your fork:

```bash
git add .
git commit -m "feat: description of work"
git push origin feature/your-feature-name
```

### Step 4: Open a Pull Request
1. Open your fork on GitHub and click **Compare & Pull Request**.
2. Set the target branches:
   - **Base Repository**: Main Repo | **Base Branch**: `staging`
   - **Head Repository**: Your Fork | **Compare Branch**: `feature/your-feature-name`
3. Click **Create Pull Request**.

---

## 3. Syncing a Stale Fork

When the main repository `staging` branch receives updates, sync your fork using either method:

### Option A: GitHub UI (Recommended)
1. Navigate to your fork on GitHub.
2. Select the `staging` branch.
3. Click **Sync fork** > **Update branch**.
4. Pull the changes locally and merge into your feature branch:
   ```bash
   git switch staging
   git pull origin staging
   git switch feature/your-feature-name
   git merge staging
   ```

### Option B: Terminal (`upstream`)
```bash
# Add upstream remote (one-time setup)
git remote add upstream https://github.com/your-username/samson-website.git

# Sync staging
git switch staging
git pull upstream staging
git push origin staging

# Merge into active feature branch
git switch feature/your-feature-name
git merge staging
```

---

## 4. Maintainer Workflow (Review & Deploy)

1. **Review PR**: Inspect code changes on GitHub.
2. **Test Preview**: Verify functionality using the automatic Vercel Staging Preview URL.
3. **Merge to Staging**: Approve and merge the PR into `staging`.
4. **Deploy to Production**: Merge `staging` into `main` to trigger live deployment:
   ```bash
   git switch main
   git merge staging
   git push origin main
   ```

---

## 5. Repository Protection Rules (GitHub)

To protect the production branch:

1. **Default Branch**: Set default branch to `staging` under **Settings** > **General** > **Default branch**.
2. **Branch Protection**: Add rule for `main` under **Settings** > **Branches**:
   - Enable "Require a pull request before merging"
   - Enable "Restrict who can push to matching branches" (Limit to Repository Owner)

---

## 6. Quick Command Reference

| Action | Command |
| :--- | :--- |
| **Switch branch** | `git switch <branch>` |
| **Create feature branch** | `git switch -c feature/<name>` |
| **Stage changes** | `git add .` |
| **Commit changes** | `git commit -m "msg"` |
| **Push to fork** | `git push origin feature/<name>` |
| **Pull latest staging** | `git pull origin staging` |

---

## 7. Vercel Configuration

- **Root Directory**: `samson-nextjs`
- **Production Branch**: `main`
- **Preview Branch**: `staging`
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
