# 🚀 CampusConnect Deployment Guide - Railway + Vercel

This guide will walk you through deploying CampusConnect using **Railway** (backend + database) and **Vercel** (frontend).

**Total Time**: ~20-25 minutes

---

## 📋 Prerequisites

- ✅ GitHub account with your code pushed to: https://github.com/pravin-4620/Connect
- ✅ Railway account (sign up at [railway.app](https://railway.app))
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))

---

## 🎯 Deployment Overview

```
┌─────────────────────────────────────────────────┐
│                   Railway                        │
│  ┌──────────────┐      ┌──────────────┐        │
│  │  PostgreSQL  │◄────►│   Backend    │        │
│  │   Database   │      │  (Node.js)   │        │
│  └──────────────┘      └──────────────┘        │
│                              ▲                   │
└──────────────────────────────┼───────────────────┘
                               │
                               │ API Calls
                               │
                        ┌──────▼──────┐
                        │   Vercel    │
                        │  (Frontend) │
                        │   React     │
                        └─────────────┘
```

---

## 🔧 Part 1: Deploy Backend + Database on Railway (15 minutes)

### Step 1: Create Railway Account & Project

1. **Go to [Railway.app](https://railway.app)**
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. **Authorize Railway** to access your GitHub account
5. Select repository: **`pravin-4620/Connect`**

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. **Wait 30 seconds** for the database to provision

### Step 3: Configure Backend Service

1. Click on your **GitHub repo service** (should be auto-created)
2. Go to **"Settings"** tab
3. Configure the following:

#### **Root Directory**
```
backend
```

#### **Build Command** (leave default or set to):
```
npm install && npm run build
```

#### **Start Command**:
```
npm start
```

#### **Watch Paths** (optional, helps with auto-deploys):
```
backend/**
```

### Step 4: Add Environment Variables

1. Still in your backend service, go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these variables **one by one**:

#### **DATABASE_URL**
1. Click **"+ New Variable"** → **"Add Reference"**
2. Select your **PostgreSQL database**
3. Choose **`DATABASE_URL`**
4. This automatically connects your backend to the database! ✨

#### **JWT_SECRET**
```
Variable: JWT_SECRET
Value: 17d9eda7393674b445f7a959dbfdd222dd9f4a0d153f49cd82d92fa27e087dcd
```
*(Or generate a new one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)*

#### **JWT_EXPIRES_IN**
```
Variable: JWT_EXPIRES_IN
Value: 7d
```

#### **FRONTEND_URL**
```
Variable: FRONTEND_URL
Value: http://localhost:3000
```
*(We'll update this after deploying the frontend)*

#### **NODE_ENV**
```
Variable: NODE_ENV
Value: production
```

#### **PORT**
```
Variable: PORT
Value: 5001
```

### Step 5: Deploy Backend

1. Click **"Deploy"** or wait for auto-deployment
2. **Monitor the deployment** in the "Deployments" tab
3. Wait for the build to complete (2-3 minutes)
4. Once deployed, you'll see ✅ **"Success"**

### Step 6: Get Your Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy your domain (e.g., `campusconnect-backend-production.up.railway.app`)
5. **Save this URL** - you'll need it for the frontend!

### Step 7: Run Database Migrations

Railway doesn't have a built-in shell, so we'll use a one-time deployment:

**Option A: Using Railway CLI (Recommended)**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   cd /Users/pravin/Documents/React/CampusConnect/backend
   railway link
   ```
   *(Select your project from the list)*

4. Run migrations:
   ```bash
   railway run npm run prisma:migrate:deploy
   ```

5. Seed the database:
   ```bash
   railway run npm run prisma:seed
   ```

**Option B: Add Migration Script (Alternative)**

1. In Railway, go to your backend service → **"Variables"**
2. Add a new variable:
   ```
   Variable: RAILWAY_RUN_BUILD_COMMAND
   Value: npm install && npm run build && npm run prisma:migrate:deploy && npm run prisma:seed
   ```
3. Redeploy the service
4. After first successful deployment, **remove this variable** to avoid re-seeding

### Step 8: Test Your Backend

1. Visit your backend URL: `https://your-backend-url.up.railway.app`
2. You should see:
   ```json
   {
     "message": "CampusConnect API Server",
     "version": "1.0.0",
     "status": "running"
   }
   ```

✅ **Backend deployment complete!**

---

## 🎨 Part 2: Deploy Frontend on Vercel (5 minutes)

### Step 1: Create Vercel Account & Import Project

1. **Go to [Vercel.com](https://vercel.com)**
2. Click **"Add New..."** → **"Project"**
3. **Import** your GitHub repository: `pravin-4620/Connect`
4. Vercel will detect it as a Vite project

### Step 2: Configure Project Settings

#### **Framework Preset**
```
Vite
```
*(Should be auto-detected)*

#### **Root Directory**
```
frontend
```

#### **Build Command**
```
npm run build
```
*(Should be auto-filled)*

#### **Output Directory**
```
dist
```
*(Should be auto-filled)*

#### **Install Command**
```
npm install
```
*(Should be auto-filled)*

### Step 3: Add Environment Variables

1. Scroll down to **"Environment Variables"**
2. Add these variables:

#### **VITE_API_URL**
```
Variable: VITE_API_URL
Value: https://your-backend-url.up.railway.app/api
```
*(Replace with your actual Railway backend URL from Part 1, Step 6)*

#### **VITE_SOCKET_URL**
```
Variable: VITE_SOCKET_URL
Value: https://your-backend-url.up.railway.app
```
*(Same Railway backend URL, without /api)*

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for the build (2-3 minutes)
3. Once complete, you'll see 🎉 **"Congratulations!"**

### Step 5: Get Your Frontend URL

1. Vercel will show your deployment URL (e.g., `campusconnect-xyz.vercel.app`)
2. **Copy this URL**
3. Click **"Visit"** to see your app!

✅ **Frontend deployment complete!**

---

## 🔄 Part 3: Update Backend with Frontend URL (2 minutes)

Now we need to update the backend to allow requests from your Vercel frontend:

### Step 1: Update Railway Environment Variable

1. Go back to **Railway**
2. Open your **backend service**
3. Go to **"Variables"** tab
4. Find **`FRONTEND_URL`**
5. Update the value to your Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
   *(No trailing slash!)*

### Step 2: Redeploy Backend

1. Railway will **automatically redeploy** when you change environment variables
2. Wait 1-2 minutes for redeployment
3. Check the "Deployments" tab for ✅ success

✅ **Configuration complete!**

---

## ✅ Part 4: Test Your Application (3 minutes)

### Step 1: Open Your Application

Visit your Vercel URL: `https://your-app-name.vercel.app`

### Step 2: Test Login

Use the default admin credentials:
- **Email**: `admin@campusconnect.com`
- **Password**: `admin123`

### Step 3: Test Features

- ✅ Dashboard loads
- ✅ Navigation works
- ✅ Theme switching works
- ✅ Chat/messaging works (WebSocket connection)
- ✅ User management works

### Step 4: Change Admin Password

⚠️ **Important**: Change the default admin password immediately!

1. Go to Settings
2. Click "Change Password"
3. Set a strong password

---

## 📊 Your Deployment URLs

Save these for reference:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://your-app.vercel.app` | Main application |
| **Backend** | `https://your-backend.up.railway.app` | API server |
| **Database** | Railway Dashboard | PostgreSQL database |

---

## 💰 Cost Breakdown

### Railway
- **Free Tier**: $5 credit/month (good for small projects)
- **Hobby Plan**: $5/month (500 hours)
- **Pro Plan**: $20/month (unlimited)

**Estimated Cost**: $5-20/month depending on usage

### Vercel
- **Free Tier**: Perfect for this project
- **Pro**: $20/month (only if you need advanced features)

**Estimated Cost**: $0/month (free tier is sufficient)

### Total Monthly Cost
- **Development/Testing**: $0-5/month (Railway free tier)
- **Production**: $5-20/month

---

## 🔧 Useful Railway Commands

### View Logs
```bash
railway logs
```

### Run Commands in Railway Environment
```bash
railway run <command>
```

### Open Railway Dashboard
```bash
railway open
```

### Connect to Database
```bash
railway connect postgres
```

---

## 🐛 Troubleshooting

### Issue 1: Backend Build Fails

**Solution**:
1. Check Railway logs in "Deployments" tab
2. Verify all environment variables are set
3. Ensure `backend` is set as root directory

### Issue 2: Database Connection Error

**Solution**:
1. Verify `DATABASE_URL` is set as a reference to PostgreSQL
2. Check if migrations ran successfully
3. Try running migrations manually with Railway CLI

### Issue 3: Frontend Can't Connect to Backend

**Solution**:
1. Verify `VITE_API_URL` in Vercel matches your Railway backend URL
2. Check `FRONTEND_URL` in Railway matches your Vercel URL
3. Ensure both URLs use `https://` (not `http://`)
4. Check Railway logs for CORS errors

### Issue 4: WebSocket Not Working

**Solution**:
1. Verify `VITE_SOCKET_URL` points to Railway backend
2. Check browser console for WebSocket errors
3. Railway supports WebSockets by default, so it should work

### Issue 5: "Prisma Client Not Generated"

**Solution**:
1. Ensure `npm run build` includes `prisma generate`
2. Check `package.json` has `postinstall` script
3. Redeploy the backend service

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

### Railway
- **Push to `main` branch** → Automatic backend deployment
- **Change environment variables** → Automatic redeployment

### Vercel
- **Push to `main` branch** → Automatic frontend deployment
- **Push to other branches** → Preview deployments

---

## 📈 Monitoring & Logs

### Railway Logs
1. Go to your backend service
2. Click "Deployments" tab
3. Click on a deployment
4. View real-time logs

### Vercel Logs
1. Go to your project
2. Click "Deployments"
3. Click on a deployment
4. View function logs and build logs

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed on Railway
- [ ] PostgreSQL database created
- [ ] Database migrations completed
- [ ] Database seeded with initial data
- [ ] Backend URL generated and saved
- [ ] Frontend deployed on Vercel
- [ ] Frontend URL generated and saved
- [ ] Backend `FRONTEND_URL` updated
- [ ] Application tested and working
- [ ] Admin password changed
- [ ] All features verified (chat, theme, etc.)

---

## 🚀 Optional Enhancements

### Custom Domain (Frontend)

1. Go to Vercel project → "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in Railway

### Custom Domain (Backend)

1. Go to Railway service → "Settings" → "Networking"
2. Add custom domain
3. Update DNS records
4. Update `VITE_API_URL` in Vercel

### Enable Email Integration

1. Set up Google Cloud Console project
2. Enable Gmail API
3. Get OAuth credentials
4. Add to Railway environment variables:
   ```
   GMAIL_CLIENT_ID=your-client-id
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REDIRECT_URI=https://your-backend-url/api/auth/gmail-callback
   ```

### Enable File Uploads (AWS S3)

1. Create AWS S3 bucket
2. Get AWS credentials
3. Add to Railway environment variables:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   ```

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Railway Discord**: https://discord.gg/railway
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🎉 Success!

Your CampusConnect application is now live! 🚀

**Frontend**: https://your-app-name.vercel.app
**Backend**: https://your-backend-url.up.railway.app

Enjoy your deployed application!

---

## 📝 Quick Reference

### Default Admin Credentials
```
Email: admin@campusconnect.com
Password: admin123
```
⚠️ **Change immediately after first login!**

### Environment Variables Summary

**Railway (Backend)**:
```bash
DATABASE_URL=<auto-generated-by-railway>
JWT_SECRET=17d9eda7393674b445f7a959dbfdd222dd9f4a0d153f49cd82d92fa27e087dcd
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=5001
```

**Vercel (Frontend)**:
```bash
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_SOCKET_URL=https://your-backend.up.railway.app
```

---

**Good luck with your deployment! 🎊**
