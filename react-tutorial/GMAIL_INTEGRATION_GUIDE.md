# Gmail Integration with AI Email Categorization - Implementation Guide

## Overview
This guide explains how to connect the CampusConnect mail tab to your actual Gmail account using Gmail API and implement AI-powered email categorization.

## Current Implementation
✅ **Already Implemented:**
- Beautiful UI with Gmail-like interface
- Category sidebar (All Mail, Unread, Important, + AI Categories)
- Email list view with search
- Email detail view with reply/forward
- Mark as read/unread functionality
- Star/important functionality
- Mock data with 8 sample categorized emails
- AI confidence scores display
- Smart labels and tags

## Step 1: Set Up Gmail API

### 1.1 Create Google Cloud Project
```bash
1. Go to: https://console.cloud.google.com/
2. Create a new project: "CampusConnect-Gmail"
3. Enable Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"
```

### 1.2 Configure OAuth2 Credentials
```bash
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - http://localhost:3000 (for development)
   - https://your-production-domain.com (for production)
5. Add authorized redirect URIs:
   - http://localhost:3000/oauth2callback
   - https://your-production-domain.com/oauth2callback
6. Download the client configuration JSON
```

### 1.3 Install Required Dependencies
```bash
cd /Users/pravin/Documents/React/react-tutorial
npm install @react-oauth/google googleapis axios
```

## Step 2: Backend Setup (Node.js + Express)

### 2.1 Create Backend Server
```bash
cd campus-connect-backend
npm init -y
npm install express googleapis cors dotenv
```

### 2.2 Create `.env` File
```env
# campus-connect-backend/.env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# OpenAI for email categorization (Option 1)
OPENAI_API_KEY=your_openai_key_here

# OR Google Gemini for email categorization (Option 2 - Free Tier)
GEMINI_API_KEY=your_gemini_key_here

PORT=5001
```

### 2.3 Create Gmail Service (`campus-connect-backend/services/gmailService.js`)
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
      q: '' // You can add filters here
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

  // Send email
  async sendEmail(to, subject, body) {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n');
    
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
  }
}

module.exports = new GmailService();
```

## Step 3: AI Categorization Service

### Option 1: Using OpenAI GPT (`campus-connect-backend/services/aiCategorizationService.js`)
```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function categorizeEmail(subject, body, from) {
  const prompt = `Analyze this email and categorize it into ONE of these categories:
- Academic (assignments, grades, courses, professors)
- Career (placements, internships, job opportunities, resume)
- Events (workshops, seminars, competitions, meetups)
- Administrative (library, fees, documents, official notices)
- Personal (newsletters, social, personal correspondence)

Email Details:
From: ${from}
Subject: ${subject}
Body: ${body.substring(0, 500)}

Respond in JSON format:
{
  "category": "category_name",
  "confidence": 0.95,
  "labels": ["label1", "label2"],
  "reason": "brief explanation"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function categorizeBatch(emails) {
  const results = await Promise.all(
    emails.map(email => 
      categorizeEmail(email.subject, email.body, email.from)
        .catch(err => ({
          category: 'Personal',
          confidence: 0.5,
          labels: [],
          reason: 'Categorization failed'
        }))
    )
  );
  
  return emails.map((email, idx) => ({
    ...email,
    category: results[idx].category,
    aiConfidence: results[idx].confidence,
    labels: results[idx].labels,
    aiReason: results[idx].reason
  }));
}

module.exports = { categorizeEmail, categorizeBatch };
```

### Option 2: Using Google Gemini (Free Tier)
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function categorizeEmail(subject, body, from) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Analyze this email and categorize it into ONE of these categories:
- Academic (assignments, grades, courses, professors)
- Career (placements, internships, job opportunities, resume)
- Events (workshops, seminars, competitions, meetups)
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
}

module.exports = { categorizeEmail, categorizeBatch };
```

### Option 3: Rule-Based Categorization (No API Needed)
```javascript
function categorizeEmail(subject, body, from) {
  const text = `${subject} ${body} ${from}`.toLowerCase();
  
  // Academic keywords
  if (/(assignment|exam|grade|course|professor|lecture|class|study|homework)/i.test(text)) {
    return {
      category: 'Academic',
      confidence: 0.85,
      labels: extractLabels(text, ['Assignment', 'Exam', 'Course'])
    };
  }
  
  // Career keywords
  if (/(placement|intern|job|recruit|resume|career|interview|company|hiring)/i.test(text)) {
    return {
      category: 'Career',
      confidence: 0.90,
      labels: extractLabels(text, ['Placement', 'Internship', 'Job'])
    };
  }
  
  // Events keywords
  if (/(workshop|seminar|event|competition|hackathon|meetup|conference|fest)/i.test(text)) {
    return {
      category: 'Events',
      confidence: 0.88,
      labels: extractLabels(text, ['Workshop', 'Competition', 'Fest'])
    };
  }
  
  // Administrative keywords
  if (/(library|fee|document|admin|office|notice|registration|deadline)/i.test(text)) {
    return {
      category: 'Administrative',
      confidence: 0.87,
      labels: extractLabels(text, ['Library', 'Fees', 'Official'])
    };
  }
  
  // Default to Personal
  return {
    category: 'Personal',
    confidence: 0.70,
    labels: ['Other']
  };
}

