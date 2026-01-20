import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, mentorAPI } from '../../services/api';
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
    onToggleCollapse?: () => void;
}

export const SidebarNav = ({ collapsed = false, onItemClick, onToggleCollapse }: SidebarNavProps) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [approvalsCount, setApprovalsCount] = useState(0);

    // Fetch counts
    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await chatAPI.getUnreadCount();
                setUnreadCount(res.data.data?.count || 0);
            } catch (error) {
                console.error('Failed to fetch unread count', error);
            }
        };

        const fetchApprovals = async () => {
            if (user?.role === 'MENTOR' || user?.role === 'CHIEF_MENTOR') {
                try {
                    const res = await mentorAPI.getDashboard();
                    const data = res.data?.data || res.data;
                    setApprovalsCount(data?.stats?.pendingApprovals || 0);
                } catch (error) { console.error(error); }
            }
        };

        if (user) {
            fetchUnread();
            fetchApprovals();
        }

        const handleNewMessage = (message: any) => {
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

    // Update unread count when location changes to chat
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
            case 'CHIEF_MENTOR':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor/dashboard' },
                    { icon: Users, label: 'My Students', path: '/mentor/students' },
                    { icon: ClipboardCheck, label: 'Attendance', path: '/mentor/attendance' },
                    { icon: UserCheck, label: 'Approvals', path: '/mentor/approvals', badge: approvalsCount },
                    { icon: Calendar, label: 'Events', path: '/mentor/events' },
                    { icon: Mail, label: 'Inbox', path: '/mentor/mails' },
                    { icon: Settings, label: 'Settings', path: '/mentor/settings' },
                ];
            case 'MENTOR':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/mentor/dashboard' },
                    { icon: Users, label: 'My Students', path: '/mentor/students' },
                    { icon: ClipboardCheck, label: 'Attendance', path: '/mentor/attendance' },
                    { icon: UserCheck, label: 'Approvals', path: '/mentor/approvals', badge: approvalsCount },
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
                    { icon: MessageSquare, label: 'Chat Logs', path: '/admin/chats' },
                    { icon: Settings, label: 'Settings', path: '/admin/settings' },
                ];
            case 'SUB_ADMIN':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: Users, label: 'User Management', path: '/admin/users' },
                    { icon: UserCheck, label: 'Mappings', path: '/admin/mappings' },
                    { icon: BarChart, label: 'System Stats', path: '/admin/statistics' },
                    { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
                    { icon: MessageSquare, label: 'Chat Logs', path: '/admin/chats' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();
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
                            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group relative",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                    >
                        <div className="relative flex items-center">
                            <item.icon size={20} className={cn("flex-shrink-0", !collapsed && "mr-1")} />
                            {/* Unified Badge Logic */}
                            {((item as any).badge > 0) && (
                                <span className={cn(
                                    "absolute flex h-2.5 w-2.5",
                                    collapsed ? "-top-1 -right-1" : "-top-1 -right-0.5",
                                    !collapsed && "hidden"
                                )}>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                            )}
                        </div>

                        {!collapsed && (
                            <div className="flex justify-between items-center bg-transparent flex-1 w-full overflow-hidden">
                                <span className="font-medium truncate">{item.label}</span>
                                {((item as any).badge > 0) && (
                                    <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-2">
                                        {(item as any).badge}
                                    </span>
                                )}
                            </div>
                        )}
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
                                collapsed ? "-top-1 -right-1" : "hidden"
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
                                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-2">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    )}
                </NavLink>
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-border flex-shrink-0 space-y-2">
                <button
                    onClick={() => onToggleCollapse?.()}
                    className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!collapsed && <span className="font-medium">Collapse</span>}
                </button>

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
                "hidden md:flex h-full bg-card border-r border-border transition-all duration-300 flex-col",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex-1 flex flex-col min-h-0">
                <SidebarNav
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                />
            </div>
        </div>
    );
};

export default Sidebar;
