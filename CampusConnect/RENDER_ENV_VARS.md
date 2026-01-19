# Render Environment Variables - COPY THESE TO RENDER

## 🚨 IMPORTANT: Add these to your Render Backend Service

Go to: **Render Dashboard → Your Backend Service → Environment Tab**

---

## Required Environment Variables

```bash
# Database
DATABASE_URL=<your-render-postgres-url>

# JWT
JWT_SECRET=campusconnect-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRES_IN=7d

# Server
FRONTEND_URL=https://your-vercel-frontend.vercel.app
PORT=5001
NODE_ENV=production

# Cloudinary (File Storage) ✅ CONFIGURED
CLOUDINARY_CLOUD_NAME=dijs7xrxg
CLOUDINARY_API_KEY=232911297951147
CLOUDINARY_API_SECRET=9ai4wrK1-vfEdFJPAn-iv1qa8qk

# Gmail OAuth (Optional)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=https://your-backend.onrender.com/api/auth/gmail-callback

# OpenAI (Optional)
OPENAI_API_KEY=
```

---

## 📋 Steps to Add to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service** (e.g., "campusconnect-backend")
3. **Click "Environment" tab** (left sidebar)
4. **Click "Add Environment Variable"**
5. **Copy-paste each variable** from above
6. **Click "Save Changes"**
7. **Render will automatically redeploy** (takes ~2 minutes)

---

## ✅ Cloudinary is Now Configured!

Your credentials are set up for:
- **Cloud Name**: dijs7xrxg
- **API Key**: 232911297951147
- **API Secret**: 9ai4wrK1-vfEdFJPAn-iv1qa8qk

**All file uploads will now persist in the cloud!** 🎉

---

## 🧪 Test It

1. **Upload a profile picture** in your app
2. **Check Cloudinary Dashboard**: https://console.cloudinary.com/
3. **Go to Media Library** → You should see your uploaded file!
4. **Restart the server** → File is still there! ✅

---

## 🔒 Security Note

⚠️ **NEVER commit `.env` file to Git!**

The `.env` file is already in `.gitignore`, so your secrets are safe.
Only add these values to:
- Local `.env` file (for development)
- Render Environment Variables (for production)
