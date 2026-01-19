import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, Settings, Menu, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { SidebarNav } from './Sidebar';
import { getFullImageUrl } from '../../utils/fileUtils';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleProfileClick = () => {
        if (!user) return;
        switch (user.role) {
            case 'STUDENT':
                navigate('/student/profile');
                break;
            case 'MENTOR':
                navigate('/mentor/profile');
                break;
            case 'PLACEMENT_OFFICER':
                navigate('/placement/profile');
                break;
            case 'ADMIN':
                navigate('/admin/profile');
                break;
            default:
                break;
        }
    };

    const handleSettingsClick = () => {
        if (!user) return;
        switch (user.role) {
            case 'STUDENT':
                navigate('/student/settings');
                break;
            case 'MENTOR':
                navigate('/mentor/settings');
                break;
            case 'PLACEMENT_OFFICER':
                navigate('/placement/settings');
                break;
            case 'ADMIN':
                navigate('/admin/settings');
                break;
            default:
                // All roles handled
                navigate('/');
                break;
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 border-b bg-background px-6 shadow-sm">
            <div className="flex-1 flex items-center gap-4">
                <div className="md:hidden">
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72">
                            <SidebarNav onItemClick={() => setMobileOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>
                <h2 className="text-lg font-semibold text-foreground capitalize">
                    {/* Dynamic Title based on role */}
                    {user?.role.replace('_', ' ').toLowerCase()} Portal
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground" onClick={() => navigate('/chat')}>
                    <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 block ring-2 ring-white"></span>
                </Button>

                <div className="flex items-center gap-2 border-l pl-4">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user?.role.toLowerCase().replace('_', ' ')}</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={getFullImageUrl(user?.profilePicture)} alt={`${user?.firstName} ${user?.lastName}`} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
