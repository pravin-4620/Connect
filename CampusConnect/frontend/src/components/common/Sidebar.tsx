import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import { cn } from '../../utils/cn';
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Briefcase,
    FileText,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    ClipboardList,
    UserCheck,
    BarChart,
    Megaphone,
    Mail,
    ClipboardCheck
} from 'lucide-react';

interface SidebarNavProps {
    collapsed?: boolean;
    onItemClick?: () => void;
}

export const SidebarNav = ({ collapsed = false, onItemClick }: SidebarNavProps) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await chatAPI.getUnreadCount();
                setUnreadCount(res.data.data?.count || 0);
            } catch (error) {
                console.error('Failed to fetch unread count', error);
            }
        };

        if (user) {
            fetchUnread();
        }

        const handleNewMessage = (message: any) => {
            // Don't increment for own messages
            if (message.senderId === user?.id) return;
            setUnreadCount(prev => prev + 1);
        };

        const handleChatRead = () => {
            fetchUnread();
        };

        socketService.on('newMessage', handleNewMessage);
        window.addEventListener('chat-read', handleChatRead);

        return () => {
            socketService.off('newMessage', handleNewMessage);
            window.removeEventListener('chat-read', handleChatRead);
        };
    }, [user]);

    // Cleanup redundant or old useEffects if any
    useEffect(() => {
        if (location.pathname.includes('/chat')) {
            chatAPI.getUnreadCount().then(res => setUnreadCount(res.data.data?.count || 0)).catch(() => { });
        }
    }, [location.pathname]);

    const getMenuItems = () => {
        switch (user?.role) {
            case 'STUDENT':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
                    { icon: Briefcase, label: 'Placements', path: '/student/placements' },
                    { icon: Calendar, label: 'Events', path: '/student/events' },
                    { icon: FileText, label: 'Assignments', path: '/student/assignments' },
                    { icon: BookOpen, label: 'Study Materials', path: '/student/study-materials' },
                    { icon: GraduationCap, label: 'Skills Tests', path: '/student/skills-tests' },
                    { icon: ClipboardList, label: 'Resume Analyzer', path: '/student/resume-analyzer' },
                    { icon: Mail, label: 'Inbox', path: '/student/mails' },
                    { icon: UserCheck, label: 'Gate Pass', path: '/student/gate-pass' },
                ];
            case 'MENTOR':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor/dashboard' },
                    { icon: Users, label: 'My Students', path: '/mentor/students' },
                    { icon: ClipboardCheck, label: 'Attendance', path: '/mentor/attendance' },
                    { icon: UserCheck, label: 'Approvals', path: '/mentor/approvals' },
                    { icon: FileText, label: 'Assignments', path: '/mentor/assignments' },
                    { icon: Calendar, label: 'Events', path: '/mentor/events' },
                    { icon: BookOpen, label: 'Study Materials', path: '/mentor/study-materials' },
                    { icon: Mail, label: 'Inbox', path: '/mentor/mails' },
                    { icon: Settings, label: 'Settings', path: '/mentor/settings' },
                ];
            case 'PLACEMENT_OFFICER':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/placement/dashboard' },
                    { icon: Briefcase, label: 'Drives', path: '/placement/drives' },
                    { icon: Users, label: 'Students', path: '/placement/students' },
                    { icon: MessageSquare, label: 'Interviews', path: '/placement/interviews' },
                    { icon: GraduationCap, label: 'Skills Tests', path: '/placement/skills-tests' },
                    { icon: BarChart, label: 'Analytics', path: '/placement/analytics' },
                    { icon: Megaphone, label: 'Announcements', path: '/placement/announcements' },
                    { icon: Mail, label: 'Inbox', path: '/placement/mails' },
                    { icon: Settings, label: 'Settings', path: '/placement/settings' },
                ];
            case 'ADMIN':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: Users, label: 'User Management', path: '/admin/users' },
                    { icon: UserCheck, label: 'Mappings', path: '/admin/mappings' },
                    { icon: BarChart, label: 'System Stats', path: '/admin/statistics' },
                    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
                    { icon: Settings, label: 'Settings', path: '/admin/settings' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    // Determine logo display logic based on collapsed prop
    const showLogoText = !collapsed;
    const justifyClass = collapsed ? "justify-center" : "";

    return (
        <div className="flex flex-col h-full min-h-0 bg-card text-card-foreground">
            {/* Header */}
            <div className={cn("p-4 border-b border-border flex items-center h-16 flex-shrink-0", justifyClass, !collapsed && "justify-between")}>
                <div className={cn("flex items-center gap-2 font-bold text-xl text-primary truncate", collapsed && "justify-center w-full")}>
                    <GraduationCap className="h-6 w-6 flex-shrink-0" />
                    {showLogoText && <span>CampusConnect</span>}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 min-h-0 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onItemClick}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon size={20} className={cn("flex-shrink-0", !collapsed && "mr-1")} />
                        {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                    </NavLink>
                ))}

                {/* Common Chat */}
                <NavLink
                    to="/chat"
                    onClick={onItemClick}
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group mt-4",
                        isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? "Chat" : undefined}
                >
                    <div className="relative">
                        <MessageSquare size={20} className={cn("flex-shrink-0", !collapsed && "mr-1")} />
                        {unreadCount > 0 && (
                            <span className={cn(
                                "absolute -top-1 -right-1 flex h-2.5 w-2.5",
                                collapsed ? "" : "-right-0" // Adjust position if needed
                            )}>
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="flex justify-between items-center bg-transparent flex-1">
                            <span className="font-medium">Messages</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    )}
                </NavLink>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border flex-shrink-0">
                <button
                    onClick={() => {
                        logout();
                        onItemClick?.();
                    }}
                    className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors",
                        collapsed && "justify-center"
                    )}
                    title="Logout"
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
}

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={cn(
                "hidden md:flex h-screen bg-card border-r border-border transition-all duration-300 flex-col sticky top-0 relative", // Added relative
                collapsed ? "w-20" : "w-64"
            )}
        >
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-4 right-[-12px] z-50 p-1 bg-background border border-border rounded-full hover:bg-accent text-muted-foreground shadow-sm hidden lg:flex"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className="flex-1 flex flex-col min-h-0">
                <SidebarNav collapsed={collapsed} />
            </div>
        </div>
    );
};

export default Sidebar;

