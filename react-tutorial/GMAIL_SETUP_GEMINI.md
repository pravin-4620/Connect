# 🚀 Link Your Gmail Account - Complete Guide (Gemini AI)

## Overview
This guide will help you connect YOUR Gmail account to CampusConnect and use **FREE Google Gemini AI** to automatically categorize your emails.

**Time Required**: 30-45 minutes  
**Cost**: FREE (Gemini AI has free tier)  
**Difficulty**: Easy (step-by-step with copy-paste commands)

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Your Gmail account credentials
- [ ] Google account access (for Google Cloud Console)
- [ ] Terminal/Command line access
- [ ] Node.js installed (check with `node --version`)

---

## STEP 1: Create Google Cloud Project (10 minutes)

### 1.1 Go to Google Cloud Console
1. Open your browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account (use the same account as your Gmail)

### 1.2 Create a New Project
1. Click the **project dropdown** at the top (says "Select a project")
2. Click "**NEW PROJECT**" button (top right)
3. Enter project details:
   - **Project name**: `CampusConnect-Gmail`
   - **Organization**: Leave as default
4. Click "**CREATE**"
5. Wait 10-20 seconds for project to be created
6. Make sure your new project is selected in the dropdown

### 1.3 Enable Gmail API
1. In the left sidebar, click "**APIs & Services**" → "**Library**"
2. In the search box, type: `Gmail API`
3. Click on "**Gmail API**" from results
4. Click the blue "**ENABLE**" button
5. Wait for it to enable (5-10 seconds)

### 1.4 Create OAuth2 Credentials
1. Go to "**APIs & Services**" → "**Credentials**" (left sidebar)
2. Click "**+ CREATE CREDENTIALS**" at the top
3. Select "**OAuth client ID**"

### 1.5 Configure OAuth Consent Screen (if prompted)
If asked to configure consent screen:
1. Click "**CONFIGURE CONSENT SCREEN**"
2. Choose "**External**" (unless you have Google Workspace)
3. Click "**CREATE**"
4. Fill in required fields:
   - **App name**: `CampusConnect`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "**SAVE AND CONTINUE**"
6. On "Scopes" page, click "**SAVE AND CONTINUE**"
7. On "Test users" page, click "**+ ADD USERS**"
8. Add your Gmail address
9. Click "**SAVE AND CONTINUE**"
10. Click "**BACK TO DASHBOARD**"

### 1.6 Create OAuth Client ID
1. Go back to "**Credentials**"
2. Click "**+ CREATE CREDENTIALS**" → "**OAuth client ID**"
3. Select "**Web application**"
4. Fill in:
   - **Name**: `CampusConnect Web Client`
   - **Authorized JavaScript origins**: Click "**+ ADD URI**"
     - Add: `http://localhost:3000`
   - **Authorized redirect URIs**: Click "**+ ADD URI**"
     - Add: `http://localhost:3000/oauth2callback`
5. Click "**CREATE**"

### 1.7 Download Credentials
1. A popup will show your **Client ID** and **Client Secret**
2. Click "**DOWNLOAD JSON**" button
3. **IMPORTANT**: Save this file! You'll need it later
4. Or copy these values somewhere safe:
   - **Client ID**: `xxxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxx`

✅ **STEP 1 COMPLETE!** You now have Google OAuth credentials.

---

## STEP 2: Get Gemini API Key (5 minutes)

### 2.1 Go to Google AI Studio
1. Open: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account

### 2.2 Create API Key
1. Click "**Create API Key**" button
2. Select your project: `CampusConnect-Gmail`
3. Click "**Create API key in existing project**"
4. **COPY YOUR API KEY** - it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXX`
5. Save it somewhere safe!

✅ **STEP 2 COMPLETE!** You have your Gemini API key.

---

## STEP 3: Set Up Backend Server (10 minutes)

### 3.1 Navigate to Backend Folder
Open your terminal and run:
```bash
cd /Users/pravin/Documents/React/react-tutorial/campus-connect-backend
```

### 3.2 Initialize Backend (if not already done)
Check if `package.json` exists:
```bash
ls package.json
```

If you see "No such file", run:
```bash
npm init -y
```

### 3.3 Install Required Packages
```bash
npm install express googleapis cors dotenv @google/generative-ai
```

This will install:
- `express` - Web server
- `googleapis` - Gmail API client
- `cors` - Allow frontend to connect
- `dotenv` - Environment variables
- `@google/generative-ai` - Gemini AI

Wait for installation to complete (30-60 seconds).

### 3.4 Create Environment File
Create a `.env` file with your credentials:
```bash
touch .env
```

Now open `.env` in a text editor and add:
```env
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# Gemini AI API Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Server Port
PORT=5001
```

**IMPORTANT**: Replace the placeholder values:
- `YOUR_CLIENT_ID_HERE` → Paste your Client ID from Step 1.7
- `YOUR_CLIENT_SECRET_HERE` → Paste your Client Secret from Step 1.7
- `YOUR_GEMINI_API_KEY_HERE` → Paste your Gemini API key from Step 2.2

Example:
```env
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcd1234efgh5678
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
PORT=5001
```

### 3.5 Create Folder Structure
```bash
mkdir -p services routes
```

✅ **STEP 3 COMPLETE!** Backend environment is ready.

---

## STEP 4: Create Gmail Service (5 minutes)

### 4.1 Create Gmail Service File
```bash
touch services/gmailService.js
```

### 4.2 Copy This Code
Open `services/gmailService.js` and paste:

```javascript
const { google } = require('googleapis');

