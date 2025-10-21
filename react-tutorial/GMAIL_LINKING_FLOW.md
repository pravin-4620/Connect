# 📧 Gmail + Gemini AI Setup - Visual Flow

## 🎯 Complete Process Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GMAIL LINKING PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: Google Cloud Setup (15 min)
┌─────────────────────────────────────────────────────────────┐
│  1. Go to console.cloud.google.com                          │
│  2. Create project: "CampusConnect-Gmail"                   │
│  3. Enable Gmail API                                        │
│  4. Configure OAuth consent screen                          │
│  5. Create OAuth credentials                                │
│  6. Download Client ID + Secret                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
PHASE 2: Gemini AI Setup (5 min)
┌─────────────────────────────────────────────────────────────┐
│  1. Go to makersuite.google.com/app/apikey                  │
│  2. Create API key for CampusConnect project                │
│  3. Copy Gemini API key                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
PHASE 3: Backend Setup (20 min)
┌─────────────────────────────────────────────────────────────┐
│  1. Navigate to campus-connect-backend/                     │
│  2. Install packages (express, googleapis, etc.)            │
│  3. Create .env with all credentials                        │
│  4. Create services/gmailService.js                         │
│  5. Create services/aiCategorizationService.js              │
│  6. Create routes/gmail.js                                  │
│  7. Create server.js                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
PHASE 4: Frontend Setup (5 min)
┌─────────────────────────────────────────────────────────────┐
│  1. Create src/services/gmailApi.js                         │
│  2. Update StudentDashboard connectGmail()                  │
│  3. Test connection flow                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
PHASE 5: Test & Enjoy! (5 min)
┌─────────────────────────────────────────────────────────────┐
│  1. Start backend: node server.js                           │
│  2. Start frontend: npm start                               │
│  3. Click "Connect Gmail"                                   │
│  4. Authorize with Google                                   │
│  5. See your emails categorized by AI!                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐
│   Student   │
│  Dashboard  │
└──────┬──────┘
       │ 1. Click "Connect Gmail"
       ↓
┌─────────────────────┐
│  Frontend (React)   │
│  - gmailApi.js      │
└──────┬──────────────┘
       │ 2. Request OAuth URL
       ↓
┌─────────────────────┐
│  Backend (Express)  │
│  - routes/gmail.js  │
└──────┬──────────────┘
       │ 3. Generate OAuth URL
       ↓
┌─────────────────────┐
│  Gmail Service      │
│  - gmailService.js  │
└──────┬──────────────┘
       │ 4. Return OAuth URL
       ↓
┌─────────────────────┐
│  Google OAuth       │
│  (User authorizes)  │
└──────┬──────────────┘
       │ 5. Redirect with code
       ↓
┌─────────────────────┐
│  Frontend catches   │
│  OAuth callback     │
└──────┬──────────────┘
       │ 6. Send code to backend
       ↓
┌─────────────────────┐
│  Backend exchanges  │
│  code for tokens    │
└──────┬──────────────┘
       │ 7. Return tokens
       ↓
┌─────────────────────┐
│  Frontend stores    │
│  tokens & fetches   │
│  emails             │
└──────┬──────────────┘
       │ 8. Request emails with tokens
       ↓
┌─────────────────────┐
│  Gmail API          │
│  (Fetch 50 emails)  │
└──────┬──────────────┘
       │ 9. Return email data
       ↓
┌─────────────────────┐
│  Gemini AI          │
│  (Categorize each)  │
└──────┬──────────────┘
       │ 10. Return categories
       ↓
┌─────────────────────┐
│  Frontend displays  │
│  categorized emails │
└─────────────────────┘
```

---

## 📁 File Structure After Setup

```
react-tutorial/
│
├── campus-connect-backend/
│   ├── .env                        ← Your credentials (NEVER commit!)
│   ├── package.json
│   ├── server.js                   ← Main server
│   ├── services/
│   │   ├── gmailService.js         ← Gmail API logic
│   │   └── aiCategorizationService.js  ← Gemini AI logic
│   └── routes/
│       └── gmail.js                ← API endpoints
│
├── src/
│   ├── StudentDashboard.js         ← Already has UI
│   └── services/
│       └── gmailApi.js             ← New API client
│
└── GMAIL_SETUP_GEMINI.md          ← This guide!
```

---

## 🔑 Credentials You'll Need

```
┌────────────────────────────────────────────────────────┐
│  FROM GOOGLE CLOUD CONSOLE:                            │
│  ✓ Client ID: [long-id].apps.googleusercontent.com    │
│  ✓ Client Secret: GOCSPX-[random-string]              │
│                                                        │
│  FROM GOOGLE AI STUDIO:                                │
│  ✓ Gemini API Key: AIzaSy[random-string]              │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Commands Reference

