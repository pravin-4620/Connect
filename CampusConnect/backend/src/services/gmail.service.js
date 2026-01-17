import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import { categorizeEmail } from './openai.service.js';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

/**
 * Generate Gmail OAuth URL
 */
export const getGmailAuthUrl = (userId) => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: userId // Pass userId to identify user after callback
    });

    return authUrl;
};

/**
 * Handle Gmail OAuth callback
 */
export const handleGmailCallback = async (code, userId) => {
    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Store tokens in database (encrypted in production)
        await prisma.user.update({
            where: { id: userId },
            data: {
                gmailConnected: true,
                gmailAccessToken: tokens.access_token,
                gmailRefreshToken: tokens.refresh_token
            }
        });

        // Trigger initial email sync
        await syncEmails(userId);

        return true;
    } catch (error) {
        console.error('Gmail callback error:', error);
        throw error;
    }
};

/**
 * Sync emails for a user
 */
export const syncEmails = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user.gmailConnected || !user.gmailAccessToken) {
            throw new Error('Gmail not connected');
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: user.gmailAccessToken,
            refresh_token: user.gmailRefreshToken
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Get last sync timestamp or fetch last 100 emails
        const lastEmail = await prisma.email.findFirst({
            where: { userId },
            orderBy: { receivedAt: 'desc' }
        });

        const query = lastEmail
            ? `after:${Math.floor(new Date(lastEmail.receivedAt).getTime() / 1000)}`
            : 'newer_than:7d'; // Last 7 days for first sync

        // Fetch email list
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 100
        });

        const messages = response.data.messages || [];

        // Fetch and process each email
        for (const message of messages) {
            try {
                const email = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id,
                    format: 'full'
                });

                const headers = email.data.payload.headers;
                const subject = headers.find(h => h.name === 'Subject')?.value || '';
                const from = headers.find(h => h.name === 'From')?.value || '';
                const to = headers.find(h => h.name === 'To')?.value || '';
                const date = headers.find(h => h.name === 'Date')?.value || '';

                // Get email body
                let body = '';
                if (email.data.payload.body.data) {
                    body = Buffer.from(email.data.payload.body.data, 'base64').toString('utf-8');
                } else if (email.data.payload.parts) {
                    const textPart = email.data.payload.parts.find(
                        part => part.mimeType === 'text/plain'
                    );
                    if (textPart && textPart.body.data) {
                        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                    }
                }

                // Categorize email using AI
                const category = await categorizeEmail(subject, body);

                // Check if email already exists
                const existingEmail = await prisma.email.findUnique({
                    where: { gmailMessageId: message.id }
                });

                if (!existingEmail) {
                    // Store email in database
                    await prisma.email.create({
                        data: {
                            userId,
                            gmailMessageId: message.id,
                            subject,
                            fromEmail: from,
                            toEmail: to,
                            body: body.substring(0, 5000), // Limit body length
                            category,
                            receivedAt: new Date(date),
                            isRead: false
                        }
                    });
                }
            } catch (emailError) {
                console.error(`Error processing email ${message.id}:`, emailError);
                // Continue with next email
            }
        }

        console.log(`✅ Synced ${messages.length} emails for user ${userId}`);
        return messages.length;
    } catch (error) {
        console.error('Email sync error:', error);

        // Handle token refresh
        if (error.code === 401) {
            try {
                const { credentials } = await oauth2Client.refreshAccessToken();
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        gmailAccessToken: credentials.access_token
                    }
                });
                // Retry sync
                return await syncEmails(userId);
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
                throw refreshError;
            }
        }

        throw error;
    }
};

/**
 * Mark email as read
 */
export const markEmailAsRead = async (emailId, userId) => {
    try {
        await prisma.email.update({
            where: {
                id: emailId,
                userId // Ensure user owns the email
            },
            data: { isRead: true }
        });

        return true;
    } catch (error) {
        console.error('Mark email as read error:', error);
        throw error;
    }
};

/**
 * Get categorized emails for user
 */
export const getCategorizedEmails = async (userId, category = null, limit = 50) => {
    try {
        const where = { userId };
        if (category) {
            where.category = category;
        }

        const emails = await prisma.email.findMany({
            where,
            orderBy: { receivedAt: 'desc' },
            take: limit
        });

        return emails;
    } catch (error) {
        console.error('Get emails error:', error);
        throw error;
    }
};
