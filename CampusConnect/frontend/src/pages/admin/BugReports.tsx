import { useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { bugReportAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Bug, Calendar, User, AlertCircle } from 'lucide-react';

const BugReports = () => {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');

    const { data, loading, refetch } = useQuery<any>(() =>
        bugReportAPI.getAllReports({ status: statusFilter || undefined, priority: priorityFilter || undefined }),
        { dependencies: [statusFilter, priorityFilter] }
    );

    const bugReports = data?.bugReports || [];

    const handleStatusChange = async (reportId: string, newStatus: string) => {
        try {
            await bugReportAPI.updateReportStatus(reportId, newStatus);
            toast.success('Status updated successfully');
            refetch();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; className: string }> = {
            PENDING: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
            IN_PROGRESS: { variant: 'default', className: 'bg-blue-100 text-blue-800' },
            RESOLVED: { variant: 'default', className: 'bg-green-100 text-green-800' },
            CLOSED: { variant: 'outline', className: '' },
        };
        const config = variants[status] || variants.PENDING;
        return <Badge variant={config.variant} className={config.className}>{status.replace('_', ' ')}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, { variant: any; className: string }> = {
            HIGH: { variant: 'destructive', className: '' },
            MEDIUM: { variant: 'default', className: 'bg-orange-100 text-orange-800' },
            LOW: { variant: 'secondary', className: '' },
        };
        const config = variants[priority] || variants.MEDIUM;
        return <Badge variant={config.variant} className={config.className}>{priority}</Badge>;
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bug Reports</h1>
                    <p className="text-muted-foreground">Review and manage user-submitted bug reports</p>
                </div>
                <div className="flex items-center gap-2">
                    <Bug className="h-8 w-8 text-primary" />
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="w-48">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-48">
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Priorities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Priorities</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bug Reports List */}
            <div className="grid gap-4">
                {bugReports.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No bug reports found</p>
                        </CardContent>
                    </Card>
                ) : (
                    bugReports.map((report: any) => (
                        <Card key={report.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getPriorityBadge(report.priority)}
                                            {getStatusBadge(report.status)}
                                        </div>
                                        <CardTitle className="text-xl">{report.title}</CardTitle>
                                        <CardDescription className="mt-2">
                                            {report.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>{report.user.firstName} {report.user.lastName}</span>
                                            <Badge variant="outline" className="ml-1">{report.user.role}</Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={report.status}
                                            onValueChange={(value) => handleStatusChange(report.id, value)}
                                        >
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                <SelectItem value="CLOSED">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default BugReports;
