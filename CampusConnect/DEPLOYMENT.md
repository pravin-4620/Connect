# CampusConnect Deployment Guide

This guide will help you deploy the CampusConnect application to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (for frontend)
- Render/Railway account (for backend)
- Database provider account (Neon/Supabase/Railway)

---

## 🗄️ Step 1: Setup PostgreSQL Database

### Option A: Using Neon (Recommended - Free Tier Available)

1. Go to [Neon](https://neon.tech) and sign up
2. Create a new project named "CampusConnect"
3. Copy the connection string (it looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb`)
4. Save this for later - you'll need it for backend deployment

### Option B: Using Supabase

1. Go to [Supabase](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI mode)
5. Save this for later

### Option C: Using Railway

1. Railway will provide both hosting and database
2. Skip to backend deployment section

---

## 🔧 Step 2: Deploy Backend

### Option A: Deploy to Render

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to [Render](https://render.com)** and sign up/login

3. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `CampusConnect` repository

4. **Configure the service:**
   - **Name**: `campusconnect-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL=<your-postgresql-connection-string-from-step-1>
   JWT_SECRET=<generate-a-random-secret-key>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   PORT=5001
   ```

   **To generate a secure JWT_SECRET**, run:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Click "Create Web Service"**

7. **Run Database Migration**
   - Once deployed, go to the service's "Shell" tab
   - Run: `npm run prisma:migrate:deploy`
   - Then run: `npm run prisma:seed` (to seed initial data)

8. **Copy your backend URL** (e.g., `https://campusconnect-backend.onrender.com`)

### Option B: Deploy to Railway

1. Go to [Railway](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Add a PostgreSQL database from Railway's marketplace
6. Configure environment variables (same as above)
7. Set root directory to `backend`
8. Deploy!

---

## 🎨 Step 3: Deploy Frontend

### Deploy to Vercel (Recommended)

1. **Go to [Vercel](https://vercel.com)** and sign up/login

2. **Import your project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository

3. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```
   Replace `your-backend-url.onrender.com` with your actual backend URL from Step 2

5. **Click "Deploy"**

6. **Copy your frontend URL** (e.g., `https://campusconnect.vercel.app`)

---

## 🔄 Step 4: Update Backend with Frontend URL

1. Go back to your backend service (Render/Railway)
2. Update the `FRONTEND_URL` environment variable with your actual Vercel URL
3. Redeploy the backend service

---

## ✅ Step 5: Verify Deployment

1. **Test the backend:**
   - Visit: `https://your-backend-url.onrender.com`
   - You should see: `{"message":"CampusConnect API Server","version":"1.0.0","status":"running"}`

2. **Test the frontend:**
   - Visit: `https://your-app-name.vercel.app`
   - Try logging in with the default admin credentials
   - Check if all features work

3. **Test real-time features:**
   - Open chat/messaging
   - Verify WebSocket connections work

---

## 🔐 Step 6: Secure Your Application

1. **Change default passwords** in the database
2. **Update JWT_SECRET** to a strong random value
3. **Enable HTTPS** (automatically handled by Vercel/Render)
4. **Set up monitoring** (Render/Vercel provide basic monitoring)

---

## 🚀 Step 7: Optional Enhancements

### Custom Domain

**For Frontend (Vercel):**
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

**For Backend (Render):**
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records

### File Uploads (AWS S3)

If you need file upload functionality:
1. Create an AWS S3 bucket
2. Get AWS credentials
3. Add to backend environment variables:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_S3_BUCKET=your-bucket-name
   ```

### Email Integration (Gmail OAuth)

1. Set up Google Cloud Console project
2. Enable Gmail API
3. Get OAuth credentials
4. Add to backend environment variables

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:
- **Push to `main` branch** → Automatic deployment
- **Push to other branches** → Preview deployments (Vercel)

---

## 📊 Monitoring & Logs

### Backend Logs (Render)
- Go to your service → "Logs" tab
- View real-time logs

### Frontend Logs (Vercel)
- Go to your project → "Deployments"
- Click on a deployment → "Functions" tab for logs

---

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Render/Railway IPs
- Ensure migrations are run: `npm run prisma:migrate:deploy`

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check browser console for specific CORS errors
- Ensure both HTTP and HTTPS are handled

### Build Failures
- Check build logs in Vercel/Render
- Verify all dependencies are in `package.json`
- Ensure environment variables are set

### WebSocket Issues
- Verify `VITE_SOCKET_URL` points to backend
- Check if backend allows WebSocket connections
- Some platforms require WebSocket-specific configuration

---

## 💰 Cost Estimates

### Free Tier (Good for testing/small projects)
- **Database**: Neon (Free - 0.5GB)
- **Backend**: Render (Free - sleeps after 15min inactivity)
- **Frontend**: Vercel (Free - unlimited bandwidth)
- **Total**: $0/month

### Production Tier (Recommended for real use)
- **Database**: Neon Pro ($19/month) or Supabase Pro ($25/month)
- **Backend**: Render Starter ($7/month) or Railway ($5-20/month)
- **Frontend**: Vercel Pro ($20/month) - only if you need advanced features
- **Total**: ~$26-64/month

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs
3. Verify all environment variables are set correctly
4. Check that database migrations completed successfully

---

## 🎉 Success!

Your CampusConnect application should now be live! 🚀

**Frontend**: https://your-app-name.vercel.app
**Backend**: https://your-backend-url.onrender.com
