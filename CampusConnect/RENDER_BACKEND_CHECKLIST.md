# ✅ Render Backend Deployment - Quick Checklist

## ⏱️ Total Time: ~15-20 minutes

---

## 📋 Step 1: Database Setup (5 min)

### Neon (Recommended)
- [ ] Go to [neon.tech](https://neon.tech)
- [ ] Sign up / Login
- [ ] Create project: "CampusConnect"
- [ ] Copy connection string
- [ ] **Save it**: `postgresql://user:pass@host/db?sslmode=require`

### OR Supabase
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create project: "CampusConnect"
- [ ] Go to Settings → Database
- [ ] Copy URI connection string
- [ ] Replace `[YOUR-PASSWORD]` with actual password
- [ ] **Save it**

---

## 🔧 Step 2: Render Setup (10 min)

### Create Service
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect repository: `pravin-4620/Connect`

### Configure Service
- [ ] **Name**: `campusconnect-backend`
- [ ] **Region**: Oregon / Singapore
- [ ] **Branch**: `main`
- [ ] **Root Directory**: `backend` ⚠️ IMPORTANT
- [ ] **Runtime**: Node
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`
- [ ] **Instance Type**: Free

### Add Environment Variables
- [ ] `DATABASE_URL` = `<your-neon-or-supabase-connection-string>`
- [ ] `JWT_SECRET` = `17d9eda7393674b445f7a959dbfdd222dd9f4a0d153f49cd82d92fa27e087dcd`
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `FRONTEND_URL` = `http://localhost:3000`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5001`

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait 3-5 minutes for deployment
- [ ] Check logs for success

---

## 🔄 Step 3: Database Migrations (5 min)

### Run in Render Shell
- [ ] Go to "Shell" tab in Render
- [ ] Run: `npm run prisma:migrate:deploy`
- [ ] Wait for success message
- [ ] Run: `npm run prisma:seed`
- [ ] Verify admin user created

---

## ✅ Step 4: Test Backend

- [ ] Copy your Render URL: `https://____________.onrender.com`
- [ ] Visit URL in browser
- [ ] Should see: `{"message":"CampusConnect API Server",...}`
- [ ] Test API: `https://your-url.onrender.com/api`

---

## 📊 Save This Info

| Item | Value |
|------|-------|
| Backend URL | https://_________________ |
| Database | Neon/Supabase |
| Admin Email | admin@campusconnect.com |
| Admin Password | admin123 |

---

## 🐛 Common Issues

### Build Fails
→ Check "Root Directory" is set to `backend`
→ Verify build command is correct
→ Check logs for specific errors

### Database Connection Error
→ Verify `DATABASE_URL` is correct
→ Ensure connection string includes `?sslmode=require` (Neon)
→ Check database is active in Neon/Supabase

### Migrations Fail
→ Run in Shell: `npx prisma migrate reset --force`
→ Then: `npm run prisma:migrate:deploy`
→ Then: `npm run prisma:seed`

### Service Crashes
→ Check "Logs" tab for errors
→ Verify all environment variables are set
→ Ensure `PORT` is set to `5001`

---

## 💰 Cost

- **Render Free**: $0 (sleeps after 15min)
- **Render Starter**: $7/month (no sleep)
- **Neon Free**: $0
- **Total**: **$0-7/month**

---

## 🎯 Success Criteria

✅ Deployment shows "Live"
✅ Health check returns JSON
✅ No errors in logs
✅ Database connected
✅ Migrations completed
✅ Admin user seeded

---

## 📝 Next Steps

After backend is deployed:
1. Save your backend URL
2. Deploy frontend to Vercel
3. Update `FRONTEND_URL` in Render
4. Test full application

---

**Read full guide**: `RENDER_BACKEND_DEPLOYMENT.md`