class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate OAuth URL
  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
    });
  }

  // Exchange code for tokens
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set credentials
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Fetch emails
  async fetchEmails(maxResults = 50) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: maxResults,
    });

    const messages = response.data.messages || [];
    const emailPromises = messages.map(msg => this.getEmailDetails(gmail, msg.id));
    return Promise.all(emailPromises);
  }

  // Get email details
  async getEmailDetails(gmail, messageId) {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const headers = response.data.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    return {
      id: response.data.id,
      threadId: response.data.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      snippet: response.data.snippet,
      body: this.getEmailBody(response.data.payload),
      labelIds: response.data.labelIds || [],
      unread: response.data.labelIds?.includes('UNREAD') || false,
      important: response.data.labelIds?.includes('IMPORTANT') || false
    };
  }

  // Extract email body
  getEmailBody(payload) {
    let body = '';
    
    if (payload.parts) {
      const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (payload.body.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    
    return body;
  }

  // Mark as read
  async markAsRead(messageId) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    return gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }

  // Star email
  async starEmail(messageId) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    return gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: ['STARRED']
      }
    });
  }
}

module.exports = new GmailService();
```

Save the file.

✅ **STEP 4 COMPLETE!** Gmail service is ready.

---

## STEP 5: Create Gemini AI Service (5 minutes)

### 5.1 Create AI Service File
```bash
touch services/aiCategorizationService.js
```

### 5.2 Copy This Code
Open `services/aiCategorizationService.js` and paste:

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function categorizeEmail(subject, body, from) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this email and categorize it into ONE of these categories:
- Academic (assignments, grades, courses, professors, exams)
- Career (placements, internships, jobs, recruitment, resume)
- Events (workshops, seminars, competitions, meetups, hackathons)
- Administrative (library, fees, documents, official notices)
- Personal (newsletters, social, personal correspondence)

Email Details:
From: ${from}
Subject: ${subject}
Body: ${body.substring(0, 500)}

Respond ONLY with valid JSON in this exact format:
{
  "category": "category_name",
  "confidence": 0.95,
  "labels": ["label1", "label2"],
  "reason": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI categorization error:', error);
    // Fallback to default
    return {
      category: 'Personal',
      confidence: 0.5,
      labels: ['Uncategorized'],
      reason: 'Categorization failed'
    };
  }
}

async function categorizeBatch(emails) {
  const results = await Promise.all(
    emails.map(email => 
      categorizeEmail(email.subject, email.body, email.from)
    )
  );
  
  return emails.map((email, idx) => ({
    ...email,
    category: results[idx].category,
    aiConfidence: results[idx].confidence,
    labels: results[idx].labels || [],
    aiReason: results[idx].reason,
    timestamp: new Date(email.date),
    time: formatTime(new Date(email.date)),
    fromName: extractName(email.from)
  }));
}

function extractName(from) {
  const match = from.match(/^"?([^"<]+)"?\s*<?/);
  return match ? match[1].trim() : from;
}

function formatTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
}

module.exports = { categorizeEmail, categorizeBatch };
```

Save the file.

✅ **STEP 5 COMPLETE!** Gemini AI service is ready.

---

## STEP 6: Create API Routes (3 minutes)

### 6.1 Create Routes File
```bash
touch routes/gmail.js
```

### 6.2 Copy This Code
Open `routes/gmail.js` and paste:

