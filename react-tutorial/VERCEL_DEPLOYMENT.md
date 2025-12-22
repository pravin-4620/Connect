# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com) - Sign up with GitHub
- MongoDB Atlas account for database
- Backend and frontend code pushed to GitHub

---

## Step 1: Deploy Backend to Vercel

### 1.1 Open Vercel Dashboard
- Go to https://vercel.com/dashboard
- Click **"Add New..."** → **"Project"**

### 1.2 Import Repository
- Select your GitHub repository: `pravin-4620/CampusConnect-Platform`
- Click **"Import"**

### 1.3 Configure Backend Project
- **Framework Preset**: Select `Other` (Node.js)
- **Root Directory**: Select `./backend`
- **Build Command**: Leave empty
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 1.4 Set Environment Variables
Click **"Environment Variables"** and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET = your-secret-key-here
NODE_ENV = production
FRONTEND_URL = https://your-frontend-name.vercel.app
```

**Get MongoDB URI:**
1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Your Project → Database → Connect → Copy connection string
3. Replace `<password>` with your actual password

### 1.5 Deploy
- Click **"Deploy"**
- Wait for deployment to complete
- Your backend URL will be: `https://campusconnect-api-xxx.vercel.app`
- Copy this URL (you'll need it for frontend)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create New Project
- In Vercel Dashboard, click **"Add New..."** → **"Project"**
- Select same GitHub repository
- Click **"Import"**

### 2.2 Configure Frontend Project
- **Framework Preset**: `React`
- **Root Directory**: Select `./frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 2.3 Set Environment Variables
Click **"Environment Variables"** and add:

```
REACT_APP_API_URL = https://your-backend-url.vercel.app
```

Replace `https://your-backend-url.vercel.app` with the backend URL from Step 1.5

### 2.4 Deploy
- Click **"Deploy"**
- Wait for deployment
- Your frontend URL will be: `https://campusconnect-xxx.vercel.app`

---

## Step 3: Configure MongoDB Atlas for Vercel

### 3.1 Whitelist Vercel IPs
1. Go to MongoDB Atlas → Project → Network Access
2. Click **"Add IP Address"**
3. Instead of specific IPs, use: `0.0.0.0/0` (allow all)
   - OR add Vercel IPs manually
4. Click **"Confirm"**

---

## Step 4: Test Deployment

### 4.1 Test Backend
```bash
curl https://your-backend-url.vercel.app/
# Should return: {"message": "Welcome to CampusConnect API"}
```

### 4.2 Test Frontend
- Open https://your-frontend-url.vercel.app
- Try logging in with:
  - Email: `student@test.com`
  - Password: `password123`

---

## Troubleshooting

### Backend Not Working
- Check logs: Vercel Dashboard → Project → Deployments → Logs
- Verify environment variables are set correctly
- Ensure MongoDB URI is correct

### Frontend Shows Blank Page
- Check browser console (F12) for errors
- Verify `REACT_APP_API_URL` is set correctly
- Check that backend is responding

### CORS Errors
- Backend CORS is configured to allow your frontend domain
- If still having issues, check backend logs

---

## Update After Changes

1. Make changes locally
2. Push to GitHub:
   ```bash
   git add -A
   git commit -m "Update changes"
   git push origin main
   ```
3. Vercel will automatically redeploy both projects

---

## Useful Links
- Backend URL: Will be provided after deployment
- Frontend URL: Will be provided after deployment
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