function extractLabels(text, possibleLabels) {
  return possibleLabels.filter(label => 
    text.toLowerCase().includes(label.toLowerCase())
  );
}

module.exports = { categorizeEmail };
```

## Step 4: Backend API Routes (`campus-connect-backend/routes/gmail.js`)

```javascript
const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmailService');
const { categorizeBatch } = require('../services/aiCategorizationService');

// Get OAuth URL
router.get('/auth-url', (req, res) => {
  const url = gmailService.getAuthUrl();
  res.json({ url });
});

// OAuth callback
router.post('/oauth-callback', async (req, res) => {
  try {
    const { code } = req.body;
    const tokens = await gmailService.getTokens(code);
    // Store tokens securely (use sessions or JWT)
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
    
    const emails = await gmailService.fetchEmails(50);
    const categorizedEmails = await categorizeBatch(emails);
    
    res.json({ emails: categorizedEmails });
  } catch (error) {
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

// Send email
router.post('/send', async (req, res) => {
  try {
    const { tokens, to, subject, body } = req.body;
    gmailService.setCredentials(tokens);
    await gmailService.sendEmail(to, subject, body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Step 5: Backend Server (`campus-connect-backend/server.js`)

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gmailRoutes = require('./routes/gmail');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/gmail', gmailRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 6: Update Frontend to Connect to Backend

### 6.1 Create API Service (`src/services/gmailApi.js`)
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
  },

  // Send email
  async sendEmail(tokens, to, subject, body) {
    const response = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, to, subject, body })
    });
    return response.json();
  }
};
```

### 6.2 Update `connectGmail()` in StudentDashboard.js
```javascript
// Replace the mock connectGmail function with:
import { gmailApi } from './services/gmailApi';

const connectGmail = async () => {
  try {
    setToast('Redirecting to Google OAuth...');
    
    // Get OAuth URL
    const { url } = await gmailApi.getAuthUrl();
    
    // Open OAuth window
    const authWindow = window.open(url, '_blank', 'width=500,height=600');
    
    // Listen for OAuth callback
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
        const { code } = event.data;
        authWindow?.close();
        
        setToast('Authenticating...');
        const { tokens } = await gmailApi.handleOAuthCallback(code);
        
        // Store tokens (use localStorage or context)
        localStorage.setItem('gmail_tokens', JSON.stringify(tokens));
        
        setToast('Fetching and categorizing emails...');
        const { emails } = await gmailApi.fetchEmails(tokens);
        
        setMails(emails);
        setGmailConnected(true);
        setToast('Gmail connected successfully!');
      }
    });
  } catch (error) {
    setToast('Failed to connect Gmail: ' + error.message);
  }
};
```

## Step 7: Testing

### 7.1 Start Backend Server
```bash
cd campus-connect-backend
node server.js
# Server running on port 5001
```

### 7.2 Start React App
```bash
cd /Users/pravin/Documents/React/react-tutorial
npm start
# App running on http://localhost:3000
```

### 7.3 Test Gmail Connection
1. Navigate to student dashboard
2. Click "Mails" tab
3. Click "Connect Gmail Account"
4. Authorize with Google
5. Watch emails get fetched and categorized!

## Step 8: Production Deployment

### Security Considerations:
1. **Never store tokens in localStorage** - Use httpOnly cookies
2. **Implement token refresh** - Gmail tokens expire
3. **Use environment variables** - Never commit secrets
4. **Add rate limiting** - Prevent API abuse
5. **Implement proper error handling**
6. **Add logging and monitoring**

### Recommended Architecture:
```
Frontend (React) → Backend (Express) → Gmail API
                                     → AI Service (OpenAI/Gemini)
                                     → Database (MongoDB/PostgreSQL)
```

## Alternative: Simpler Approach Using Gmail Filters

If you want a simpler implementation without backend:
1. Use Gmail's built-in filters to auto-label emails
2. Fetch emails using Gmail API directly from frontend
3. Use labels as categories
4. No AI needed - relies on Gmail's filters

## Cost Breakdown

### Option 1: OpenAI GPT-3.5 Turbo
- Cost: ~$0.002 per email
- 1000 emails: ~$2
- Best accuracy

### Option 2: Google Gemini
- Cost: FREE for up to 60 requests/minute
- Unlimited emails (within rate limits)
- Good accuracy

### Option 3: Rule-Based
- Cost: FREE
- No API needed
- Decent accuracy (~80%)

## Support

For questions or issues:
1. Check Gmail API docs: https://developers.google.com/gmail/api
2. OpenAI docs: https://platform.openai.com/docs
3. Google Gemini docs: https://ai.google.dev/

## Next Steps

1. Choose your AI categorization method (OpenAI/Gemini/Rule-based)
2. Set up Google Cloud project and get credentials
3. Implement backend server
4. Connect frontend to backend
5. Test with your Gmail account
6. Deploy to production

Good luck! 🚀
