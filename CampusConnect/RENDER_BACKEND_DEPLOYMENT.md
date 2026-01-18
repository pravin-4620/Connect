# 🚀 Backend Deployment Guide - Render Only

This guide focuses on deploying **ONLY the backend** to Render with a PostgreSQL database.

**Total Time**: ~15-20 minutes

---

## 📋 Prerequisites

- ✅ GitHub repository: https://github.com/pravin-4620/Connect
- ✅ Render account (sign up at [render.com](https://render.com))
- ✅ Database provider account (Neon/Supabase for PostgreSQL)

---

## 🎯 Deployment Overview

```
┌─────────────────────────────────────────────────┐
│              Neon/Supabase                       │
│           PostgreSQL Database                    │
└──────────────────┬──────────────────────────────┘
                   │
                   │ DATABASE_URL
                   │
            ┌──────▼──────┐
            │   Render    │
            │  (Backend)  │
            │  Node.js    │
            └─────────────┘
```

---

## 🗄️ Step 1: Create PostgreSQL Database (5 minutes)

### Option A: Using Neon (Recommended - Free Tier)

1. **Go to [Neon.tech](https://neon.tech)**
2. Click **"Sign Up"** (use GitHub for quick signup)
3. Click **"Create a project"**
4. **Project settings:**
   - Name: `CampusConnect`
   - Region: Choose closest to you
   - PostgreSQL version: 16 (default)
5. Click **"Create project"**
6. **Copy the connection string:**
   - You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
7. **Save this connection string** - you'll need it for Render!

### Option B: Using Supabase

1. **Go to [Supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Create new project:
   - Name: `CampusConnect`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait for project to be created (1-2 minutes)
5. Go to **Settings** → **Database**
6. Scroll to **"Connection string"**
7. Select **"URI"** tab
8. **Copy the connection string** and replace `[YOUR-PASSWORD]` with your actual password
9. **Save this connection string**

---

## 🔧 Step 2: Deploy Backend to Render (10 minutes)

### Step 2.1: Create Render Account

1. **Go to [Render.com](https://render.com)**
2. Click **"Get Started"**
3. **Sign up with GitHub** (recommended for easy repo access)

### Step 2.2: Create Web Service

1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect account"** to connect GitHub
5. Find and select repository: **`pravin-4620/Connect`**
6. Click **"Connect"**

### Step 2.3: Configure Service Settings

Fill in the following settings:

#### **Name**
```
campusconnect-backend
```
*(or any name you prefer)*

#### **Region**
```
Oregon (US West) or Singapore (closest to you)
```

#### **Branch**
```
main
```

#### **Root Directory**
```
backend
```
⚠️ **IMPORTANT**: This tells Render to look in the `backend` folder

#### **Runtime**
```
Node
```
*(Should be auto-detected)*

#### **Build Command**
```
npm install && npm run build
```

#### **Start Command**
```
npm start
```

#### **Instance Type**
```
Free
```
*(or paid if you need better performance)*

### Step 2.4: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add these variables **one by one**:

#### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: <paste-your-neon-or-supabase-connection-string>
```
Example:
```
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

#### 2. JWT_SECRET
```
Key: JWT_SECRET
Value: 17d9eda7393674b445f7a959dbfdd222dd9f4a0d153f49cd82d92fa27e087dcd
```
*(Or generate a new one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)*

#### 3. JWT_EXPIRES_IN
```
Key: JWT_EXPIRES_IN
Value: 7d
```

#### 4. FRONTEND_URL
```
Key: FRONTEND_URL
Value: http://localhost:3000
```
*(We'll update this after deploying frontend)*

#### 5. NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### 6. PORT
```
Key: PORT
Value: 5001
```

### Step 2.5: Create Web Service

1. Scroll down and click **"Create Web Service"**
2. Render will start building your backend
3. **Monitor the build logs** - you'll see:
   - Installing dependencies
   - Running build command
   - Starting the server

⏱️ **Wait 3-5 minutes** for the first deployment

---

## 🔄 Step 3: Run Database Migrations (5 minutes)

Once your backend is deployed, you need to run database migrations.

### Step 3.1: Open Shell

1. In your Render service dashboard, click **"Shell"** tab (left sidebar)
2. Wait for shell to connect

### Step 3.2: Run Migrations

In the shell, run these commands:

```bash
# Run database migrations
npm run prisma:migrate:deploy
```

Wait for migrations to complete. You should see:
```
✓ Migrations applied successfully
```

### Step 3.3: Seed Database

```bash
# Seed initial data (admin user, etc.)
npm run prisma:seed
```

You should see:
```
✓ Database seeded successfully
✓ Admin user created
```

---

## ✅ Step 4: Get Your Backend URL

1. Go back to your service dashboard
2. At the top, you'll see your service URL:
   ```
   https://campusconnect-backend.onrender.com
   ```
3. **Copy this URL** - you'll need it for the frontend!

---

## 🧪 Step 5: Test Your Backend

### Test 1: Health Check

Visit your backend URL in a browser:
```
https://your-backend-url.onrender.com
```

You should see:
```json
{
  "message": "CampusConnect API Server",
  "version": "1.0.0",
  "status": "running"
}
```

### Test 2: API Endpoint

Try accessing an API endpoint:
```
https://your-backend-url.onrender.com/api/auth/test
```

If you get a response (even an error), it means the API is working!

---

## 📊 Your Backend Deployment Info

Save this information:

| Item | Value |
|------|-------|
| **Backend URL** | https://_________________.onrender.com |
| **Database** | Neon/Supabase Dashboard |
| **Admin Email** | admin@campusconnect.com |
| **Admin Password** | admin123 |

---

## 🐛 Troubleshooting

### Issue 1: Build Fails

**Error**: `Cannot find module` or `npm install failed`

**Solution**:
1. Check the build logs in Render
2. Verify `backend` is set as root directory
3. Ensure `package.json` exists in the backend folder
4. Try redeploying: Click "Manual Deploy" → "Deploy latest commit"

### Issue 2: Database Connection Error

**Error**: `Can't reach database server` or `Connection refused`

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check if Neon/Supabase database is active
3. Ensure connection string includes `?sslmode=require` for Neon
4. Test connection in Render shell:
   ```bash
   npm run prisma:studio
   ```

### Issue 3: Migrations Fail

**Error**: `Migration failed` or `Table already exists`

**Solution**:
1. Check if database is empty
2. Try resetting (⚠️ this deletes all data):
   ```bash
   npx prisma migrate reset --force
   ```
3. Then run migrations again:
   ```bash
   npm run prisma:migrate:deploy
   npm run prisma:seed
   ```

### Issue 4: "Prisma Client Not Generated"

**Error**: `@prisma/client did not initialize yet`

**Solution**:
1. In Render, go to "Environment" tab
2. Verify `build` command includes `npm run build`
3. Check `package.json` has `postinstall` script:
   ```json
   "postinstall": "prisma generate"
   ```
4. Redeploy the service

### Issue 5: Service Keeps Crashing

**Error**: Service shows "Deploy failed" or keeps restarting

**Solution**:
1. Check logs in "Logs" tab
2. Look for specific error messages
3. Common issues:
   - Missing environment variables
   - Wrong start command
   - Database connection issues
4. Verify all environment variables are set correctly

---

## 💰 Cost Breakdown

### Render Free Tier
- ✅ Free web service (sleeps after 15 min inactivity)
- ✅ 750 hours/month
- ⚠️ First request after sleep takes 30-60 seconds

### Render Paid Tier
- 💵 **Starter**: $7/month (no sleep, better performance)
- 💵 **Standard**: $25/month (more resources)

### Database
- **Neon Free**: $0 (0.5GB storage, 3 projects)
- **Neon Pro**: $19/month (unlimited projects)
- **Supabase Free**: $0 (500MB database, 2 projects)
- **Supabase Pro**: $25/month

### Recommended for Production
- **Render Starter**: $7/month
- **Neon Free**: $0
- **Total**: **$7/month**

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Render automatically detects the push and redeploys
4. Monitor deployment in Render dashboard

---

## 📈 Monitoring & Logs

### View Logs
1. Go to your service in Render
2. Click **"Logs"** tab
3. See real-time logs of your application

### View Metrics
1. Click **"Metrics"** tab
2. See CPU, memory, and request metrics

### Set Up Alerts
1. Go to **"Settings"** → **"Alerts"**
2. Add email for deployment notifications

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed on Render
- [ ] PostgreSQL database created (Neon/Supabase)
- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Database seeded with initial data
- [ ] Backend URL saved
- [ ] Health check endpoint working
- [ ] API endpoints responding
- [ ] Logs showing no errors

---

## 🔐 Security Best Practices

1. **Change JWT_SECRET** to a unique value:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use strong database password** (if using Supabase)

3. **Enable SSL** for database connections (already enabled with Neon)

4. **Don't commit `.env` files** to GitHub

5. **Change admin password** after first login

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Neon Docs**: https://neon.tech/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🎉 Success!

Your backend is now deployed and running! 🚀

**Backend URL**: https://your-backend-url.onrender.com

**Next Steps**:
1. Test all API endpoints
2. Verify database connection
3. Deploy frontend to Vercel (see VERCEL_DEPLOYMENT.md)
4. Connect frontend to backend

---

## 📝 Quick Commands Reference

### Render Shell Commands
```bash
# Check Prisma status
npx prisma --version

# View database schema
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Run migrations
npm run prisma:migrate:deploy

# Seed database
npm run prisma:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

**Good luck with your deployment! 🎊**
