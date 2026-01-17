/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import {
    CheckCircle, AlertTriangle, ArrowLeft, FileText, Download, Mail, Phone, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '../../hooks/useQuery';
import { Progress } from '../../components/ui/progress';

const MentorStudentDetails = () => {
    const { id } = useParams<{ id: string }>();

    const { data: student, loading } = useQuery<any>(() => mentorAPI.getStudentDetail(id!), {
        enabled: !!id,
        onError: () => toast.error("Failed to fetch student details")
    });

    if (loading) return <LoadingSpinner fullScreen={false} />;

    if (!student) return (
        <div className="flex flex-col items-center justify-center p-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold">Student Not Found</h2>
            <Link to="/mentor/students" className="mt-4 text-primary hover:underline">Back to Students</Link>
        </div>
    );

    const s = student?.student || student || {}; // Handle API wrapper or direct object

    // Mock Attendance for now if not in DB
    const attendance = s.attendance || 85;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Back */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/mentor/students"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={s.user?.profilePicture} alt={s.user?.firstName} />
                            <AvatarFallback className="text-xl">{s.user?.firstName?.[0]}{s.user?.lastName?.[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-grow space-y-1">
                            <h2 className="text-2xl font-bold">{s.user?.firstName} {s.user?.lastName}</h2>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm">{s.rollNumber}</span>
                                <span>•</span>
                                <span>{s.department}</span>
                                <span>•</span>
                                <span>Year {s.year}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                                <a href={`mailto:${s.user?.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {s.user?.email}
                                </a>
                                {s.user?.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {s.user?.phone}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Attendance</p>
                                <div className="flex items-center justify-end gap-2">
                                    <span className={`text-2xl font-bold ${attendance >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                                        {attendance}%
                                    </span>
                                </div>
                                <Progress value={attendance} className={`h-2 mt-1 ${attendance >= 75 ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`} />
                            </div>
                            {s.resumeUrl && (
                                <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                                    <a href={s.resumeUrl} target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Resume
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="gatepass">Gate Passes</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {s.skills && Array.isArray(s.skills) && s.skills.length > 0 ? (
                                        s.skills.map((skill: any, i: number) => (
                                            <Badge key={i} variant="secondary">
                                                {typeof skill === 'string' ? skill : skill.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-sm">No skills added yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Placements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Placement Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {s.placementApplications?.some((p: any) => p.status === 'APPROVED') ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-green-900">Placed</h3>
                                            <p className="text-sm text-green-700">Congratulations! Details available in placement records.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Applications Submitted</span>
                                            <span className="font-medium">{s.placementApplications?.length || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Interviews Scheduled</span>
                                            <span className="font-medium">{s.interviews?.length || 0}</span>
                                        </div>
                                        <Badge variant="outline" className="w-full justify-center py-1 mt-2">Currently Open to Work</Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="assignments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Submissions</CardTitle>
                            <CardDescription>Track academic progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {s.assignmentSubmissions?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-8">No submissions recorded.</p>
                                ) : (
                                    s.assignmentSubmissions?.map((sub: any) => (
                                        <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium">{sub.assignment?.title || "Unknown Assignment"}</p>
                                                <p className="text-xs text-muted-foreground">Submitted: {format(new Date(sub.submittedAt), 'PPP')}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {sub.grade ? (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Grade: {sub.grade}</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pending Review</Badge>
                                                )}
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={sub.submissionUrl} target="_blank" rel="noreferrer">
                                                        <FileText className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="gatepass" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gate Pass History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {s.gatePasses?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-8">No gate passes recorded.</p>
                                ) : (
                                    s.gatePasses?.map((gp: any) => (
                                        <div key={gp.id} className="flex items-center justify-between border p-3 rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={gp.status === 'APPROVED' ? 'default' : gp.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                        {gp.status}
                                                    </Badge>
                                                    <span className="font-medium text-sm">{gp.reason}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(gp.fromDate), 'MMM d, h:mm a')} - {format(new Date(gp.toDate), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                            <div className="text-xs text-muted-foreground text-right">
                                                Requested: {format(new Date(gp.createdAt), 'MMM d')}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {s.analyticsLogs?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm text-center py-8">No activity recorded.</p>
                                ) : (
                                    s.analyticsLogs?.map((log: any) => (
                                        <div key={log.id} className="flex items-center gap-3 text-sm">
                                            <div className="bg-muted p-2 rounded-full">
                                                <Clock className="h-3 w-3" />
                                            </div>
                                            <div className="flex-grow">
                                                <span className="font-medium">{log.metricType.replace('_', ' ')}</span>
                                                {log.value && <span className="text-muted-foreground"> - {log.value}</span>}
                                            </div>
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {format(new Date(log.loggedAt), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MentorStudentDetails;
