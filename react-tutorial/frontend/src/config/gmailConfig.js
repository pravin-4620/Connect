// Gmail API Configuration
// 
// To set up Gmail API:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Enable Gmail API
// 4. Create OAuth 2.0 credentials (Web application)
// 5. Add authorized JavaScript origins: http://localhost:3000
// 6. Add authorized redirect URIs: http://localhost:3000
// 7. Copy Client ID and API Key below

const gmailConfig = {
  // Replace with your actual credentials from Google Cloud Console
  CLIENT_ID: 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
  API_KEY: 'YOUR_API_KEY_HERE',
  
  // Scopes required for the application
  SCOPES: 'https://www.googleapis.com/auth/gmail.readonly',
  
  // Discovery document
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
  
  // Enable demo mode (uses mock data instead of real Gmail API)
  DEMO_MODE: true, // Set to false when you have real credentials
};

export default gmailConfig;
