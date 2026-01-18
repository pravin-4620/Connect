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
        // Pre-load notification sound
        const notificationAudio = new Audio('/notification.mp3');
        notificationAudio.load();

        const handleNotification = (data: any) => {
            toast(data.title || 'Notification', {
                description: data.message,
            });
        };

        const handleNewMessage = (data: any) => {
            // Ignore own messages
            if (data.senderId === user?.id) return;

            // Play notification sound
            const playSound = async () => {
                try {
                    const audio = new Audio('/notification.mp3');
                    audio.volume = 0.5; // Set volume to 50%
                    await audio.play();
                } catch (error: any) {
                    // Browser blocked autoplay - this is normal
                    if (error.name === 'NotAllowedError') {
                        console.log('Notification sound blocked by browser. User interaction required.');
                    } else {
                        console.error('Audio play failed:', error);
                    }
                }
            };

            playSound();

            // Show toast notification
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
