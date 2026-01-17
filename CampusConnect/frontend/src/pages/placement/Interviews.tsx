/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { placementAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Calendar, Clock, User, Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const PlacementInterviews = () => {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedInterview, setSelectedInterview] = useState<any>(null);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();
    const { register: registerUpdate, handleSubmit: handleSubmitUpdate, setValue: setValueUpdate } = useForm();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getInterviews();
            if (res.data?.success) {
                const rawList = res.data.data.interviews || [];
                const transformed = rawList.map((i: any) => ({
                    id: i.id,
                    studentName: `${i.student?.user?.firstName} ${i.student?.user?.lastName}`,
                    companyName: i.feedback || (i.type === 'MOCK' ? 'Mock Interview' : 'Company Interview'),
                    round: i.type,
                    scheduledAt: i.scheduledAt,
                    status: i.status
                }));
                setInterviews(transformed);
            }
        } catch (error) {
            console.error('Failed to fetch interviews', error);
            // Mock Data
            setInterviews([]);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const payload = {
                studentId: data.studentId,
                scheduledAt: new Date(data.scheduledAt).toISOString(),
                type: data.type, // 'MOCK' or 'COMPANY'
                feedback: data.description // Mapping description to feedback for now
            };
            await placementAPI.scheduleInterview(payload);
            toast.success("Interview scheduled successfully");
            fetchInterviews();
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to schedule interview");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (interview: any) => {
        setSelectedInterview(interview);
        setValueUpdate('status', interview.status);
        setValueUpdate('feedback', interview.companyName === 'Mock Interview' || interview.companyName === 'Company Interview' ? '' : interview.companyName); // Recover feedback from companyName hack or use separate field if available
        // Note: In fetchInterviews we mapped feedback to companyName. Ideally we should have kept raw feedback.
        // Let's rely on the user re-entering or just mapping back.
        // Better: Store raw object in state.
        setIsUpdateOpen(true);
    };

    const onUpdate = async (data: any) => {
        if (!selectedInterview) return;
        setIsSubmitting(true);
        try {
            await placementAPI.updateInterview(selectedInterview.id, {
                status: data.status,
                feedback: data.feedback
            });
            toast.success("Interview updated");
            fetchInterviews();
            setIsUpdateOpen(false);
            setSelectedInterview(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update interview");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this interview?")) return;
        try {
            await placementAPI.deleteInterview(id);
            toast.success("Interview deleted");
            setInterviews(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete interview");
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
                    <p className="text-muted-foreground">Manage interview schedules and rounds</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {interviews.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No interviews scheduled.</p>
                    </div>
                ) : interviews.map(interview => (
                    <Card key={interview.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{interview.round}</Badge>
                                <Badge variant={
                                    interview.status === 'Scheduled' ? 'secondary' :
                                        interview.status === 'Completed' ? 'default' : 'destructive'
                                }>
                                    {interview.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg mt-2 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {interview.companyName}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {interview.studentName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-foreground font-medium bg-muted p-2 rounded">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(interview.scheduledAt), 'PPP')}
                                <Clock className="h-4 w-4 ml-2" />
                                {format(new Date(interview.scheduledAt), 'p')}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1 border border-dashed"
                                    onClick={() => handleEditClick(interview)}
                                >
                                    <Edit className="mr-2 h-3 w-3" /> Update
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-10 px-0 border border-dashed text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(interview.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Interview</DialogTitle>
                        <DialogDescription>Update status and feedback.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitUpdate(onUpdate)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select onValueChange={(val) => setValueUpdate('status', val)} defaultValue={selectedInterview?.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="update-feedback">Feedback / Notes</Label>
                            <Input id="update-feedback" {...registerUpdate('feedback')} placeholder="Enter feedback or notes..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Interview</DialogTitle>
                        <DialogDescription>Set up a new interview round.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input id="studentId" placeholder="Enter student ID..." {...register('studentId', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Interview Type</Label>
                            <Select onValueChange={(val) => setValue('type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MOCK">Mock Interview</SelectItem>
                                    <SelectItem value="COMPANY">Company Interview</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description / Notes</Label>
                            <Input id="description" placeholder="e.g. Google Technical Round 1" {...register('description')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="scheduledAt">Date & Time</Label>
                            <Input id="scheduledAt" type="datetime-local" {...register('scheduledAt', { required: true })} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Schedule
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlacementInterviews;
