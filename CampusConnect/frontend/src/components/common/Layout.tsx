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
    const { user, logout } = useAuth();

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

        const handleNewMail = (data: any) => {
            toast.info('New Gmail message', {
                description: data.subject || 'You have a new email',
                action: {
                    label: 'View',
                    onClick: () => navigate(`/${user?.role === 'STUDENT' ? 'student' : user?.role === 'MENTOR' || user?.role === 'CHIEF_MENTOR' ? 'mentor' : 'placement'}/mails`)
                },
                duration: 5000,
            });
        };

        // Always listen for general notifications
        socketService.on('notification', handleNotification);

        if (user) {
            socketService.on('newMessage', handleNewMessage);
            socketService.on('newMail', handleNewMail);
        }

        // Cleanup for general notifications
        return () => {
            socketService.off('notification', handleNotification);
            if (user) {
                socketService.off('newMessage', handleNewMessage);
                socketService.off('newMail', handleNewMail);
            }
        };
    }, [navigate, user]);

    useEffect(() => {
        if (user) {
            // Check maintenance mode periodically (every 30 seconds)
            const checkMaintenance = async () => {
                // Skip check for admin users
                if (['ADMIN', 'SUB_ADMIN', 'CHIEF_MENTOR'].includes(user.role)) {
                    return;
                }

                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/maintenance-status`);
                    const data = await response.json();

                    if (data.success && data.data.maintenanceMode) {
                        // Show toast notification
                        toast.error('System is now under maintenance. You will be logged out.', {
                            duration: 5000,
                        });

                        // Wait 2 seconds then logout
                        setTimeout(() => {
                            logout();
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Failed to check maintenance status:', err);
                }
            };

            // Socket listener for immediate update
            const handleMaintenanceStatus = (data: any) => {
                if (data.maintenanceMode) {
                    if (['ADMIN', 'SUB_ADMIN', 'CHIEF_MENTOR'].includes(user.role)) {
                        return;
                    }
                    toast.error('System is now under maintenance. You will be logged out.', {
                        duration: 5000,
                    });
                    setTimeout(() => {
                        logout();
                    }, 2000);
                }
            };

            // Check immediately
            checkMaintenance();

            // Then check every 30 seconds
            const maintenanceInterval = setInterval(checkMaintenance, 30000);

            // Listen for socket event
            socketService.on('maintenance:status', handleMaintenanceStatus);

            return () => {
                clearInterval(maintenanceInterval);
                socketService.off('maintenance:status', handleMaintenanceStatus);
            };
        }
    }, [user, logout]);

    return (
        <div className="flex h-screen overflow-hidden bg-muted/20">
            <ChangePasswordModal />
            <Sidebar />
            <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
                <Navbar />
                <main className="flex-1 p-6 overflow-y-auto w-full max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
