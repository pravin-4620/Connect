/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { CheckCircle, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '../../hooks/useQuery';

const MentorApprovals = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { loading } = useQuery<any>(() => mentorAPI.getApprovals(), {
        onSuccess: (data) => {
            const result = data?.data || data || {};
            const gatePasses = (result.gatePasses || []).map((gp: any) => ({
                ...gp,
                type: 'gatepass',
                studentName: `${gp.student?.user?.firstName || ''} ${gp.student?.user?.lastName || ''}`,
                studentRoll: gp.student?.rollNumber,
                // GatePass has fromDate/toDate, EventRegistration usually relies on event date
                fromDate: gp.fromDate,
                toDate: gp.toDate
            }));
            const events = (result.eventRegistrations || []).map((er: any) => ({
                ...er,
                type: 'event',
                studentName: `${er.student?.user?.firstName || ''} ${er.student?.user?.lastName || ''}`,
                studentRoll: er.student?.rollNumber,
                reason: `Registration for ${er.event?.title}`,
                fromDate: er.event?.eventDate, // Display event date
                toDate: er.event?.eventDate
            }));

            setRequests([...gatePasses, ...events]);
        },
        onError: () => {
            toast.error("Failed to fetch approvals");
            // Mock data mapped similarly
            // ...
        }
    });

    const handleAction = (request: any, type: 'APPROVE' | 'REJECT') => {
        setSelectedRequest(request);
        setActionType(type);
        setRejectReason('');
        setIsDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedRequest || !actionType) return;

        try {
            await mentorAPI.updateApproval(selectedRequest.id, {
                type: selectedRequest.type, // 'gatepass' or 'event'
                status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                note: rejectReason
            });
            toast.success(`Request ${actionType === 'APPROVE' ? 'approved' : 'rejected'}`);

            // Update local state
            setRequests(prev => prev.map(req =>
                req.id === selectedRequest.id
                    ? { ...req, status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED', approvalNote: rejectReason }
                    : req
            ));
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'PENDING');
    const historyRequests = requests.filter(r => r.status !== 'PENDING');

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Approvals</h1>
                <p className="text-muted-foreground">Manage student requests and permissions</p>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50 text-green-500" />
                            <p>All caught up! No pending requests.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingRequests.map(req => (
                                <RequestCard key={req.id} request={req} onAction={handleAction} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {historyRequests.map(req => (
                            <RequestCard key={req.id} request={req} isHistory />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>{actionType === 'APPROVE' ? 'Approve Request' : 'Reject Request'}</DialogTitle>
                        <DialogDescription>
                            {actionType === 'APPROVE'
                                ? "Are you sure you want to approve this request?"
                                : "Please provide a reason for rejection."}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'REJECT' && (
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant={actionType === 'REJECT' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                            disabled={actionType === 'REJECT' && !rejectReason.trim()}
                        >
                            Confirm {actionType === 'APPROVE' ? 'Approve' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const RequestCard = ({ request, onAction, isHistory }: { request: any, onAction?: any, isHistory?: boolean }) => {
    return (
        <Card className={isHistory ? 'opacity-80' : ''}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{request.type.replace('_', ' ')}</Badge>
                    {isHistory && (
                        <Badge variant={request.status === 'APPROVED' ? 'default' : 'destructive'}>
                            {request.status}
                        </Badge>
                    )}
                </div>
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {request.studentName}
                </CardTitle>
                <CardDescription>{request.studentRoll}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="bg-muted p-2 rounded">
                    <p className="font-medium text-foreground">{request.reason}</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(request.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                    <div>
                        <span className="text-muted-foreground block">From</span>
                        <span className="font-medium">{format(new Date(request.fromDate), 'MMM d, h:mm a')}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground block">To</span>
                        <span className="font-medium">{format(new Date(request.toDate), 'MMM d, h:mm a')}</span>
                    </div>
                </div>

                {!isHistory && onAction && (
                    <div className="flex gap-2 pt-2">
                        <Button className="w-full" variant="outline" onClick={() => onAction(request, 'REJECT')}>
                            Reject
                        </Button>
                        <Button className="w-full" onClick={() => onAction(request, 'APPROVE')}>
                            Approve
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MentorApprovals;
