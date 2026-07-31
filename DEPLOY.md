# 🚀 Architex — Free Deployment Guide

**Stack:** Neon (PostgreSQL) · Render (Backend) · Vercel (Frontend) · Cloudinary (Images)  
**Cost:** $0 · No credit card required for any service

---

## STEP 1 — Push Your Code to GitHub

Open a terminal in your project folder and run:

```bash
cd C:\Users\strev\.gemini\antigravity\scratch\architex-app
git init
git add .
git commit -m "Initial Architex commit"
```

Then on [github.com](https://github.com):
1. Click **New repository**
2. Name it `architex-app`, set it to **Public** or **Private**
3. Click **Create repository**
4. Copy and run the two commands GitHub shows you (the `git remote add origin...` and `git push` lines)

---

## STEP 2 — Get Free PostgreSQL (Neon)

1. Go to **[neon.tech](https://neon.tech)** → **Sign up free** (use GitHub login)
2. Click **Create Project** → name it `architex`
3. Click on your project → **Connection Details**
4. Copy the **Connection string** — it looks like:
   ```
   postgresql://alex:password@ep-cool-darkness-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Save this string** — you'll need it in Steps 3 and 4

---

## STEP 3 — Deploy Backend to Render

1. Go to **[render.com](https://render.com)** → **Sign up free** (use GitHub login)
2. Click **New → Web Service**
3. Connect your GitHub repo (`architex-app`)
4. Fill in:
   - **Name:** `architex-api`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Click **Add Environment Variables** and add ALL of these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(your Neon connection string from Step 2)* |
| `JWT_SECRET` | `1e0fe94a14694bc2d5608bf17b6aab9e15f50bcbb93802cc496e04f7defb4308363e6c4a82f9e06946eb8a0df84d1cdd9a4e2a5f89c1cb731e2a2f42d1ceb1c6` |
| `JWT_EXPIRES_IN` | `7d` |
| `GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` |
| `GOOGLE_CLIENT_SECRET` | `YOUR_GOOGLE_CLIENT_SECRET` |
| `CLOUDINARY_CLOUD_NAME` | *(from Step 5)* |
| `CLOUDINARY_API_KEY` | *(from Step 5)* |
| `CLOUDINARY_API_SECRET` | *(from Step 5)* |
| `FRONTEND_URL` | *(fill in after Step 4 — your Vercel URL)* |
| `PORT` | `10000` |

6. Click **Create Web Service** — it will start building (~3 min)
7. When done, copy your Render URL (looks like `https://architex-api.onrender.com`)

> ⚠️ **Free Render note:** The server sleeps after 15 min of inactivity and takes ~30 sec to wake up on first visit. This is normal on the free tier.

---

## STEP 4 — Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)** → **Sign up** with GitHub
2. Click **Add New → Project**
3. Import your `architex-app` repository
4. Vercel auto-detects Vite — leave framework as **Vite**
5. Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | *(your Render URL from Step 3, e.g. `https://architex-api.onrender.com`)* |
| `VITE_GOOGLE_CLIENT_ID` | `47362985719-osdkrrqhutsh5jndcq7bh18n9r03aq7h.apps.googleusercontent.com` |

6. Click **Deploy** — takes ~1 minute
7. Your app is live 🎉

8. **Go back to Render** → your `architex-api` service → **Environment** → update `FRONTEND_URL` to your Vercel URL → **Save** (it will redeploy)

---

## STEP 5 — Get Free Image Hosting (Cloudinary)

1. Go to **[cloudinary.com](https://cloudinary.com)** → **Sign up free** (just email, no card)
2. After login, go to **Dashboard**
3. You'll see **Cloud Name**, **API Key**, **API Secret**
4. Go back to your Render environment variables and fill in those three values
5. Click **Save** on Render — it redeploys automatically

---

## STEP 6 — Update Google OAuth for Production

1. Go to **[Google Cloud Console](https://console.cloud.google.com)**
2. Select your project → **APIs & Services → Credentials**
3. Click your OAuth 2.0 Client
4. Under **Authorized JavaScript origins**, add your Vercel URL:
   ```
   https://architex-app.vercel.app
   ```
5. Under **Authorized redirect URIs**, add:
   ```
   https://architex-app.vercel.app/oauth-callback.html
   ```
6. Click **Save**

---

## STEP 7 — Verify Everything Works

1. ✅ Visit `https://your-render-url.onrender.com/api/health` → should return `{"ok":true,"db":"connected"}`
2. ✅ Visit your Vercel URL → should see the Architex login screen
3. ✅ Click Google Sign In → complete OAuth → lands on profile creation
4. ✅ Fill out profile → click Create Profile → lands on home feed
5. ✅ Create a post → verify it appears in feed
6. ✅ Send a DM → verify real-time delivery

---

## 🔄 Future Updates

Every time you push to GitHub, both Vercel and Render auto-redeploy. No manual steps needed!
