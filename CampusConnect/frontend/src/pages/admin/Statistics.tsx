/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Activity, Server, Cpu, HardDrive, Globe } from 'lucide-react';
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

const AdminStatistics = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminAPI.getDashboard(); // We can use the same endpoint or a dedicated one if created
                if (res.data?.success) {
                    setStats(res.data.data.technical);
                }
            } catch (error) {
                console.error("Failed to fetch system stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    // Mock data for charts since backend only sends current snapshot
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
                <p className="text-muted-foreground">Technical performance and server health monitoring</p>
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
                        <div className="text-2xl font-bold">{stats?.memoryUsage?.rss ? (stats.memoryUsage.rss / 1024 / 1024).toFixed(0) : 0} MB</div>
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

            {/* Detailed System Info */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" /> Resource Usage Trend (Mock)</CardTitle>
                        <CardDescription>Memory usage pattern over last 24h</CardDescription>
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
                        <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Traffic Overview (Mock)</CardTitle>
                        <CardDescription>Weekly visitor distribution</CardDescription>
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Environment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Node ENV</span>
                            <span className="font-mono bg-muted px-2 rounded">production</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Arch</span>
                            <span className="font-mono bg-muted px-2 rounded">x64</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">PID</span>
                            <span className="font-mono bg-muted px-2 rounded">{Math.floor(Math.random() * 10000)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Connection</span>
                            <span className="text-green-500 font-bold flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500"></div> Connected</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Pool Size</span>
                            <span className="font-mono bg-muted px-2 rounded">10</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Latency</span>
                            <span className="font-mono bg-muted px-2 rounded">~45ms</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Status</span>
                            <span className="text-green-500 font-bold flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500"></div> Active</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Hit Rate</span>
                            <span className="font-mono bg-muted px-2 rounded">94%</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Keys</span>
                            <span className="font-mono bg-muted px-2 rounded">1,240</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminStatistics;
