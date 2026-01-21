# GitHub Actions Keep-Alive Setup

## Overview
This setup prevents the Render backend from sleeping by pinging it every 5 minutes using GitHub Actions.

## How It Works
- GitHub Actions runs a scheduled workflow every 5 minutes
- The workflow sends a GET request to your Render backend
- This keeps Render awake and prevents cold starts
- **Completely FREE** - no external services needed

## Setup Instructions

### 1. Add Backend URL Secret to GitHub
1. Go to your GitHub repository: https://github.com/pravin-4620/Connect
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://campusconnect-backend-xang.onrender.com`
5. Click **Add secret**

### 2. Enable GitHub Actions (if not already enabled)
1. Go to your repository → **Actions** tab
2. If prompted, click **I understand my workflows, go ahead and enable them**
3. The workflow will start running automatically

### 3. Verify It's Working
1. Go to **Actions** tab in your GitHub repository
2. You should see "Keep Render Backend Awake" workflow
3. Click on it to see execution logs
4. It will run every 5 minutes automatically

## Monitoring
- Check the **Actions** tab to see workflow runs
- Each run shows:
  - ✅ Success: Backend responded with 200
  - ⚠️ Warning: Backend returned different status code
- Logs show timestamp and response code

## Manual Trigger
You can manually trigger the workflow:
1. Go to **Actions** → **Keep Render Backend Awake**
2. Click **Run workflow** → **Run workflow**

## Benefits
✅ **Completely Free** - No paid plans required  
✅ **Reliable** - GitHub Actions has 99.9% uptime  
✅ **Integrated** - Works directly from your repository  
✅ **No External Dependencies** - No third-party services  
✅ **Easy Monitoring** - View logs in GitHub Actions tab  

## Troubleshooting

### Workflow not running?
- Check if Actions are enabled in repository settings
- Verify the workflow file is in `.github/workflows/keep-alive.yml`
- Check if you have the correct permissions

### Backend still sleeping?
- Verify `BACKEND_URL` secret is set correctly
- Check workflow logs for errors
- Render free tier may still have brief cold starts on first request

## Alternative: Increase Ping Frequency
To ping more frequently (e.g., every 3 minutes), edit `.github/workflows/keep-alive.yml`:
```yaml
schedule:
  - cron: '*/3 * * * *'  # Every 3 minutes
```

## Notes
- Render free tier sleeps after 15 minutes of inactivity
- This workflow pings every 5 minutes to prevent sleep
- First request after deployment may still be slow (initial cold start)
- GitHub Actions has a limit of 2,000 minutes/month on free tier (this uses ~1 minute/day)
