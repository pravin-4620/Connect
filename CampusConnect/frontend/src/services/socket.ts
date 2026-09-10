/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

type ListenerCallback = (...args: any[]) => void;

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, ListenerCallback[]> = new Map();

    connect() {
        if (this.socket?.connected) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.emitToListeners('connect', true);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.emitToListeners('disconnect', false);
        });

        this.socket.on('error', (err) => {
            console.error('Socket error:', err);
        });

        // Forward global events
        this.socket.on('new-message', (data) => this.emitToListeners('newMessage', data));
        this.socket.on('message-sent', (data) => this.emitToListeners('newMessage', data)); // Self-sent messages (other tabs/confirmation)
        this.socket.on('message-read', (data) => this.emitToListeners('messageRead', data));
        this.socket.on('user-typing', (data) => this.emitToListeners('typing', data));
        this.socket.on('notification', (data) => this.emitToListeners('notification', data));
        this.socket.on('new-mail', (data) => this.emitToListeners('newMail', data));

        // Maintenance mode listener
        this.socket.on('maintenance:status', (data) => {
            console.log('Socket: Maintenance status received', data);
            this.emitToListeners('maintenance:status', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Event Emitters
    joinUser(userId: string) {
        if (!this.socket) return;
        this.socket.emit('join-user', userId);
    }

    sendMessage(receiverId: string, content: string) {
        if (!this.socket) return;
        this.socket.emit('send-message', { receiverId, content }); // Match backend 'send-message'
    }

    markAsRead(messageId: string, senderId: string) {
        if (!this.socket) return;
        this.socket.emit('mark-read', { messageId, userId: senderId }); // Match backend 'mark-read'
    }

    sendTyping(conversationId: string, userId: string, isTyping: boolean) {
        if (!this.socket) return;
        this.socket.emit('typing', { conversationId, userId, isTyping });
    }

    // Internal listener management for React components
    on(event: string, callback: ListenerCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: ListenerCallback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            this.listeners.set(event, callbacks.filter(cb => cb !== callback));
        }
    }

    private emitToListeners(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
