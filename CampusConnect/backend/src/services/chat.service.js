import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { syncEmails } from './gmail.service.js';

const prisma = new PrismaClient();
const AUTO_SYNC_QUERY = process.env.MAIL_AUTO_SYNC_QUERY || 'newer_than:7d';
const ONLINE_SYNC_INTERVAL_MS = Math.max(Number(process.env.MAIL_ONLINE_SYNC_INTERVAL_MS || 120000), 30000);

function emitNewMail(io, userId, email) {
    io.to(`user_${userId}`).emit('new-mail', {
        id: email.id,
        gmailMessageId: email.gmailMessageId,
        subject: email.subject,
        fromEmail: email.fromEmail,
        body: email.body,
        receivedAt: email.receivedAt,
        category: email.category,
        attachments: email.attachments || [],
    });
}

// Store online users: userId -> socketId
const onlineUsers = new Map();

/**
 * Setup Socket.io event handlers
 */
export const setupSocketHandlers = (io) => {
    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`👤 User connected: ${socket.id}`);

        /**
         * User joins their personal room
         */
        socket.on('join-user', (userId) => {
            const joinedUserId = socket.userId || userId;
            socket.join(`user_${joinedUserId}`);
            onlineUsers.set(joinedUserId, socket.id);
            socket.userId = joinedUserId;

            console.log(`✅ User ${joinedUserId} joined personal room`);

            // Broadcast online status to all users
            io.emit('user-online', { userId: joinedUserId, online: true });

            // Send list of online users to the newly connected user
            const onlineUserIds = Array.from(onlineUsers.keys());
            socket.emit('online-users', onlineUserIds);

            const runMailSync = (query = 'newer_than:2m') => {
                void syncEmails(joinedUserId, {
                    query,
                    onNewEmail: (email) => emitNewMail(io, joinedUserId, email),
                }).catch((error) => console.error('Auto Gmail sync failed:', error.message));
            };
            runMailSync(AUTO_SYNC_QUERY);
            clearInterval(socket.data.mailSyncInterval);
            socket.data.mailSyncInterval = setInterval(() => runMailSync(), ONLINE_SYNC_INTERVAL_MS);
        });

        /**
         * Join conversation room
         */
        socket.on('join-conversation', async ({ conversationId, userId }) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`💬 User ${userId} joined conversation: ${conversationId}`);

            // Mark messages as read when joining conversation
            try {
                await prisma.message.updateMany({
                    where: {
                        receiverId: userId,
                        senderId: conversationId, // conversationId is the other user's ID
                        isRead: false
                    },
                    data: { isRead: true }
                });

                // Notify sender that messages were read
                io.to(`user_${conversationId}`).emit('messages-read', {
                    conversationId: userId,
                    readBy: userId
                });
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        });

        /**
         * Leave conversation room
         */
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`User ${socket.userId} left conversation: ${conversationId}`);
        });

        /**
         * Send message
         */
        socket.on('send-message', async (data) => {
            try {
                const { senderId, receiverId, content } = data;

                // Validate access (year restriction for student-placement officer chat)
                const sender = await prisma.user.findUnique({
                    where: { id: senderId },
                    include: { student: true }
                });

                const receiver = await prisma.user.findUnique({
                    where: { id: receiverId }
                });

                // Check year restriction
                if (sender.role === 'STUDENT' && (receiver.role === 'PLACEMENT_OFFICER' || receiver.role === 'PLACEMENT_HEAD')) {
                    if (sender.student.year < 3) {
                        socket.emit('error', {
                            message: 'Students in year 1-2 cannot chat with placement officers'
                        });
                        return;
                    }
                }

                // Save message to database
                const message = await prisma.message.create({
                    data: {
                        senderId,
                        receiverId,
                        content,
                        sentAt: new Date(),
                        isRead: false
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                role: true
                            }
                        },
                        receiver: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                role: true
                            }
                        }
                    }
                });

                // Emit to sender (confirmation)
                socket.emit('message-sent', message);

                // Emit to receiver if online
                io.to(`user_${receiverId}`).emit('new-message', message);

                console.log(`📨 Message sent from ${senderId} to ${receiverId}`);
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        /**
         * Typing indicator
         */
        socket.on('typing', ({ conversationId, userId, isTyping }) => {
            socket.to(`user_${conversationId}`).emit('user-typing', {
                userId,
                isTyping
            });
        });

        /**
         * Mark message as read
         */
        socket.on('mark-read', async ({ messageId, userId }) => {
            try {
                const message = await prisma.message.update({
                    where: { id: messageId, receiverId: userId },
                    data: { isRead: true }
                });

                // Notify sender
                io.to(`user_${message.senderId}`).emit('message-read', {
                    messageId,
                    readBy: userId
                });
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        /**
         * Disconnect
         */
        socket.on('disconnect', () => {
            clearInterval(socket.data.mailSyncInterval);
            if (socket.userId) {
                onlineUsers.delete(socket.userId);

                // Broadcast offline status
                io.emit('user-online', { userId: socket.userId, online: false });

                console.log(`👤 User ${socket.userId} disconnected`);
            }
        });
    });
};

