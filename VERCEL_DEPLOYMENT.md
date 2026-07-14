# DEPLOYMENT GUIDE FOR VERCEL

## Step 1: Get Your Anthropic API Key
1. Go to https://console.anthropic.com/
2. Create an account or sign in
3. Copy your API key (looks like: sk-ant-...)

## Step 2: Deploy Backend to Vercel
```bash
cd backend
vercel --prod
```
Save the backend URL (e.g., https://your-backend.vercel.app)

## Step 3: Configure Backend Environment Variables in Vercel Dashboard
Backend Project → Settings → Environment Variables:
- Name: `ANTHROPIC_API_KEY` | Value: `sk-ant-xxxxx`
- Name: `ENVIRONMENT` | Value: `production`
- Name: `CORS_ORIGINS` | Value: `["https://your-frontend.vercel.app"]`

## Step 4: Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

## Step 5: Configure Frontend Environment Variables in Vercel Dashboard
Frontend Project → Settings → Environment Variables:
- Name: `VITE_API_URL` | Value: `https://your-backend.vercel.app`

## Step 6: Test
1. Visit your frontend URL
2. Type a message in chat
3. Should connect without 404 errors

## Troubleshooting
- If still getting 404: Check Vercel deployment logs
- If "CORS error": Verify CORS_ORIGINS includes your frontend URL
- If "API key error": Verify ANTHROPIC_API_KEY is set correctly
