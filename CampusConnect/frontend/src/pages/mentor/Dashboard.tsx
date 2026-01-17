/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, FileText, Calendar, CheckSquare, Briefcase } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useQuery } from '../../hooks/useQuery';
import { useState } from 'react';
import { toast } from 'sonner';

const MentorDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const navigate = useNavigate();

    const { loading } = useQuery<any>(() => mentorAPI.getDashboard(), {
        onSuccess: (data) => {
            setStats(data || null);
        },
        onError: () => {
            toast.error("Failed to load dashboard data (using mock)");
            setStats({
                totalStudents: 42,
                pendingApprovals: 5,
                upcomingEvents: 3,
                averageAttendance: 85,
                attendanceData: [
                    { name: 'Mon', present: 38 },
                    { name: 'Tue', present: 40 },
                    { name: 'Wed', present: 35 },
                    { name: 'Thu', present: 41 },
                    { name: 'Fri', present: 39 },
                ],
                placementStats: [
                    { name: 'Placed', value: 12 },
                    { name: 'Unplaced', value: 30 },
                ],
                activity: [
                    { id: 1, type: 'GATE_PASS', message: 'Gate pass requested by John Doe', time: '2 mins ago' },
                    { id: 2, type: 'ASSIGNMENT', message: 'Assignment submitted by Alice Smith', time: '1 hour ago' },
                    { id: 3, type: 'EVENT', message: 'Workshop "React Basics" scheduled', time: '5 hours ago' }
                ]
            });
        }
    });

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your students and activities</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/mentor/events')} variant="outline">
                        <Calendar className="mr-2 h-4 w-4" /> Manage Events
                    </Button>
                    <Button onClick={() => navigate('/mentor/approvals')}>
                        <CheckSquare className="mr-2 h-4 w-4" /> Approvals
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Active in your batch</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <CheckSquare className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingApprovals}</div>
                        <p className="text-xs text-muted-foreground">Gate passes & requests</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.upcomingEvents}</div>
                        <p className="text-xs text-muted-foreground">Scheduled for this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                        <FileText className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageAttendance}%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Attendance Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Placement Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.placementStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell key="cell-0" fill="hsl(var(--primary))" />
                                        <Cell key="cell-1" fill="hsl(var(--muted))" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center mt-2 flex justify-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-primary" /> Placed
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-muted" /> Unplaced
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.activity?.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${item.type === 'GATE_PASS' ? 'bg-orange-100 text-orange-600' :
                                        item.type === 'ASSIGNMENT' ? 'bg-blue-100 text-blue-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                        {item.type === 'GATE_PASS' ? <Briefcase className="h-4 w-4" /> :
                                            item.type === 'ASSIGNMENT' ? <FileText className="h-4 w-4" /> :
                                                <Calendar className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{item.message}</p>
                                        <p className="text-xs text-muted-foreground">{item.time}</p>
                                    </div>
                                </div>

                                {item.type === 'GATE_PASS' && (
                                    <Button variant="outline" size="sm" onClick={() => navigate('/mentor/approvals')}>Review</Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MentorDashboard;
