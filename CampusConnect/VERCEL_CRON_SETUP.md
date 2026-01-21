# Vercel Cron Keep-Alive Setup

## Overview
This setup prevents the Render backend from sleeping by pinging it every 5 minutes using Vercel Cron Jobs.

## Files Created
1. **`frontend/api/keep-alive.ts`** - Serverless function that pings the backend
2. **`frontend/vercel.json`** - Updated with cron configuration

## Setup Instructions

### 1. Add Environment Variable to Vercel
Go to your Vercel project settings and add:
- **Name**: `CRON_SECRET`
- **Value**: Generate a random secret (e.g., use `openssl rand -base64 32`)

### 2. Deploy to Vercel
```bash
cd frontend
vercel --prod
```

### 3. Verify Cron Job
- Go to Vercel Dashboard → Your Project → Cron Jobs
- You should see: `/api/keep-alive` running every 5 minutes
- Check logs to confirm it's working

## How It Works
- Vercel triggers `/api/keep-alive` every 5 minutes
- The function pings your Render backend at the root endpoint
- This keeps Render awake and prevents cold starts

## Security
- The cron endpoint is protected with `CRON_SECRET`
- Only requests with the correct Authorization header will succeed

## Monitoring
Check Vercel Function logs to see ping results:
```
[timestamp] Backend ping successful: { status: 'running' }
```

## Alternative: UptimeRobot
If you prefer a third-party service:
1. Sign up at https://uptimerobot.com (free)
2. Add your Render backend URL
3. Set check interval to 5 minutes

## Notes
- Render free tier sleeps after 15 minutes of inactivity
- This cron job pings every 5 minutes to prevent sleep
- First request after deployment may still be slow (cold start)
