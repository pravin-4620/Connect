/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, GraduationCap, Briefcase, Award, TrendingUp, UserCheck, Calendar } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminAPI.getDashboard();
                if (res.data?.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    // Transform data for charts
    const deptData = stats?.students?.byDepartment?.map((d: any) => ({
        name: d.department,
        value: d._count
    })) || [];

    const yearData = stats?.students?.byYear?.map((d: any) => ({
        name: `Year ${d.year}`,
        students: d._count
    })) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">System overview and statistics</p>
            </div>

            {/* key Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users?.totalStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all departments
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mentors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users?.totalMentors || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Active faculty members
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Placement Officers</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users?.totalPlacementOfficers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Managing recruitment
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.placements?.placementRate || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.placements?.approvedApplications || 0} placed out of {stats?.placements?.totalApplications || 0} apps
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Charts Area */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Student Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={yearData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="students" fill="#8884d8" name="Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Department Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deptData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {deptData.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>
                            Newest members of the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats?.recentUsers?.map((user: any) => (
                                <div key={user.id} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted border">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-right">
                                        <span className="block">{user.role.replace('_', ' ')}</span>
                                        <span className="text-muted-foreground font-normal">{format(new Date(user.createdAt), 'MMM d')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Mapping Status</CardTitle>
                        <CardDescription>Coverage of mentors & officers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-blue-500" />
                                    <span>Mentor Assigned</span>
                                </div>
                                <span className="font-bold">{stats?.students?.withMentor || 0} / {stats?.users?.totalStudents || 0}</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(((stats?.students?.withMentor || 0) / (stats?.users?.totalStudents || 1)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-right">{stats?.students?.unmappedMentors} unassigned</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-green-500" />
                                    <span>Officier Assigned</span>
                                </div>
                                <span className="font-bold">{stats?.students?.withPlacementOfficer || 0} / {stats?.users?.totalStudents || 0}</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full"
                                    style={{ width: `${Math.min(((stats?.students?.withPlacementOfficer || 0) / (stats?.users?.totalStudents || 1)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-right">{stats?.students?.unmappedPlacementOfficers} unassigned</p>
                        </div>

                        <div className="pt-4 grid grid-cols-2 gap-4">
                            <div className="bg-muted p-3 rounded-lg text-center">
                                <Award className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                <div className="text-xl font-bold">{stats?.events?.upcoming || 0}</div>
                                <div className="text-xs text-muted-foreground">Upcoming Events</div>
                            </div>
                            <div className="bg-muted p-3 rounded-lg text-center">
                                <Calendar className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                                <div className="text-xl font-bold">{stats?.placements?.active || 0}</div>
                                <div className="text-xs text-muted-foreground">Active Drives</div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold tracking-tight mb-4">System Health</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.technical?.activeUsers24h || 0}</div>
                            <p className="text-xs text-muted-foreground">Logged in recently</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.technical?.serverUptime ? (stats.technical.serverUptime / 3600).toFixed(1) : 0}h</div>
                            <p className="text-xs text-muted-foreground">Continuous operation</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold uppercase">{stats?.technical?.platform || '-'}</div>
                            <p className="text-xs text-muted-foreground">{stats?.technical?.nodeVersion || '-'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.technical?.memoryUsage?.rss ? (stats.technical.memoryUsage.rss / 1024 / 1024).toFixed(0) : 0} MB</div>
                            <p className="text-xs text-muted-foreground">RSS Memory</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
