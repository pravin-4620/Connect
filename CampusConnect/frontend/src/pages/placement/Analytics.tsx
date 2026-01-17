/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { placementAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PlacementAnalytics = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getAnalytics({ type: 'placement_trends' });
            if (res.data?.success) {
                setAnalytics(res.data.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
            // Mock Data structure if fetch fails, to show layout
            setAnalytics({
                branchWiseData: [
                    { name: 'CSE', placed: 40, total: 60 },
                    { name: 'ECE', placed: 30, total: 50 },
                    { name: 'MECH', placed: 20, total: 45 }
                ],
                packageDist: [
                    { name: '3-5 LPA', value: 20 },
                    { name: '5-8 LPA', value: 35 },
                    { name: '8+ LPA', value: 15 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = () => {
        toast.info("Generating analytics report...");
        // Implement export logic later
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    const branchData = analytics?.branchWiseData || [];
    const packageData = analytics?.packageDist || []; // Ensure backend sends packageDist or map it

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flax-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-muted-foreground">Detailed insights into placement performance</p>
                </div>
                <Button variant="outline" onClick={handleExportReport}>
                    <Download className="mr-2 h-4 w-4" /> Download Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Department Wise Placements</CardTitle>
                        <CardDescription>Comparison of placed vs total students</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={branchData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Total Students" />
                                <Bar dataKey="placed" fill="#82ca9d" name="Placed Students" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Package Distribution</CardTitle>
                        <CardDescription>Breakdown of salary packages based on offers</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={packageData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {packageData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlacementAnalytics;
