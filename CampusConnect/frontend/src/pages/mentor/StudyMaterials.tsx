/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
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
import { Plus, BookOpen, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '../../hooks/useQuery';
import FileUpload from '../../components/common/FileUpload';

const MentorStudyMaterials = () => {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const { data: materials, loading, refetch } = useQuery<any>(() => mentorAPI.getStudyMaterials(), {
        onError: () => toast.error("Failed to fetch study materials")
    });

    const handleFileSelect = (file: File) => {
        setFileToUpload(file);
    };

    const onUploadSubmit = async (data: any) => {
        if (!fileToUpload) {
            toast.error("Please select a file");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('subject', data.subject);
        formData.append('year', data.year);
        formData.append('file', fileToUpload);

        try {
            await mentorAPI.uploadStudyMaterial(formData);
            toast.success("Material uploaded successfully");
            setIsUploadOpen(false);
            reset();
            setFileToUpload(null);
            refetch();
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload material");
        } finally {
            setIsSubmitting(false);
        }
    };

    const materialList = (materials && Array.isArray(materials)) ? materials : (materials?.materials || []);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
                    <p className="text-muted-foreground">Share resources and notes with students</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Upload Material
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {materialList.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No study materials uploaded yet.</p>
                    </div>
                ) : (
                    materialList.map((material: any) => (
                        <Card key={material.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary mr-3">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg line-clamp-1" title={material.title}>{material.title}</CardTitle>
                                        <CardDescription className="line-clamp-1">{material.subject} • Year {material.year}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {material.description || "No description provided."}
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                    Uploaded: {format(new Date(material.createdAt), 'MMM d, yyyy')}
                                </p>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={material.fileUrl} target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Download
                                    </a>
                                </Button>
                                {/* Delete functionality could be added here */}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {/* Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>Upload Study Material</DialogTitle>
                        <DialogDescription>Share notes, PDFs, or slides with your students.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...register('title', { required: true })} placeholder="e.g. Data Structures Unit 1" />
                            {errors.title && <span className="text-xs text-red-500">Title is required</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" {...register('description')} placeholder="Brief overview..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" {...register('subject', { required: true })} placeholder="e.g. CS101" />
                                {errors.subject && <span className="text-xs text-red-500">Required</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input id="year" type="number" min="1" max="4" {...register('year', { required: true })} placeholder="1-4" />
                                {errors.year && <span className="text-xs text-red-500">Required</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Document</Label>
                            <FileUpload
                                onFileSelect={handleFileSelect}
                                accept=".pdf,.ppt,.pptx,.doc,.docx"
                                maxSizeMB={10}
                                description="PDF, PPT, DOC (Max 10MB)"
                                label=""
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting || !fileToUpload}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />} Upload
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MentorStudyMaterials;
