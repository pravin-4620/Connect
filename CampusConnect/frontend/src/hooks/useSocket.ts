/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(socketService.isConnected());
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const onTyping = (data: { senderId: string }) => {
            setTypingUsers(prev => [...prev, data.senderId]);
            // Auto clear after 3s as per prompt "3s timeout"
            setTimeout(() => {
                setTypingUsers(prev => prev.filter(id => id !== data.senderId));
            }, 3000);
        };

        socketService.on('connect', onConnect);
        socketService.on('disconnect', onDisconnect);
        socketService.on('typing', onTyping);

        socketService.connect();

        return () => {
            socketService.off('connect', onConnect);
            socketService.off('disconnect', onDisconnect);
            socketService.off('typing', onTyping);
            socketService.disconnect();
        };
    }, []);

    const sendMessage = useCallback((receiverId: string, content: string) => {
        socketService.sendMessage(receiverId, content);
    }, []);

    const sendTyping = useCallback((receiverId: string) => {
        socketService.sendTyping(receiverId);
    }, []);

    const listenToMessages = useCallback((callback: (data: any) => void) => {
        socketService.on('newMessage', callback);
        return () => socketService.off('newMessage', callback);
    }, []);

    return {
        isConnected,
        typingUsers,
        sendMessage,
        sendTyping,
        listenToMessages
    };
};
