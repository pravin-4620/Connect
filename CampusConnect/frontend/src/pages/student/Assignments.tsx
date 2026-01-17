import { useState } from 'react';
import { studentAPI } from '../../services/api';
import { uploadService } from '../../services/upload';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { Calendar, CheckCircle, Clock, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Assignment } from '../../types';
import { useQuery } from '../../hooks/useQuery';
import FileUpload from '../../components/common/FileUpload';

// Function to get mock data to avoid duplication in onError
const getMockAssignments = (): Assignment[] => [
    {
        id: '1',
        title: 'Data Structures Implementation',
        description: 'Implement AVL Tree in C++ with rotation logic.',
        subject: 'Data Structures',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        mentor: { user: { firstName: 'Dr.', lastName: 'Smith' } } as any,
        mentorId: 'm1',
        createdAt: new Date().toISOString(),
        submission: undefined
    },
    {
        id: '2',
        title: 'React Project Proposal',
        description: 'Submit a 2-page proposal for your final year project.',
        subject: 'Web Development',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        mentor: { user: { firstName: 'Prof.', lastName: 'Doe' } } as any,
        mentorId: 'm2',
        createdAt: new Date().toISOString(),
        submission: {
            id: 'sub1',
            assignmentId: '2',
            studentId: 'me',
            submittedAt: new Date(Date.now() - 90000000).toISOString(),
            submissionUrl: '#'
        }
    }
];

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const { loading } = useQuery<{ assignments: Assignment[] }>(() => studentAPI.getAssignments(), {
        onSuccess: (data) => {
            // Flexible handling for response structure
            const list = Array.isArray(data) ? data : (data?.assignments || []);
            setAssignments(list);
        },
        onError: () => {
            toast.error("Failed to load assignments");
            setAssignments(getMockAssignments());
        }
    });

    const handleOpenSubmit = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFileToUpload(null);
        setIsSubmitOpen(true);
    };

    const handleFileSelect = (file: File) => {
        setFileToUpload(file);
    };

    const handleFileRemove = () => {
        setFileToUpload(null);
    };

    const handleSubmitAssignment = async () => {
        if (!selectedAssignment || !fileToUpload) return;

        setUploading(true);
        try {
            // Note: studentAPI.submitAssignment expects FormData, but uploadService might be better or direct API call
            // Using logic from original code:
            await uploadService.uploadAssignment(selectedAssignment.id, fileToUpload, () => {
                // Progress handled by FileUpload potentially, but verify
            });

            toast.success("Assignment submitted successfully");

            // Optimistic Update
            setAssignments(prev => prev.map(a =>
                a.id === selectedAssignment.id
                    ? {
                        ...a,
                        submission: {
                            id: 'temp-' + Date.now(),
                            assignmentId: a.id,
                            studentId: 'me',
                            submissionUrl: URL.createObjectURL(fileToUpload),
                            submittedAt: new Date().toISOString(),
                            grade: undefined,
                            feedback: undefined
                        }
                    }
                    : a
            ));
            setIsSubmitOpen(false);
            setFileToUpload(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit assignment");
        } finally {
            setUploading(false);
        }
    };

    const pendingAssignments = assignments.filter(a => !a.submission);
    const submittedAssignments = assignments.filter(a => a.submission);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">Manage your coursework and submissions</p>
                </div>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
                    <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingAssignments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50 text-green-500" />
                            <p>No pending assignments! Good job.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingAssignments.map(assignment => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    onSubmit={() => handleOpenSubmit(assignment)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="submitted" className="space-y-4">
                    {submittedAssignments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No submitted assignments yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {submittedAssignments.map(assignment => (
                                <AssignmentCard
                                    key={assignment.id}
                                    assignment={assignment}
                                    isSubmitted
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Submit Modal */}
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        <DialogDescription>
                            Upload your work for <strong>{selectedAssignment?.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full py-4">
                        {uploading ? (
                            <div className="flex flex-col items-center justify-center p-8">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                                <p className="text-sm font-medium">Uploading & Submitting...</p>
                            </div>
                        ) : (
                            <FileUpload
                                onFileSelect={handleFileSelect}
                                onFileRemove={handleFileRemove}
                                accept=".pdf,.doc,.docx"
                                maxSizeMB={10}
                                description="PDF or DOCX (Max 10MB)"
                            />
                        )}
                    </div>

                    {!uploading && (
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsSubmitOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmitAssignment} disabled={!fileToUpload}>Submit Assignment</Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const AssignmentCard = ({ assignment, onSubmit, isSubmitted = false }: { assignment: Assignment, onSubmit?: () => void, isSubmitted?: boolean }) => {
    const isOverdue = !isSubmitted && new Date(assignment.dueDate) < new Date();

    return (
        <Card className={`flex flex-col ${isOverdue ? 'border-red-200 bg-red-50/10' : ''}`}>
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={isSubmitted ? "secondary" : (isOverdue ? "destructive" : "outline")}>
                        {isSubmitted ? (assignment.submission?.grade ? 'Graded' : 'Submitted') : (isOverdue ? 'Overdue' : 'Pending')}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        {assignment.subject}
                    </span>
                </div>
                <CardTitle className="text-lg line-clamp-2 leading-snug">{assignment.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {assignment.description}
                </p>
                {assignment.mentor?.user && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                        Assigned by: {assignment.mentor.user.firstName} {assignment.mentor.user.lastName}
                    </p>
                )}
                {isSubmitted && assignment.submission?.grade && (
                    <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-100 rounded text-center">
                        <p className="text-xs text-green-800 dark:text-green-300 font-semibold uppercase tracking-wider">Grade</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{assignment.submission.grade}/100</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {isSubmitted ? (
                    <Button variant="outline" className="w-full" asChild>
                        <a href={assignment.submission?.submissionUrl} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" /> View Submission
                        </a>
                    </Button>
                ) : (
                    <Button className="w-full" onClick={onSubmit} variant={isOverdue ? "destructive" : "default"}>
                        {isOverdue ? 'Submit Late' : 'Submit Now'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

export default StudentAssignments;
