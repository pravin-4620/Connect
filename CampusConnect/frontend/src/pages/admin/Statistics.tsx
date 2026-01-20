/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Activity, Server, Cpu, HardDrive, Globe, Database, ExternalLink, FileText, Terminal } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';

const AdminStatistics = () => {
    const [stats, setStats] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await adminAPI.getDashboard();
                if (statsRes.data?.success) {
                    setStats({
                        ...statsRes.data.data.technical,
                        systemHealth: statsRes.data.data.systemHealth,
                        recentUsers: statsRes.data.data.recentUsers
                    });
                }

                // Fetch Logs
                const logsRes = await adminAPI.getSystemLogs();
                if (logsRes.data?.success) {
                    setLogs(logsRes.data.data.logs || []);
                }
            } catch (error) {
                console.error("Failed to fetch system data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    // Mock data for charts
    const memoryData = [
        { time: '00:00', value: 450 },
        { time: '04:00', value: 480 },
        { time: '08:00', value: 650 },
        { time: '12:00', value: 800 },
        { time: '16:00', value: 750 },
        { time: '20:00', value: 550 },
        { time: '24:00', value: 500 },
    ];

    const trafficData = [
        { time: 'Mon', value: 120 },
        { time: 'Tue', value: 250 },
        { time: 'Wed', value: 180 },
        { time: 'Thu', value: 300 },
        { time: 'Fri', value: 280 },
        { time: 'Sat', value: 150 },
        { time: 'Sun', value: 130 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Statistics</h1>
                <p className="text-muted-foreground">Technical performance, database & cloud infrastructure monitoring</p>
            </div>

            {/* Top Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeUsers24h || 0}</div>
                        <p className="text-xs text-muted-foreground">Unique logins in last day</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.serverUptime ? (stats.serverUptime / 3600).toFixed(1) : 0}h</div>
                        <p className="text-xs text-muted-foreground">Continuous operation time</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                        <HardDrive className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {typeof stats?.memoryUsage === 'object'
                                ? Math.floor((stats.memoryUsage.rss || 0) / 1024 / 1024)
                                : (stats?.memoryUsage || 0)
                            } MB
                        </div>
                        <p className="text-xs text-muted-foreground">RSS Memory Consumption</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform</CardTitle>
                        <Server className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold uppercase">{stats?.platform || '-'}</div>
                        <p className="text-xs text-muted-foreground">Node {stats?.nodeVersion || '-'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Infrastructure Status */}
            <div>
                <h2 className="text-xl font-semibold mb-4 tracking-tight">Cloud Infrastructure</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Database */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-indigo-500" /> Database
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Connected
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">Provider:</span>
                                <span className="font-medium text-right">Neon / PostgreSQL</span>
                                <span className="text-muted-foreground">Version:</span>
                                <span className="font-medium text-right">{stats?.systemHealth?.database?.version || 'PostgreSQL'}</span>
                                <span className="text-muted-foreground">Pool Size:</span>
                                <span className="font-medium text-right font-mono">{stats?.systemHealth?.database?.connections || 5}</span>
                            </div>
                            <Button variant="outline" className="w-full text-xs" onClick={() => window.open('https://console.neon.tech', '_blank')}>
                                <ExternalLink className="mr-2 h-3 w-3" /> Open Database Dashboard
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Backend */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-blue-500" /> Backend
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Healthy
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">Provider:</span>
                                <span className="font-medium text-right">Render</span>
                                <span className="text-muted-foreground">Region:</span>
                                <span className="font-medium text-right">{stats?.systemHealth?.backend?.region || 'Oregon (USA)'}</span>
                                <span className="text-muted-foreground">Instance:</span>
                                <span className="font-medium text-right">Free Tier</span>
                            </div>
                            <Button variant="outline" className="w-full text-xs" onClick={() => window.open('https://dashboard.render.com', '_blank')}>
                                <ExternalLink className="mr-2 h-3 w-3" /> View Deployment Logs
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Frontend */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-purple-500" /> Frontend
                                </div>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Live
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">Provider:</span>
                                <span className="font-medium text-right">Vercel</span>
                                <span className="text-muted-foreground">Latency:</span>
                                <span className="font-medium text-right font-mono">{stats?.systemHealth?.frontend?.latency || '45'}ms</span>
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium text-right">Optimal</span>
                            </div>
                            <Button variant="outline" className="w-full text-xs" onClick={() => window.open('https://vercel.com/dashboard', '_blank')}>
                                <ExternalLink className="mr-2 h-3 w-3" /> Vercel Analytics
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* System Logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="h-5 w-5" /> Recent System Logs
                            </CardTitle>
                            <CardDescription>Real-time analytics and system events</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                            <FileText className="mr-2 h-4 w-4" /> Download Full Log
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-muted/40 font-mono text-sm max-h-[300px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {format(new Date(log.loggedAt), 'MMM dd HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>{log.action || 'System Event'}</TableCell>
                                            <TableCell>
                                                {log.student?.user ? `${log.student.user.firstName} ${log.student.user.lastName}` : 'System'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 font-normal">
                                                    Success
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    stats?.recentUsers?.map((u: any) => (
                                        <TableRow key={u.id}>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {format(new Date(u.createdAt), 'MMM dd HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>User Registration</TableCell>
                                            <TableCell>
                                                {u.firstName} {u.lastName} ({u.role})
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="bg-green-50 text-green-700 font-normal">
                                                    Success
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )) || (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No logs available.
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed System Info */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" /> Resource Usage Trend</CardTitle>
                        <CardDescription>Simulated memory usage pattern over last 24h</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={memoryData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Traffic Overview</CardTitle>
                        <CardDescription>Simulated weekly visitor distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trafficData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminStatistics;
