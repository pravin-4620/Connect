import express from 'express';
import { getConversations, getMessages, getChatPartners, sendMessage, getUnreadCount, markMessagesAsRead, deleteConversation } from '../services/chat.service.js';
import { authenticate } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations for user
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await getConversations(req.userId);
        return success(res, { conversations }, 'Conversations fetched');
    } catch (err) {
        console.error('Get conversations error:', err);
        return error(res, 'Failed to fetch conversations', 500);
    }
});

// Get messages in a conversation
router.get('/messages/:partnerId', async (req, res) => {
    try {
        const { partnerId } = req.params;
        const { limit, offset } = req.query;

        const messages = await getMessages(
            req.userId,
            partnerId,
            limit ? parseInt(limit) : 50,
            offset ? parseInt(offset) : 0
        );

        return success(res, { messages }, 'Messages fetched');
    } catch (err) {
        console.error('Get messages error:', err);
        return error(res, 'Failed to fetch messages', 500);
    }
});

// Send a message
router.post('/messages', async (req, res) => {
    try {
        const message = await sendMessage(req, res);
        // If response headers are already sent (e.g. 403), do nothing
        if (res.headersSent) return;

        return success(res, { message }, 'Message sent');
    } catch (err) {
        console.error('Send message error:', err);
        return error(res, 'Failed to send message', 500);
    }
});

// Get available chat partners
router.get('/partners', async (req, res) => {
    try {
        const partners = await getChatPartners(req.userId);
        return success(res, { partners }, 'Partners fetched');
    } catch (err) {
        console.error('Get chat partners error:', err);
        return error(res, 'Failed to fetch chat partners', 500);
    }
});


// Get unread count
router.get('/unread', async (req, res) => {
    try {
        const count = await getUnreadCount(req.userId);
        return success(res, { count }, 'Unread count fetched');
    } catch (err) {
        console.error('Get unread count error:', err);
        return error(res, 'Failed to fetch unread count', 500);
    }
});

// Mark messages as read
router.post('/messages/:senderId/read', async (req, res) => {
    try {
        await markMessagesAsRead(req.userId, req.params.senderId);
        return success(res, null, 'Messages marked as read');
    } catch (err) {
        console.error('Mark read error:', err);
        return error(res, 'Failed to mark messages as read', 500);
    }
});

// Delete conversation
router.delete('/conversations/:partnerId', async (req, res) => {
    try {
        await deleteConversation(req.userId, req.params.partnerId);
        return success(res, null, 'Conversation deleted');
    } catch (err) {
        console.error('Delete conversation error:', err);
        return error(res, 'Failed to delete conversation', 500);
    }
});

export default router;