/**
 * Get conversations for a user (HTTP endpoint)
 */
export const getConversations = async (userId) => {
    try {
        console.log(`Getting conversations for userId: ${userId}`);
        // Get all messages where user is sender or receiver
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true
                    }
                }
            },
            orderBy: { sentAt: 'desc' }
        });

        console.log(`Found ${messages.length} messages for user ${userId}`);

        // Group by conversation partner
        const conversationsMap = new Map();

        messages.forEach(message => {
            const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
            const partner = message.senderId === userId ? message.receiver : message.sender;

            // Debug log if partner is missing
            if (!partner) {
                console.warn(`Message ${message.id} has no partner? senderId=${message.senderId}, receiverId=${message.receiverId}`);
                return;
            }

            if (!conversationsMap.has(partnerId)) {
                conversationsMap.set(partnerId, {
                    partnerId,
                    partner,
                    lastMessage: message,
                    unreadCount: 0
                });
            }

            // Count unread messages
            if (message.receiverId === userId && !message.isRead) {
                conversationsMap.get(partnerId).unreadCount++;
            }
        });

        const result = Array.from(conversationsMap.values());
        console.log(`Returning ${result.length} conversations`);
        return result;
    } catch (error) {
        console.error('Get conversations error:', error);
        throw error;
    }
};

/**
 * Get messages in a conversation (HTTP endpoint)
 */
export const getMessages = async (userId, partnerId, limit = 50, offset = 0) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true
                    }
                }
            },
            orderBy: { sentAt: 'desc' },
            take: limit,
            skip: offset
        });

        return messages.reverse(); // Return in chronological order
    } catch (error) {
        console.error('Get messages error:', error);
        throw error;
    }
};

/**
 * Get available chat partners for a user
 */
