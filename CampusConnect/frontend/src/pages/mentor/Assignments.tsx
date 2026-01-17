/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Plus, Calendar, FileText, CheckCircle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '../../hooks/useQuery';

const MentorAssignments = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
    const [gradingSubmission, setGradingSubmission] = useState<any>(null); // Submission being graded
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const { data: assignments, loading, refetch } = useQuery<any>(() => mentorAPI.getAssignments(), {
        onError: () => toast.error("Failed to fetch assignments")
    });

    // Handle Create Assignment
    const onCreateSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await mentorAPI.createAssignment(data);
            toast.success("Assignment created successfully");
            setIsCreateOpen(false);
            reset();
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create assignment");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Grading
    const handleGradeSubmit = async () => {
        if (!gradingSubmission) return;
        setIsSubmitting(true);
        try {
            await mentorAPI.gradeSubmission(gradingSubmission.id, {
                grade: parseFloat(grade),
                feedback
            });
            toast.success("Submission graded");
            setGradingSubmission(null);
            setGrade('');
            setFeedback('');
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit grade");
        } finally {
            setIsSubmitting(false);
        }
    };

    const assignmentList = (assignments && Array.isArray(assignments)) ? assignments : (assignments?.assignments || []);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">Create assignments and specific tasks for students</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Assignment
                </Button>
            </div>

            <div className="grid gap-6">
                {assignmentList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No assignments created yet.</p>
                    </div>
                ) : (
                    assignmentList.map((assignment: any) => (
                        <Card key={assignment.id}>
                            <CardHeader className="cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setExpandedAssignmentId(expandedAssignmentId === assignment.id ? null : assignment.id)}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{assignment.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                                            <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Submissions: {assignment.submissions?.length || 0}</span>
                                        </CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        {expandedAssignmentId === assignment.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardHeader>
                            {expandedAssignmentId === assignment.id && (
                                <CardContent className="pt-0">
                                    <div className="p-4 bg-muted/30 rounded-lg mb-4 text-sm">
                                        <p className="font-semibold mb-1">Description:</p>
                                        <p>{assignment.description}</p>
                                        {assignment.attachmentUrl && (
                                            <a href={assignment.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-2 inline-block text-xs">
                                                View Attachment
                                            </a>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-sm mb-3">Student Submissions</h3>
                                    {assignment.submissions && assignment.submissions.length > 0 ? (
                                        <div className="space-y-2">
                                            {assignment.submissions.map((sub: any) => (
                                                <div key={sub.id} className="flex items-center justify-between p-3 border rounded bg-background">
                                                    <div>
                                                        <p className="font-medium text-sm">{sub.student.user.firstName} {sub.student.user.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">Submitted: {format(new Date(sub.submittedAt), 'MMM d, h:mm a')}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {sub.grade ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                Grade: {sub.grade}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Pending Grading</Badge>
                                                        )}
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={sub.submissionUrl} target="_blank" rel="noreferrer">
                                                                <Download className="h-3 w-3" />
                                                            </a>
                                                        </Button>
                                                        <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); setGradingSubmission(sub); setGrade(sub.grade || ''); setFeedback(sub.feedback || ''); }}>
                                                            {sub.grade ? 'Edit Grade' : 'Grade'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No submissions yet.</p>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Create Assignment Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                        <DialogDescription>Set a task for your students.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...register('title', { required: true })} placeholder="Assignment Title" />
                            {errors.title && <span className="text-xs text-red-500">Title is required</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description', { required: true })} placeholder="Detailed instructions..." />
                            {errors.description && <span className="text-xs text-red-500">Description is required</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input id="dueDate" type="datetime-local" {...register('dueDate', { required: true })} />
                            {errors.dueDate && <span className="text-xs text-red-500">Due date is required</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="attachmentUrl">Attachment URL (Optional)</Label>
                            <Input id="attachmentUrl" {...register('attachmentUrl')} placeholder="https://..." />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />} Create
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Grading Dialog */}
            <Dialog open={!!gradingSubmission} onOpenChange={(open) => !open && setGradingSubmission(null)}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                        <DialogDescription>
                            Grading for {gradingSubmission?.student?.user?.firstName}'s submission.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Score (0-100)</Label>
                            <Input type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Feedback</Label>
                            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Good work, but..." />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                            <Button onClick={handleGradeSubmit} disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />} Save Grade
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MentorAssignments;
