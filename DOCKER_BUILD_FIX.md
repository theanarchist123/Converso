# 🔧 Docker Build Fix - Environment Variables

## Problem
Docker build was failing with error:
```
Error: supabaseUrl is required.
```

This happened because Next.js needs access to `NEXT_PUBLIC_*` environment variables **during build time**, but Docker build process doesn't have access to `.env.local` by default.

## Solution
We now pass environment variables as **build arguments** to Docker.

## How to Deploy

### Option 1: Using deploy scripts (Recommended)

**Windows:**
```cmd
deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

The scripts will automatically:
1. Load variables from `.env.local`
2. Pass them as build arguments to Docker
3. Build and run the container

### Option 2: Using Docker Compose

```cmd
docker-compose up --build -d
```

Docker Compose will automatically read `.env.local` and pass build args.

### Option 3: Manual Docker build

```cmd
docker build -t saas-app ^
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url ^
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key ^
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key ^
  .
```

## Required Environment Variables

Make sure your `.env.local` has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## What Changed

1. **Dockerfile** - Added ARG and ENV declarations for build-time variables
2. **docker-compose.yml** - Added `args` section to pass build arguments
3. **deploy.bat** - Loads and passes env vars from `.env.local`
4. **deploy.sh** - Loads and passes env vars from `.env.local`

## Verification

After deployment, check:
1. Container is running: `docker ps`
2. No errors in logs: `docker logs saas-app-container`
3. Health check passes: `curl http://localhost:3000/api/health`

## Troubleshooting

If build still fails:
1. Verify `.env.local` exists and has correct values
2. Make sure no spaces around `=` in env file
3. Check values don't have special characters that need escaping
4. Try building with verbose output: `docker build --progress=plain -t saas-app .`

✅ **Fixed and ready to deploy!**