export const getChatPartners = async (userId) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        let partners = [];

        if (user.role === 'STUDENT') {
            // Students can chat with their mentor
            if (user.student.mentorId) {
                const mentor = await prisma.mentor.findUnique({
                    where: { id: user.student.mentorId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                role: true
                            }
                        }
                    }
                });
                if (mentor) partners.push(mentor.user);
            }

            // Year 3-4 students can chat with placement officer
            if (user.student.year >= 3 && user.student.placementOfficerId) {
                const placementOfficer = await prisma.placementOfficer.findUnique({
                    where: { id: user.student.placementOfficerId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                role: true
                            }
                        }
                    }
                });
                if (placementOfficer) partners.push(placementOfficer.user);
            }
        } else if (user.role === 'MENTOR') {
            // Mentors can chat with their assigned students
            const students = await prisma.student.findMany({
                where: { mentorId: user.mentor.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                            role: true
                        }
                    }
                }
            });
            partners = students.map(s => s.user);
        } else if (user.role === 'PLACEMENT_OFFICER') {
            // Placement officers can chat with year 3-4 students
            const students = await prisma.student.findMany({
                where: {
                    year: { gte: 3 },
                    placementOfficerId: user.placementOfficer.id
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                            role: true
                        }
                    }
                }
            });
            partners = students.map(s => s.user);
        } else if (user.role === 'PLACEMENT_HEAD') {
            // Head Placement Officer: Chief Mentor, Placement Officers, Admins
            const users = await prisma.user.findMany({
                where: {
                    role: { in: ['CHIEF_MENTOR', 'PLACEMENT_OFFICER', 'ADMIN', 'PLACEMENT_HEAD', 'SUB_ADMIN'] },
                    id: { not: userId }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    role: true
                }
            });
            partners = users;
        } else if (user.role === 'ADMIN') {
            // Admin can chat with everyone
            const allUsers = await prisma.user.findMany({
                where: {
                    id: { not: userId },
                    role: { not: 'ADMIN' } // Optional: strict admin-admin chat? Let's keep it simple.
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    role: true
                }
            });
            partners = allUsers;
        }

        return partners;
    } catch (error) {
        console.error('Get chat partners error:', error);
        throw error;
    }
};
/**
 * Send a message (HTTP endpoint)
 */
/**
 * Send a message (HTTP endpoint)
 */
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, attachmentUrl, attachmentType } = req.body;
        const senderId = req.userId;

        if (!receiverId || (!content && !attachmentUrl)) {
            throw new Error('Receiver ID and (content or attachment) are required');
        }

        // Validate sender and receiver
        const sender = await prisma.user.findUnique({
            where: { id: senderId },
            include: { student: true }
        });

        const receiver = await prisma.user.findUnique({
            where: { id: receiverId }
        });

        if (!receiver) {
            throw new Error('Receiver not found');
        }

        // Check year restriction (Student <-> Placement Officer)
        if (sender.role === 'STUDENT' && (receiver.role === 'PLACEMENT_OFFICER' || receiver.role === 'PLACEMENT_HEAD')) {
            if (sender.student.year < 3) {
                return res.status(403).json({
                    success: false,
                    message: 'Students in year 1-2 cannot chat with placement officers'
                });
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content: content || '', // Ensure it's empty string if null, or handle as null? Schema allows null.
                attachmentUrl,
                attachmentType,
                sentAt: new Date(),
                isRead: false
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        role: true
                    }
                }
            }
        });

        // Broadcast via Socket.io
        const io = req.app.get('io');
        if (io) {
            // Emit to receiver's room
            io.to(`user_${receiverId}`).emit('new-message', message);
            // Also emit to sender (optional, if they have multiple tabs open)
            io.to(`user_${senderId}`).emit('message-sent', message);
        }

        return message;
    } catch (error) {
        console.error('Send message error:', error);
        throw error;
    }
};

/**
 * Get total unread message count for a user
 */
export const getUnreadCount = async (userId) => {
    try {
        const count = await prisma.message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
        return count;
    } catch (error) {
        console.error('Get unread count error:', error);
        throw error;
    }
};

/**
 * Mark messages from a specific sender as read
 */
export const markMessagesAsRead = async (userId, senderId) => {
    try {
        const result = await prisma.message.updateMany({
            where: {
                receiverId: userId,
                senderId: senderId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        return result.count;
    } catch (error) {
        console.error('Mark messages as read error:', error);
        throw error;
    }
};

/**
 * Delete a conversation (delete all messages with a partner)
 */
export const deleteConversation = async (userId, partnerId) => {
    try {
        const result = await prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            }
        });
        return result.count;
    } catch (error) {
        console.error('Delete conversation error:', error);
        throw error;
    }
};
