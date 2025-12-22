# Complete Vercel Deployment Guide - Step by Step

## Part 1: Deploy Backend (First)

### Step 1: Go to Vercel
1. Open: https://vercel.com
2. Click **"Sign Up"** (sign up with GitHub)
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Create New Backend Project
1. Click **"Add New..."** at top
2. Click **"Project"**
3. Find and click **"CampusConnect-Platform"** repo
4. Click **"Import"**

### Step 3: Configure Backend
You'll see a form. Change these:

**Root Directory:**
- Click the dropdown that says `./`
- Select **`./backend`**

**Build Command:**
- Leave it **EMPTY** (don't fill anything)

**Install Command:**
- Should already say `npm install` (leave as is)

**Output Directory:**
- Leave it **EMPTY**

### Step 4: Add Environment Variables
Scroll down to **"Environment Variables"** section.

Click **"Add"** and add these THREE variables one by one:

**Variable 1:**
- Name: `MONGODB_URI`
- Value: Paste your MongoDB connection string
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
  ```

**Variable 2:**
- Name: `JWT_SECRET`
- Value: Generate using this terminal command:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  (Copy the output - it's a long string)

**Variable 3:**
- Name: `NODE_ENV`
- Value: `production`

**Variable 4:** (add this one later after frontend deploys)
- Name: `FRONTEND_URL`
- Value: (we'll add this later)

### Step 5: Deploy
- Click **"Deploy"** button
- Wait 2-3 minutes for deployment
- When done, you'll see "Congratulations!"
- **Copy this URL** (you'll need it for frontend):
  ```
  https://campusconnect-api-[random].vercel.app
  ```

---

## Part 2: Deploy Frontend

### Step 1: Go Back to Vercel Dashboard
1. Click **"Vercel"** logo to go back to dashboard
2. Click **"Add New..."** 
3. Click **"Project"**

### Step 2: Import Frontend
1. Find **"CampusConnect-Platform"** again
2. Click **"Import"**

### Step 3: Configure Frontend
**Root Directory:**
- Click dropdown
- Select **`./frontend`**

**Build Command:**
- Should say `npm run build` (already correct)

**Output Directory:**
- Should say `build` (already correct)

### Step 4: Add Environment Variables
Scroll down to **"Environment Variables"**

Add ONE variable:

**Variable 1:**
- Name: `REACT_APP_API_URL`
- Value: Paste the backend URL from Part 1 Step 5
  ```
  https://campusconnect-api-[random].vercel.app
  ```

### Step 5: Deploy
- Click **"Deploy"** button
- Wait 2-3 minutes
- Copy this URL (your app is here):
  ```
  https://campusconnect-[random].vercel.app
  ```

---

## Part 3: Update Backend with Frontend URL

### Step 1: Go to Backend Settings
1. Click on your backend project in Vercel
2. Go to **"Settings"** tab
3. Click **"Environment Variables"** on left

### Step 2: Add Frontend URL
- Click **"Add"**
- Name: `FRONTEND_URL`
- Value: Paste your frontend URL from Part 2 Step 5
  ```
  https://campusconnect-[random].vercel.app
  ```
- Click **"Save"**

### Step 3: Redeploy Backend
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu
4. Click **"Redeploy"**

---

## Part 4: Configure MongoDB for Vercel

### Step 1: Whitelist Vercel IPs
1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Sign in
3. Go to **"Network Access"** (on left side)
4. Click **"Add IP Address"**
5. In the IP Address box, enter: `0.0.0.0/0`
6. Click **"Confirm"**

---

## Part 5: Test Your Deployment

### Test Backend:
1. Open: `https://your-backend-url.vercel.app/`
2. You should see: `{"message": "Welcome to CampusConnect API"}`

### Test Frontend:
1. Open: `https://your-frontend-url.vercel.app`
2. Try to login with:
   - Email: `student@test.com`
   - Password: `password123`

---

## If Something Goes Wrong

### Backend Not Working?
1. Go to Vercel → Your Backend Project
2. Click **"Deployments"**
3. Click on latest deployment
4. Click **"Logs"** tab
5. Look for error messages
6. Check if environment variables are all set correctly

### Frontend Shows Blank?
1. Open browser → Press **F12** (Developer Tools)
2. Go to **"Console"** tab
3. Look for red error messages
4. Make sure `REACT_APP_API_URL` is set to correct backend URL

### CORS Error in Browser Console?
- This means frontend and backend can't communicate
- Check that backend `FRONTEND_URL` is set correctly
- Redeploy backend after setting `FRONTEND_URL`

---

## Summary of URLs You'll Get

| What | URL |
|-----|-----|
| Backend API | `https://campusconnect-api-xxx.vercel.app` |
| Frontend App | `https://campusconnect-xxx.vercel.app` |
| Login Page | `https://campusconnect-xxx.vercel.app/login` |
| Student Dashboard | `https://campusconnect-xxx.vercel.app/dashboard` |

---

## Need Help With MongoDB Connection String?

If you're stuck on the MONGODB_URI:

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **"Database"** on left
3. Find your **CampusConnect** cluster
4. Click **"Connect"** button
5. Click **"Drivers"**
6. Select **"Node.js"** version 4.x
7. Copy the connection string that appears
8. Replace `<password>` with your actual password
9. Replace `myFirstDatabase` with `campusconnect`
10. That's your MONGODB_URI!

---

## Quick Checklist

Before deploying, make sure you have:
- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] MongoDB Atlas account
- [ ] MongoDB MONGODB_URI connection string
- [ ] JWT_SECRET (generate with terminal command)
- [ ] Code pushed to GitHub

Ready? Start with Part 1 above!
