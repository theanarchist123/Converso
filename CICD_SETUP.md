# 🚀 CI/CD Pipeline Setup Guide

Complete guide to set up GitHub Actions + Vercel CI/CD pipeline for Converso.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Vercel Project Setup](#vercel-project-setup)
5. [GitHub Secrets Configuration](#github-secrets-configuration)
6. [Workflow Files Explanation](#workflow-files-explanation)
7. [Testing the Pipeline](#testing-the-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Push                       │
│                    (Git Commit)                         │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────┐            ┌─────────┐
    │   PR    │            │  Main   │
    │ Branch  │            │ Branch  │
    └────┬────┘            └────┬────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  CI Workflow    │    │  CI Workflow    │
│  - Lint         │    │  - Lint         │
│  - Type Check   │    │  - Type Check   │
│  - Build        │    │  - Build        │
│  - Security     │    │  - Security     │
└────┬────────────┘    └────┬────────────┘
     │                      │
     ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Preview Deploy  │    │Production Deploy│
│  (Vercel)       │    │   (Vercel)      │
│  + Comment PR   │    │  + Health Check │
└─────────────────┘    └─────────────────┘
```

### Workflows Included

1. **CI (Continuous Integration)** - `ci.yml`
   - Runs on: PRs and pushes to main/develop
   - Jobs: Install, Lint, TypeCheck, Build, Security

2. **Preview Deployment** - `deploy-preview.yml`
   - Runs on: Pull requests to main
   - Deploys: Vercel preview environment
   - Comments: Preview URL in PR

3. **Production Deployment** - `deploy-production.yml`
   - Runs on: Push to main
   - Deploys: Vercel production
   - Checks: Health verification

4. **Security Scanning** - `codeql-analysis.yml`
   - Runs on: PRs, pushes, weekly schedule
   - Scans: JavaScript/TypeScript code

5. **Dependency Review** - `dependency-review.yml`
   - Runs on: Pull requests
   - Reviews: New dependencies for vulnerabilities

---

## ✅ Prerequisites

### 1. Accounts Required
- ✅ GitHub account with repository access
- ✅ Vercel account (free tier works)
- ✅ All external service accounts (Supabase, Clerk, MongoDB, etc.)

### 2. Local Setup
- ✅ Git installed
- ✅ Node.js 20.x installed
- ✅ Project working locally with `.env.local`

---

## 🔧 GitHub Repository Setup

### Step 1: Initialize Git Repository

```bash
# If not already initialized
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Converso`
3. Visibility: Private (recommended) or Public
4. Click **Create repository**

### Step 3: Push Code to GitHub

```bash
# Add remote
git remote add origin https://github.com/theanarchist123/Converso.git

# Push code
git branch -M main
git push -u origin main
```

### Step 4: Enable Actions

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Actions permissions", select:
   - ✅ **Allow all actions and reusable workflows**
3. Under "Workflow permissions", select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

---

## ☁️ Vercel Project Setup

### Step 1: Install Vercel CLI

```bash
npm install -g vercel@latest
```

### Step 2: Link Project to Vercel

```bash
# Login to Vercel
vercel login

# Link project
vercel link
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **converso** (or your preferred name)
- Directory? **./** (current directory)

### Step 3: Get Vercel Project IDs

```bash
# Get project details
vercel project ls

# Or check .vercel/project.json
cat .vercel/project.json
```

You'll need:
- **Project ID**: Found in `.vercel/project.json`
- **Org ID**: Found in `.vercel/project.json`

### Step 4: Create Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `GitHub Actions CI/CD`
4. Scope: **Full Account**
5. Expiration: **No Expiration** (or set as needed)
6. Click **Create**
7. **Copy the token** (you won't see it again!)

### Step 5: Configure Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add all variables from your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_value
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_value
CLERK_SECRET_KEY=your_value
MONGODB_URI=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
OPENAI_API_KEY=your_value
GEMINI_API_KEY=your_value
VAPI_PRIVATE_KEY=your_value
VAPI_PUBLIC_KEY=your_value
JWT_SECRET=your_value
JWT_REFRESH_SECRET=your_value
```

**For each variable:**
- Environment: Select **Production**, **Preview**, and **Development**
- Click **Save**

---

## 🔐 GitHub Secrets Configuration

### Required Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### Vercel Secrets

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VERCEL_TOKEN` | Your Vercel token | Created in Vercel account tokens |
| `VERCEL_ORG_ID` | Your organization ID | `.vercel/project.json` → `"orgId"` |
| `VERCEL_PROJECT_ID` | Your project ID | `.vercel/project.json` → `"projectId"` |

#### Application Secrets

Copy all environment variables from your `.env.local`:

| Secret Name | Example Value |
|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` |
| `CLERK_SECRET_KEY` | `sk_test_...` |
| `MONGODB_URI` | `mongodb+srv://...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` |
| `OPENAI_API_KEY` | `sk-...` |
| `GEMINI_API_KEY` | `AIza...` |
| `VAPI_PRIVATE_KEY` | `xxx` |
| `VAPI_PUBLIC_KEY` | `xxx` |
| `JWT_SECRET` | Your secret key |
| `JWT_REFRESH_SECRET` | Your refresh secret |

### Verification

After adding all secrets, you should have **15 secrets** total:
- 3 Vercel secrets
- 12 application secrets

---

## 📝 Workflow Files Explanation

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Jobs:**
1. **Install** - Caches dependencies
2. **Lint** - Runs ESLint
3. **TypeCheck** - TypeScript compilation check
4. **Build** - Builds Next.js app
5. **Security** - npm audit
6. **Deployment Ready** - Final check

### 2. Preview Deployment (`deploy-preview.yml`)

**Triggers:**
- Pull requests to `main`

**Features:**
- Deploys to Vercel preview environment
- Adds comment to PR with preview URL
- Runs smoke tests
- Creates deployment summary

### 3. Production Deployment (`deploy-production.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Features:**
- Deploys to Vercel production
- Runs health checks
- Creates deployment summary
- Notifies on success/failure

### 4. CodeQL Analysis (`codeql-analysis.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main`
- Weekly schedule (Sundays at midnight)

**Features:**
- Security vulnerability scanning
- Code quality analysis
- Automatic alerts for issues

### 5. Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests to `main`

**Features:**
- Reviews new dependencies
- Fails on moderate+ vulnerabilities
- Comments summary in PR

---

## 🧪 Testing the Pipeline

### Test 1: CI Pipeline

```bash
# Create a new branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# CI Test" >> TEST.md

# Commit and push
git add .
git commit -m "test: CI pipeline"
git push origin test/ci-pipeline
```

**Expected Result:**
- ✅ CI workflow runs
- ✅ All jobs pass (Install → Lint → TypeCheck → Build → Security)

### Test 2: Preview Deployment

```bash
# Create a PR from your test branch
# Go to GitHub and create a pull request
```

**Expected Result:**
- ✅ CI workflow runs
- ✅ Preview deployment workflow runs
- ✅ PR comment with preview URL appears
- ✅ Preview site is accessible

### Test 3: Production Deployment

```bash
# Merge PR to main
# Or push directly to main
git checkout main
git merge test/ci-pipeline
git push origin main
```

**Expected Result:**
- ✅ CI workflow runs
- ✅ Production deployment workflow runs
- ✅ Health checks pass
- ✅ Production site updates

### Verification Checklist

- [ ] CI workflow runs successfully
- [ ] Preview deployment creates preview URL
- [ ] Preview URL is accessible and functional
- [ ] Production deployment succeeds
- [ ] Production health check passes
- [ ] CodeQL analysis completes (may take 5-10 min)
- [ ] No critical security issues found

---

## 🐛 Troubleshooting

### Issue 1: "VERCEL_TOKEN is not set"

**Solution:**
1. Verify token is added to GitHub Secrets
2. Token name must be exactly `VERCEL_TOKEN`
3. Re-run workflow after adding

### Issue 2: "Project not found"

**Solution:**
1. Check `VERCEL_PROJECT_ID` and `VERCEL_ORG_ID` are correct
2. Verify they match `.vercel/project.json`
3. Ensure Vercel CLI is linked: `vercel link`

### Issue 3: Build Fails - Missing Environment Variables

**Solution:**
1. Check all secrets are added to GitHub
2. Verify secret names match exactly (case-sensitive)
3. Re-run workflow

### Issue 4: ESLint Errors

**Solution:**
```bash
# Fix locally first
npm run lint -- --fix

# Commit fixes
git add .
git commit -m "fix: lint errors"
git push
```

### Issue 5: TypeScript Errors

**Solution:**
```bash
# Check types locally
npx tsc --noEmit

# Fix errors and commit
```

### Issue 6: Vercel Deployment Timeout

**Solution:**
1. Check `vercel.json` functions timeout (currently 30s)
2. Increase if needed for specific routes
3. Optimize heavy API routes

### Issue 7: Health Check Fails

**Solution:**
1. Ensure `/api/health` route exists
2. Test locally: `curl http://localhost:3000/api/health`
3. Check Vercel logs for errors

### Issue 8: Preview URL Not Commenting on PR

**Solution:**
1. Check GitHub Actions permissions (Settings → Actions → Workflow permissions)
2. Enable "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

---

## 📊 Monitoring & Logs

### GitHub Actions Logs

1. Go to repository → **Actions** tab
2. Click on workflow run
3. Click on job to see detailed logs

### Vercel Deployment Logs

1. Go to Vercel Dashboard
2. Click on deployment
3. View **Runtime Logs** and **Build Logs**

### Setting Up Alerts

#### GitHub Notifications

1. Go to repository **Settings** → **Notifications**
2. Configure workflow run notifications
3. Enable email alerts for failures

#### Vercel Notifications

1. Go to Vercel → **Settings** → **Notifications**
2. Enable deployment notifications
3. Connect Slack/Discord (optional)

---

## 🎯 Best Practices

### 1. Branch Protection Rules

Set up branch protection for `main`:

1. Go to **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### 2. Commit Message Convention

Use conventional commits:

```bash
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

### 3. Environment Management

- **Development**: Local `.env.local`
- **Preview**: Vercel preview environment
- **Production**: Vercel production environment

### 4. Secret Rotation

Rotate secrets every 90 days:
- Update in GitHub Secrets
- Update in Vercel Environment Variables
- Update in `.env.local`

---

## 🚀 Next Steps

After successful setup:

1. **Create a develop branch** for feature development
2. **Set up branch protection** for main
3. **Configure status checks** required for merging
4. **Add team members** and set permissions
5. **Set up monitoring** (e.g., Sentry, LogRocket)
6. **Configure custom domain** in Vercel
7. **Enable automatic HTTPS** in Vercel

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [CodeQL Documentation](https://codeql.github.com/docs/)

---

## ✅ Deployment Checklist

Before going live:

- [ ] All GitHub secrets configured
- [ ] All Vercel environment variables set
- [ ] CI workflow passes
- [ ] Preview deployment works
- [ ] Production deployment succeeds
- [ ] Health checks pass
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics set up
- [ ] Error monitoring configured
- [ ] Team members added
- [ ] Branch protection enabled
- [ ] Documentation updated

---

## 🎉 Success!

Your CI/CD pipeline is now fully configured! Every push and PR will:

1. ✅ Run automated tests and checks
2. ✅ Create preview deployments for PRs
3. ✅ Deploy to production on merge to main
4. ✅ Run security scans
5. ✅ Provide instant feedback

**Happy deploying! 🚀**

---

*Last Updated: October 25, 2025*  
*Maintained by: theanarchist123*
