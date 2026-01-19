import { studentAPI } from '../../services/api';
import { useQuery } from '../../hooks/useQuery';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar, CheckCircle, Clock, TrendingUp, Upload, Ticket, Briefcase, Bell, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { DashboardStats } from '../../types';

interface Activity {
    id: number | string;
    type: string;
    description: string;
    date?: string; // from mock
    createdAt?: string; // from backend
}

interface Announcement {
    id: number | string;
    title: string;
    date?: string; // from mock
    createdAt?: string; // from backend
    priority?: string;
}

const CGPA_DATA = [
    { semester: 'Sem 1', cgpa: 7.8 },
    { semester: 'Sem 2', cgpa: 8.0 },
    { semester: 'Sem 3', cgpa: 8.2 },
    { semester: 'Sem 4', cgpa: 8.1 },
    { semester: 'Sem 5', cgpa: 8.4 },
    { semester: 'Sem 6', cgpa: 8.5 },
];

interface DashboardData {
    stats: DashboardStats;
    activities: Activity[];
    announcements: Announcement[];
}

const StudentDashboard = () => {
    // Stable reference for fetching function is handled by useQuery ref pattern
    // but the inline arrow function is created every render. 
    // useQuery internal logic handles the loop prevention.

    const { data, loading } = useQuery<DashboardData>(() => studentAPI.getDashboard());

    // Fallback logic
    // Use real data, default to structured empty states to prevent crashes, 
    // but DO NOT use "Mock Data" logic that hides backend issues.
    const stats = data?.stats;
    const activities = data?.activities || [];
    const announcements = data?.announcements || [];

    if (loading) return <LoadingSpinner fullScreen={false} />;

    // Should we show error state? Or just fallbacks?
    // Current design uses fallbacks. 
    // If error is strictly critical we could return <div>Error</div> but for dashboard, showing partial/mock is often preferred during dev/demo.

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <Link to="/student/profile">
                        <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Update Resume
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-white to-blue-50/50 border-blue-100 dark:from-background dark:to-blue-900/20 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CGPA</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats?.cgpa?.toFixed(2) || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">Cumulative Grade Point Average</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-white to-orange-50/50 border-orange-100 dark:from-background dark:to-orange-900/20 dark:border-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{stats?.pendingAssignments || 0}</div>
                        <p className="text-xs text-muted-foreground">Due this week</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-white to-purple-50/50 border-purple-100 dark:from-background dark:to-purple-900/20 dark:border-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats?.upcomingEvents || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered events</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-white to-green-50/50 border-green-100 dark:from-background dark:to-green-900/20 dark:border-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Placements</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats?.activePlacements || 0}</div>
                        <p className="text-xs text-muted-foreground">Eligible drives</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Left Column: Charts & Activity */}
                <div className="col-span-4 space-y-4">

                    {/* Performance Chart */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Academic Performance</CardTitle>
                            <CardDescription>CGPA trend over semesters</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={CGPA_DATA}>
                                    <defs>
                                        <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="semester"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cgpa"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorCgpa)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest actions and updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="flex">
                                        <div className="flex flex-col items-center mr-4">
                                            <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                                            {index !== activities.length - 1 && <div className="w-0.5 h-full bg-border my-1" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-sm font-medium leading-none">{activity.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(activity.date || activity.createdAt || new Date()), 'MMM d, yyyy h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {!activities.length && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Quick Actions & Announcements */}
                <div className="col-span-3 space-y-4">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Link to="/student/assignments">
                                <Button variant="outline" className="w-full justify-start h-auto py-3" size="sm">
                                    <FileText className="mr-2 h-4 w-4" />
                                    <div className="text-left">
                                        <div>Assignments</div>
                                        <div className="text-[10px] text-muted-foreground">Submit due work</div>
                                    </div>
                                </Button>
                            </Link>
                            <Link to="/student/gate-pass">
                                <Button variant="outline" className="w-full justify-start h-auto py-3" size="sm">
                                    <Ticket className="mr-2 h-4 w-4" />
                                    <div className="text-left">
                                        <div>Gate Pass</div>
                                        <div className="text-[10px] text-muted-foreground">Apply for leave</div>
                                    </div>
                                </Button>
                            </Link>
                            <Link to="/student/placements">
                                <Button variant="outline" className="w-full justify-start h-auto py-3" size="sm">
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    <div className="text-left">
                                        <div>Placements</div>
                                        <div className="text-[10px] text-muted-foreground">View drives</div>
                                    </div>
                                </Button>
                            </Link>
                            <Link to="/student/events">
                                <Button variant="outline" className="w-full justify-start h-auto py-3" size="sm">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <div className="text-left">
                                        <div>Events</div>
                                        <div className="text-[10px] text-muted-foreground">Register now</div>
                                    </div>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Announcements */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center">
                                <Bell className="mr-2 h-4 w-4 text-primary" />
                                Announcements
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {announcements.map((announcement: any) => (
                                <div key={announcement.id} className="flex items-start space-x-3 p-3 bg-muted/40 rounded-lg">
                                    {/* Priority Dot */}
                                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${announcement.priority === 'HIGH' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium leading-snug">{announcement.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {format(new Date(announcement.createdAt || announcement.date || new Date()), 'MMM d')} • <span className={announcement.priority === 'HIGH' ? 'text-red-500 font-medium' : ''}>{announcement.priority || 'NORMAL'}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {!announcements.length && <p className="text-sm text-muted-foreground">No announcements.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
