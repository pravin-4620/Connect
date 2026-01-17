# 🚀 Railway + Vercel Deployment - Quick Checklist

## ⏱️ Total Time: ~20-25 minutes

---

## 📋 Part 1: Railway (Backend + Database) - 15 minutes

### Setup (5 min)
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "Start a New Project"
- [ ] Deploy from GitHub: `pravin-4620/Connect`
- [ ] Add PostgreSQL database (click "+ New" → "Database" → "PostgreSQL")

### Configure Backend (5 min)
- [ ] Set root directory: `backend`
- [ ] Set start command: `npm start`
- [ ] Add environment variables:
  - [ ] `DATABASE_URL` (reference to PostgreSQL)
  - [ ] `JWT_SECRET`: `17d9eda7393674b445f7a959dbfdd222dd9f4a0d153f49cd82d92fa27e087dcd`
  - [ ] `JWT_EXPIRES_IN`: `7d`
  - [ ] `FRONTEND_URL`: `http://localhost:3000` (update later)
  - [ ] `NODE_ENV`: `production`
  - [ ] `PORT`: `5001`

### Deploy & Setup (5 min)
- [ ] Wait for deployment to complete
- [ ] Generate domain (Settings → Networking → "Generate Domain")
- [ ] **Save backend URL**: `_________________________________`
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Link project: `railway link`
- [ ] Run migrations: `railway run npm run prisma:migrate:deploy`
- [ ] Seed database: `railway run npm run prisma:seed`
- [ ] Test backend: Visit your backend URL

---

## 🎨 Part 2: Vercel (Frontend) - 5 minutes

### Setup (2 min)
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Add New..." → "Project"
- [ ] Import: `pravin-4620/Connect`
- [ ] Set root directory: `frontend`

### Configure (2 min)
- [ ] Framework: Vite (auto-detected)
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Add environment variables:
  - [ ] `VITE_API_URL`: `https://YOUR-RAILWAY-URL/api`
  - [ ] `VITE_SOCKET_URL`: `https://YOUR-RAILWAY-URL`

### Deploy (1 min)
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] **Save frontend URL**: `_________________________________`

---

## 🔄 Part 3: Connect Frontend & Backend - 2 minutes

- [ ] Go back to Railway
- [ ] Update `FRONTEND_URL` to your Vercel URL
- [ ] Wait for automatic redeployment

---

## ✅ Part 4: Test - 3 minutes

- [ ] Visit your Vercel URL
- [ ] Login with:
  - Email: `admin@campusconnect.com`
  - Password: `admin123`
- [ ] Test dashboard
- [ ] Test navigation
- [ ] Test theme switching
- [ ] Test chat/messaging
- [ ] **Change admin password immediately!**

---

## 📊 Your Deployment Info

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | https://________________ | Your Vercel URL |
| **Backend** | https://________________ | Your Railway URL |
| **Database** | Railway Dashboard | PostgreSQL |

---

## 🎯 Quick Commands

### Railway CLI
```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run npm run prisma:migrate:deploy

# Seed database
railway run npm run prisma:seed

# View logs
railway logs

# Open dashboard
railway open
```

---

## 🐛 Common Issues

### Backend won't start
→ Check Railway logs, verify environment variables

### Frontend can't connect
→ Verify `VITE_API_URL` matches Railway URL
→ Verify `FRONTEND_URL` in Railway matches Vercel URL

### Database connection failed
→ Ensure `DATABASE_URL` is set as reference to PostgreSQL
→ Run migrations: `railway run npm run prisma:migrate:deploy`

### WebSocket not working
→ Check `VITE_SOCKET_URL` points to Railway backend
→ Check browser console for errors

---

## 💰 Cost

- **Railway**: $5/month (Hobby plan) or $0 (free tier with $5 credit)
- **Vercel**: $0 (free tier is perfect)
- **Total**: $0-5/month

---

## 🎉 Done!

Once all checkboxes are complete, your app is live! 🚀

**Read full guide**: `RAILWAY_VERCEL_DEPLOYMENT.md`
