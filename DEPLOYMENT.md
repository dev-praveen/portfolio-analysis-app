# 🚀 Deployment Guide - Railway CI/CD

This guide explains how to set up and use the automated CI/CD pipeline for deploying the Portfolio Analysis App to Railway.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code pushed to GitHub
3. **Railway CLI** (optional, for local testing): `npm install -g @railway/cli`

---

## 🔧 Initial Setup

### Step 1: Create a Railway Project

1. Log in to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your repository: `portfolio-analysis-app`
5. Railway will automatically detect the `railway.json` and `Dockerfile`

### Step 2: Configure Environment Variables

In your Railway project dashboard:

1. Go to **Variables** tab
2. Add any required environment variables (if applicable)
3. For this static SPA, no additional variables are required

### Step 3: Generate Railway Token

1. Go to [Railway Tokens](https://railway.app/account/tokens)
2. Click **"New Token"**
3. Name it: `GitHub Actions Deploy`
4. Copy the generated token

### Step 4: Add GitHub Secrets

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add the following secret:

   | Name | Value |
   |------|-------|
   | `RAILWAY_TOKEN` | Your Railway token from Step 3 |

---

## 🔄 CI/CD Pipeline Overview

The pipeline consists of 5 jobs that run sequentially:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Quality Checks │────▶│  Build & Test   │────▶│  Docker Build   │
│  (TypeScript    │     │  (Vite Build)   │     │  & Security Scan│
│   + ESLint)     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Deploy to      │
                                               │  Railway        │
                                               └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Smoke Test     │
                                               │  (Health Check) │
                                               └─────────────────┘
```

### Job Details

| Job | Purpose | Duration |
|-----|---------|----------|
| 🔍 **Quality Checks** | TypeScript type checking + ESLint linting | ~2-3 min |
| 🏗️ **Build & Test** | Build Vite app + run tests + upload artifacts | ~3-5 min |
| 🐳 **Docker Build** | Build Docker image + security scan with Trivy | ~5-8 min |
| 🚀 **Deploy** | Deploy to Railway using CLI | ~3-5 min |
| 🧪 **Smoke Test** | Verify deployment health | ~1-2 min |

---

## 🎯 Usage

### Automatic Deployment

The pipeline triggers automatically on:

- ✅ Push to `main` or `master` branch
- ✅ Pull requests to `main` or `master` (build only, no deploy)
- ✅ Manual trigger via **Actions** tab → **Run workflow**

### Manual Deployment

To deploy manually:

1. Go to **Actions** tab in your GitHub repository
2. Select **"CI/CD Pipeline"**
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

---

## 📊 Monitoring Deployments

### GitHub Actions

View pipeline status:
- Go to **Actions** tab in your GitHub repository
- Click on a workflow run to see detailed logs
- Each job can be expanded to see step-by-step output

### Railway Dashboard

Monitor your deployment:
- Go to [Railway Dashboard](https://railway.app/dashboard)
- Select your project
- View **Deployments** tab for deployment history
- Check **Metrics** for performance data
- View **Logs** for runtime logs

---

## 🔒 Security Features

The pipeline includes several security best practices:

| Feature | Implementation |
|---------|---------------|
| **Vulnerability Scanning** | Trivy scans Docker images for CRITICAL/HIGH vulnerabilities |
| **Secret Management** | Railway token stored in GitHub Secrets |
| **Non-root Container** | Docker runs as `nginx` user, not root |
| **Security Headers** | Nginx configured with security headers |
| **Health Checks** | Container and Railway health checks configured |

---

## 🛠️ Troubleshooting

### Common Issues

#### ❌ "RAILWAY_TOKEN not found"

**Solution**: Ensure the `RAILWAY_TOKEN` secret is added to GitHub repository settings.

#### ❌ Build fails at "Install Dependencies"

**Solution**: Check that `pnpm-lock.yaml` is committed to the repository:
```bash
git add pnpm-lock.yaml
git commit -m "Add lockfile"
git push
```

#### ❌ Docker build fails

**Solution**: Verify Dockerfile syntax:
```bash
docker build -t test-build .
```

#### ❌ Deployment succeeds but app not accessible

**Solution**: 
1. Check Railway dashboard for deployment logs
2. Verify `railway.json` healthcheck path matches your app
3. Ensure port 8080 is exposed in Dockerfile

---

## 📝 Configuration Files

### `railway.json`

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### `.github/workflows/ci-cd.yml`

The main workflow file with 5 jobs for comprehensive CI/CD.

---

## 🎓 Best Practices Followed

1. **✅ Caching**: pnpm and Docker layer caching for faster builds
2. **✅ Parallelization**: Jobs run in parallel where possible
3. **✅ Security Scanning**: Trivy vulnerability scanning
4. **✅ Health Checks**: Pre and post-deployment health verification
5. **✅ Artifact Storage**: Build artifacts stored for 7 days
6. **✅ Concurrency Control**: Prevents overlapping deployments
7. **✅ Timeout Protection**: Each job has appropriate timeouts
8. **✅ Environment Protection**: Production environment with URL tracking

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 💡 Tips for Railway Free Tier

1. **Sleeping Apps**: Free tier apps sleep after inactivity - first request may be slow
2. **Usage Limits**: Monitor your usage in Railway dashboard
3. **Database**: If adding a database, consider Railway's PostgreSQL or Redis
4. **Custom Domain**: Free tier supports custom domains via CNAME

---

**Happy Deploying! 🚀**
