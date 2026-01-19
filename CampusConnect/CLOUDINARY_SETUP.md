# Cloudinary Setup Guide for CampusConnect

## Why Cloudinary?

We've switched from local file storage to **Cloudinary** because:
- ✅ **Persistent Storage**: Files don't disappear when server restarts
- ✅ **Free Tier**: 25GB storage + 25GB bandwidth/month
- ✅ **CDN**: Fast image delivery worldwide
- ✅ **Automatic Optimization**: Images are automatically optimized
- ✅ **Works on Render/Vercel**: No filesystem issues

---

## Setup Instructions (5 minutes)

### 1. Create Free Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with your email
3. Verify your email

### 2. Get Your Credentials

After logging in:
1. Go to **Dashboard** (https://console.cloudinary.com/)
2. You'll see:
   - **Cloud Name**: (e.g., `dxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (click "👁️ Show" to reveal)

### 3. Update Environment Variables

#### **Local Development** (`backend/.env`):
```bash
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
```

#### **Render (Production)**:
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add these variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
5. Click **Save Changes**
6. Render will automatically redeploy

---

## What Changed?

### Before (Local Storage - ❌ BAD):
```
uploads/
  ├── 1234567890-profile.jpg  ← Disappears on restart!
  └── 9876543210-resume.pdf   ← Lost forever!
```

### After (Cloudinary - ✅ GOOD):
```
https://res.cloudinary.com/your-cloud/image/upload/v1234/campusconnect/profile.jpg
```
- ✅ Permanent URL
- ✅ Always accessible
- ✅ Backed up automatically
- ✅ Fast CDN delivery

---

## Testing

1. **Set up Cloudinary credentials** (see above)
2. **Restart your backend**:
   ```bash
   cd backend
   npm run dev
   ```
3. **Upload a profile picture** in the app
4. **Check Cloudinary Dashboard** → Media Library
5. You should see your uploaded file!

---

## Troubleshooting

### Error: "Upload failed"
- ✅ Check that all 3 Cloudinary env vars are set
- ✅ Restart the backend server
- ✅ Check Cloudinary dashboard for API usage

### Files still disappearing?
- ✅ Make sure you updated **Render environment variables** (not just local .env)
- ✅ Redeploy on Render after adding env vars

---

## Free Tier Limits

Cloudinary Free Plan:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

This is **more than enough** for a campus app with hundreds of users!

---

## Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Add credentials to `.env`
3. ✅ Add credentials to Render
4. ✅ Test file upload
5. ✅ Celebrate! 🎉

**Your files will now persist forever!**
