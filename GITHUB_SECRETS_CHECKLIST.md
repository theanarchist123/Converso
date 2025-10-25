# 🔐 GitHub Secrets Setup Checklist

## Exact secrets to add to GitHub (from your .env.local)

Go to: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

---

## Vercel Secrets (3 secrets)

- [ ] `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- [ ] `VERCEL_ORG_ID` - Get from `.vercel/project.json`
- [ ] `VERCEL_PROJECT_ID` - Get from `.vercel/project.json`

---

## Application Secrets (16 secrets)

### Clerk Authentication (9 secrets)

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  ```
  pk_test_cmVsYXhlZC1zaGFyay00NS5jbGVyay5hY2NvdW50cy5kZXYk
  ```

- [ ] `CLERK_SECRET_KEY`
  ```
  sk_test_xKhgsS5Zx5DoihZKVexOe5bQLqrZakcTatXtFJqdAA
  ```

- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  ```
  /sign-in
  ```

- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
  ```
  /sign-up
  ```

- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
  ```
  /
  ```

- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
  ```
  /
  ```

- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
  ```
  /
  ```

- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
  ```
  /
  ```

- [ ] `NEXT_PUBLIC_CLERK_PLANS_URL`
  ```
  /subscription
  ```

### Supabase (2 secrets)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  ```
  https://yvxwndrhnxdemctetrap.supabase.co
  ```

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eHduZHJobnhkZW1jdGV0cmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDA2MzAsImV4cCI6MjA2MzkxNjYzMH0.a9k_AYdBZhmY8AG2PW80g7Lvt5UsFyUpk-Chq2pHoD4
  ```

### AI APIs (2 secrets)

- [ ] `NEXT_PUBLIC_VAPI_WEB_TOKEN`
  ```
  764e28c7-d165-42d0-b2a2-784dea61e398
  ```

- [ ] `GEMINI_API_KEY`
  ```
  AIzaSyAtUHUrc061uBRXTMV7C7gDPUePWPbhSLE
  ```

### Database (1 secret)

- [ ] `MONGODB_URI`
  ```
  mongodb+srv://converso-user:goodies987@cluster0.angswxn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
  ```

### JWT Secrets (2 secrets)

- [ ] `JWT_ACCESS_SECRET`
  ```
  c14dfa56eece63e69664b063ad6a12551d207b904aa164cc856b2f45f45936802726d2e7ce94602f452ba5534e034ce3b7552fdde15c5450632b42f96b8d6c3f
  ```

- [ ] `JWT_REFRESH_SECRET`
  ```
  73a3b7a9989d9be1c97ec7063ba78012ce6e2bcdc2e9a2ec4a1212023f08b75299abc9719641511d581eea11dc29fbd89320b3494a6ccee3ee609d37b2e26045
  ```

---

## Total Secrets Required: 19

- 3 Vercel secrets
- 16 Application secrets

---

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the **Name** (exactly as shown above)
5. Enter the **Secret** (copy the value from above)
6. Click **Add secret**
7. Repeat for all 19 secrets

---

## Verification

After adding all secrets, you should see **19 secrets** listed in GitHub Actions secrets.

✅ All secret names match your `.env.local` file exactly!
