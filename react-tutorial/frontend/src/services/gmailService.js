// Gmail API Integration Service
// This service handles authentication and fetching emails from Gmail

const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

class GmailService {
  constructor() {
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
  }

  // Initialize Google API client
  async initializeGapi(clientId, apiKey) {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: apiKey,
              discoveryDocs: [DISCOVERY_DOC],
            });
            this.gapiInited = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error('Google API not loaded'));
      }
    });
  }

  // Initialize Google Identity Services
  initializeGis(clientId, callback) {
    if (window.google) {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: callback,
      });
      this.gisInited = true;
    } else {
      throw new Error('Google Identity Services not loaded');
    }
  }

  // Handle authorization
  authorize() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      this.tokenClient.callback = async (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        resolve(response);
      };

      if (window.gapi.client.getToken() === null) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  // Revoke token
  revokeToken() {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
  }

  // Fetch emails with pagination
  async fetchEmails(maxResults = 50, pageToken = null) {
    try {
      const params = {
        userId: 'me',
        maxResults: maxResults,
        labelIds: ['INBOX'],
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await window.gapi.client.gmail.users.messages.list(params);
      
      if (!response.result.messages) {
        return { emails: [], nextPageToken: null };
      }

      // Fetch full email details
      const emailPromises = response.result.messages.map(message =>
        this.fetchEmailDetails(message.id)
      );

      const emails = await Promise.all(emailPromises);

      return {
        emails: emails.filter(email => email !== null),
        nextPageToken: response.result.nextPageToken || null
      };
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  // Fetch individual email details
  async fetchEmailDetails(messageId) {
    try {
      const response = await window.gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.result;
      const headers = message.payload.headers;

      // Extract email details
      const email = {
        id: message.id,
        threadId: message.threadId,
        snippet: message.snippet,
        internalDate: new Date(parseInt(message.internalDate)),
        labelIds: message.labelIds || [],
        from: this.getHeader(headers, 'From'),
        to: this.getHeader(headers, 'To'),
        subject: this.getHeader(headers, 'Subject'),
        date: this.getHeader(headers, 'Date'),
        body: this.getEmailBody(message.payload),
        unread: message.labelIds?.includes('UNREAD') || false,
        important: message.labelIds?.includes('IMPORTANT') || false,
        starred: message.labelIds?.includes('STARRED') || false,
      };

      return email;
    } catch (error) {
      console.error('Error fetching email details:', error);
      return null;
    }
  }

  // Helper to get header value
  getHeader(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  }

  // Helper to extract email body
  getEmailBody(payload) {
    let body = '';

    if (payload.body && payload.body.data) {
      body = this.decodeBase64(payload.body.data);
    } else if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          body = this.decodeBase64(part.body.data);
          break;
        } else if (part.mimeType === 'text/html' && part.body.data) {
          body = this.decodeBase64(part.body.data);
        }
      }
    }

    return body;
  }

  // Decode base64 encoded email body
  decodeBase64(data) {
    try {
      const text = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
      return decodeURIComponent(escape(text));
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  }

  // Mark email as read
  async markAsRead(messageId) {
    try {
      await window.gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        resource: {
          removeLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as read:', error);
      return false;
    }
  }

  // Star email
  async starEmail(messageId, star = true) {
    try {
      const labelOperation = star ? 'addLabelIds' : 'removeLabelIds';
      await window.gapi.client.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        resource: {
          [labelOperation]: ['STARRED']
        }
      });
      return true;
    } catch (error) {
      console.error('Error starring email:', error);
      return false;
    }
  }

  // Check if user is signed in
  isSignedIn() {
    return window.gapi && window.gapi.client.getToken() !== null;
  }
}

const gmailService = new GmailService();
export default gmailService;
