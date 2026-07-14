# 404 NOT_FOUND Troubleshooting Checklist

## Quick Diagnosis Checklist

### ❌ ISSUE 1: Backend Not Deployed
**What to check:**
- [ ] Do you have TWO separate Vercel projects (frontend + backend)?
- [ ] Or did you only deploy the frontend?

**How to verify:**
```bash
# Check if backend is deployed
vercel list  # Shows all your Vercel projects
```

**If you only see frontend:**
This is your problem! The backend isn't deployed.

---

### ❌ ISSUE 2: Frontend Doesn't Know Backend URL
**What to check:**
- [ ] Go to Frontend Vercel project → Settings → Environment Variables
- [ ] Is `VITE_API_URL` set?

**If missing, add it:**
- Name: `VITE_API_URL`
- Value: `https://your-backend-project.vercel.app` (from backend deployment)

**If this is wrong:**
The frontend will get 404 because it's calling the wrong URL.

---

### ❌ ISSUE 3: Backend Missing API Key
**What to check:**
- [ ] Go to Backend Vercel project → Settings → Environment Variables
- [ ] Is `ANTHROPIC_API_KEY` set?
- [ ] Does it start with `sk-ant-` (NOT `sk-your-api-key-here`)?

**If it's the placeholder:**
Backend can't run. Set your real API key.

---

### ❌ ISSUE 4: CORS Blocking Frontend
**What to check:**
- [ ] Backend Vercel project → Settings → Environment Variables
- [ ] Is `CORS_ORIGINS` set to include your frontend URL?

**Example correct value:**
```
["https://your-frontend-project.vercel.app"]
```

**If this is missing:**
Backend will reject frontend requests.

---

## Step-by-Step Fix Process

### 1. Check What You Currently Have Deployed
```bash
vercel list
```

**Expected output:**
```
frontend-project        vercel.com/sourabhsinghrajpoot/dual-mode-frontend
backend-project         vercel.com/sourabhsinghrajpoot/dual-mode-backend
```

**What if you only see one?** → Deploy the missing one first

---

### 2. Get Your Actual Deployment URLs
- Frontend: `https://your-frontend-project.vercel.app`
- Backend: `https://your-backend-project.vercel.app`

---

### 3. Set Environment Variables in Vercel Dashboard

#### Backend Project:
1. Go to Settings → Environment Variables
2. Add/Edit these:
   - `ANTHROPIC_API_KEY` = `sk-ant-xxxxxxxxxxxxx` (your real key from https://console.anthropic.com/)
   - `CORS_ORIGINS` = `["https://your-frontend-project.vercel.app"]`
   - `ENVIRONMENT` = `production`

#### Frontend Project:
1. Go to Settings → Environment Variables
2. Add/Edit:
   - `VITE_API_URL` = `https://your-backend-project.vercel.app`

---

### 4. Redeploy Both Projects
```bash
# Redeploy backend (to pick up new env vars)
cd backend
vercel --prod

# Redeploy frontend (to pick up new env vars)
cd frontend
vercel --prod
```

---

### 5. Test the Connection
1. Open frontend URL in browser
2. Open DevTools (F12) → Network tab
3. Send a chat message
4. Look for request to `/api/chat`
5. Should return 200 (not 404)

---

## Common Mistakes

| Mistake | Why It Causes 404 | Fix |
|---------|---|---|
| Backend not deployed | Frontend calls non-existent backend | Deploy backend to Vercel |
| `VITE_API_URL` points to localhost | Frontend can't reach backend | Use Vercel backend URL |
| `ANTHROPIC_API_KEY` is placeholder | Backend fails to initialize | Set real API key |
| `CORS_ORIGINS` doesn't include frontend | Backend rejects frontend | Add frontend URL to CORS |
| Env vars changed but not redeployed | New settings not active | Redeploy after changing vars |
| Frontend and backend on same project | Nginx config doesn't match | Use separate Vercel projects |

---

## Debugging Commands

### Check Backend Logs
```bash
vercel logs --prod backend-project-name
```
Look for errors about API key, CORS, or routes.

### Check Frontend Build
```bash
vercel logs --prod frontend-project-name
```
Look for errors about API URL resolution.

### Test API Directly
```bash
curl https://your-backend.vercel.app/health
```
Should return: `{"status":"ok"}`

If you get 404, backend isn't responding properly.

---

## Tell Me Your Status

Reply with:
1. How many Vercel projects do you have? (1 or 2?)
2. What's your frontend URL?
3. What's your backend URL? (if it exists)
4. When you open frontend, what error do you see?