```javascript
const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmailService');
const { categorizeBatch } = require('../services/aiCategorizationService');

// Get OAuth URL
router.get('/auth-url', (req, res) => {
  try {
    const url = gmailService.getAuthUrl();
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth callback
router.post('/oauth-callback', async (req, res) => {
  try {
    const { code } = req.body;
    const tokens = await gmailService.getTokens(code);
    res.json({ success: true, tokens });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch and categorize emails
router.post('/fetch-emails', async (req, res) => {
  try {
    const { tokens } = req.body;
    gmailService.setCredentials(tokens);
    
    console.log('Fetching emails...');
    const emails = await gmailService.fetchEmails(50);
    
    console.log(`Fetched ${emails.length} emails, categorizing with Gemini AI...`);
    const categorizedEmails = await categorizeBatch(emails);
    
    console.log('Emails categorized successfully!');
    res.json({ emails: categorizedEmails });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.post('/mark-read', async (req, res) => {
  try {
    const { tokens, messageId } = req.body;
    gmailService.setCredentials(tokens);
    await gmailService.markAsRead(messageId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Star email
router.post('/star', async (req, res) => {
  try {
    const { tokens, messageId } = req.body;
    gmailService.setCredentials(tokens);
    await gmailService.starEmail(messageId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

Save the file.

✅ **STEP 6 COMPLETE!** API routes are ready.

---

## STEP 7: Create Main Server (2 minutes)

### 7.1 Create Server File
```bash
touch server.js
```

### 7.2 Copy This Code
Open `server.js` and paste:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gmailRoutes = require('./routes/gmail');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/gmail', gmailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CampusConnect Gmail Backend is running!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📧 Gmail API ready`);
  console.log(`🤖 Gemini AI ready`);
});
```

Save the file.

✅ **STEP 7 COMPLETE!** Backend server is ready.

---

## STEP 8: Update Frontend (5 minutes)

### 8.1 Create API Service
Navigate back to React app:
```bash
cd /Users/pravin/Documents/React/react-tutorial
mkdir -p src/services
touch src/services/gmailApi.js
```

### 8.2 Copy This Code
Open `src/services/gmailApi.js` and paste:

```javascript
const API_BASE_URL = 'http://localhost:5001/api/gmail';

export const gmailApi = {
  // Get OAuth URL
  async getAuthUrl() {
    const response = await fetch(`${API_BASE_URL}/auth-url`);
    return response.json();
  },

  // Handle OAuth callback
  async handleOAuthCallback(code) {
    const response = await fetch(`${API_BASE_URL}/oauth-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return response.json();
  },

  // Fetch and categorize emails
  async fetchEmails(tokens) {
    const response = await fetch(`${API_BASE_URL}/fetch-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens })
    });
    return response.json();
  },

  // Mark as read
  async markAsRead(tokens, messageId) {
    const response = await fetch(`${API_BASE_URL}/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, messageId })
    });
    return response.json();
  },

  // Star email
  async starEmail(tokens, messageId) {
    const response = await fetch(`${API_BASE_URL}/star`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, messageId })
    });
    return response.json();
  }
};
```

Save the file.

✅ **STEP 8 COMPLETE!** Frontend API is ready.

---

## STEP 9: Update StudentDashboard Connection (Ready!)

The `connectGmail()` function in your StudentDashboard needs to be updated to use real API. I'll create this file for you to replace.

---

## STEP 10: Test Everything! (5 minutes)

### 10.1 Start Backend Server
Open a NEW terminal window:
```bash
cd /Users/pravin/Documents/React/react-tutorial/campus-connect-backend
node server.js
```

You should see:
```
✅ Server running on http://localhost:5001
📧 Gmail API ready
🤖 Gemini AI ready
```

### 10.2 Keep React App Running
Your React app should already be running on `http://localhost:3000`

### 10.3 Test Gmail Connection
1. Go to: `http://localhost:3000`
2. Login as **Student**
3. Click "**Mails**" tab
4. Click "**Connect Gmail Account**"
5. You'll be redirected to Google OAuth
6. Sign in with your Gmail
7. Authorize the app
8. You'll be redirected back
9. Your emails will be fetched and categorized by Gemini AI!

---

## 🎉 SUCCESS CHECKLIST

- [ ] Google Cloud project created
- [ ] Gmail API enabled
- [ ] OAuth credentials created and saved
- [ ] Gemini API key obtained
- [ ] Backend packages installed
- [ ] `.env` file created with all credentials
- [ ] All service files created
- [ ] Backend server starts without errors
- [ ] React app running
- [ ] Can connect Gmail account
- [ ] Emails are fetched
- [ ] Emails are categorized by AI
- [ ] Can filter by category
- [ ] Can read emails
- [ ] Can star emails

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Fix**: In Google Cloud Console:
1. Go to Credentials → OAuth client ID
2. Add: `http://localhost:3000/oauth2callback` to Authorized redirect URIs
3. Save and try again

### Error: "Invalid API key"
**Fix**: Check your `.env` file:
- Make sure `GEMINI_API_KEY` is correct
- No extra spaces
- No quotes around the value

### Error: "Cannot connect to server"
**Fix**: Make sure backend is running:
```bash
cd campus-connect-backend
node server.js
```

### Error: "CORS error"
**Fix**: Backend should have `cors` installed and configured
```bash
npm install cors
```

---

## 📝 Summary

You've successfully:
1. ✅ Created Google Cloud project
2. ✅ Enabled Gmail API
3. ✅ Got OAuth2 credentials
4. ✅ Got Gemini API key (FREE!)
5. ✅ Set up backend server
6. ✅ Connected Gmail API
7. ✅ Integrated Gemini AI for categorization
8. ✅ Updated frontend

**Your Gmail is now linked and AI-categorized!** 🎉

---

## 🚀 Next Steps

After successful connection:
- Your real Gmail emails will appear in the app
- Gemini AI will categorize them automatically
- You can filter by category
- You can search emails
- You can star/unstar
- You can mark as read/unread

**Enjoy your AI-powered campus email system!** ✨