### Start Backend
```bash
cd /Users/pravin/Documents/React/react-tutorial/campus-connect-backend
node server.js
```

### Start Frontend (separate terminal)
```bash
cd /Users/pravin/Documents/React/react-tutorial
npm start
```

### Check Backend Health
```bash
curl http://localhost:5001/health
```

### Install Backend Dependencies
```bash
cd campus-connect-backend
npm install express googleapis cors dotenv @google/generative-ai
```

---

## 🎯 What Each Component Does

### Gmail Service (`gmailService.js`)
```
Purpose: Talk to Gmail API
Actions:
- Generate OAuth URL for user authorization
- Exchange OAuth code for access tokens
- Fetch emails from user's Gmail
- Mark emails as read
- Star/unstar emails
- Extract email body from complex formats
```

### Gemini AI Service (`aiCategorizationService.js`)
```
Purpose: Categorize emails using AI
Actions:
- Send email (subject + body + sender) to Gemini
- Get category (Academic/Career/Events/Admin/Personal)
- Get confidence score (0-1)
- Get smart labels (tags like "Placement", "Assignment")
- Format timestamps ("2h ago", "3d ago")
```

### API Routes (`routes/gmail.js`)
```
Purpose: Connect frontend to backend
Endpoints:
- GET  /api/gmail/auth-url        → Get OAuth URL
- POST /api/gmail/oauth-callback  → Exchange code for tokens
- POST /api/gmail/fetch-emails    → Get & categorize emails
- POST /api/gmail/mark-read       → Mark email as read
- POST /api/gmail/star            → Star/unstar email
```

### Frontend API (`gmailApi.js`)
```
Purpose: Call backend from React
Functions:
- getAuthUrl()              → Start OAuth flow
- handleOAuthCallback()     → Complete OAuth
- fetchEmails()             → Get categorized emails
- markAsRead()              → Update email status
- starEmail()               → Toggle star
```

---

## 🔒 Security Notes

### ✅ Safe
- OAuth2 tokens stored in localStorage (development)
- Backend validates all requests
- CORS enabled only for localhost:3000
- Gemini API key in backend (not exposed)

### 🔐 For Production
- Use httpOnly cookies for tokens
- Add token refresh logic
- Use environment-specific URLs
- Enable rate limiting
- Add request validation
- Use HTTPS only
- Implement session management

---

## 💡 Tips & Tricks

### Tip 1: Test Each Phase
Don't wait until the end! Test after each phase:
- After Step 3: Check if `.env` file has all values
- After Step 7: Run `node server.js` and check for errors
- After Step 8: Check if `gmailApi.js` exists

### Tip 2: Use Console Logs
The backend has helpful logs:
```
✅ Server running on http://localhost:5001
📧 Gmail API ready
🤖 Gemini AI ready
Fetching emails...
Fetched 50 emails, categorizing with Gemini AI...
Emails categorized successfully!
```

### Tip 3: Check Gemini Free Limits
Free tier limits:
- 60 requests per minute
- Enough for 50 emails every minute
- More than sufficient for testing

### Tip 4: Test with Small Batch First
Modify `fetchEmails()` to get fewer emails for testing:
```javascript
const emails = await gmailService.fetchEmails(10); // Start with 10
```

---

## 🎉 Expected Results

After successful setup:

### Before Connection:
```
🔓 Not Connected
[Beautiful connection screen]
[Connect Gmail Account button]
```

### After Connection:
```
✅ Connected to: your.email@gmail.com
📧 50 emails fetched
🤖 All emails categorized by Gemini AI

Sidebar shows:
- 📥 All Mail (50)
- ✉️ Unread (12)
- ⭐ Important (8)
- 📚 Academic (15)
- 💼 Career (7)
- 🎉 Events (18)
- 📋 Administrative (6)
- 📰 Personal (4)
```

---

## 📞 Need Help?

### Step-by-Step Help:
1. Read: `GMAIL_SETUP_GEMINI.md` (complete guide)
2. Check: Backend server is running (port 5001)
3. Check: Frontend is running (port 3000)
4. Check: `.env` has all credentials (no typos!)
5. Check: OAuth redirect URI matches exactly
6. Check: Browser console for errors (F12)
7. Check: Backend terminal for errors

### Common Issues:
- **"redirect_uri_mismatch"** → Fix OAuth URIs in Google Console
- **"Invalid API key"** → Check Gemini API key in `.env`
- **"Cannot connect"** → Backend not running on port 5001
- **"CORS error"** → Install `cors` package in backend

---

## 🚀 You're Ready!

Follow `GMAIL_SETUP_GEMINI.md` step by step, and you'll have your Gmail linked with AI categorization in **30-45 minutes**!

**Start here**: Step 1 - Create Google Cloud Project

Good luck! 🎉
