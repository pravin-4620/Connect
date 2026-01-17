import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

import ChangePasswordModal from '../auth/ChangePasswordModal';
import { socketService } from '../../services/socket';
import { toast } from 'sonner';

import { useAuth } from '../../hooks/useAuth';

const Layout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const handleNotification = (data: any) => {
            toast(data.title || 'Notification', {
                description: data.message,
            });
        };

        const handleNewMessage = (data: any) => {
            // Ignore own messages
            if (data.senderId === user?.id) return;

            // Play notification sound
            try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.error('Audio play failed', e));
            } catch (error) {
                console.error('Audio setup failed', error);
            }

            // Always show toast for now to ensure user sees it (Chat.tsx might also show one, but Sonner might dedupe or stack)
            // Or assume Chat.tsx handles it strictly when active.
            // Let's rely on Sonner.
            const senderName = data.sender?.firstName ? `${data.sender.firstName} ${data.sender.lastName || ''}` : 'Someone';
            toast.info(`New Message from ${senderName}`, {
                description: data.content ? (data.content.length > 30 ? data.content.substring(0, 30) + '...' : data.content) : 'You have a new message',
                action: {
                    label: 'View',
                    onClick: () => navigate('/chat')
                },
                duration: 4000,
            });
        };

        socketService.on('notification', handleNotification);
        socketService.on('newMessage', handleNewMessage);

        return () => {
            socketService.off('notification', handleNotification);
            socketService.off('newMessage', handleNewMessage);
        };
    }, [navigate, user]);

    return (
        <div className="flex min-h-screen bg-muted/20">
            <ChangePasswordModal />
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Navbar />
                <main className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
