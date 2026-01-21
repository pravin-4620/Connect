import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { bugReportAPI } from '../../services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const bugReportSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

interface ReportBugModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ReportBugModal: React.FC<ReportBugModalProps> = ({ open, onOpenChange }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<BugReportFormData>({
        resolver: zodResolver(bugReportSchema),
        defaultValues: {
            priority: 'MEDIUM'
        }
    });

    const onSubmit = async (data: BugReportFormData) => {
        setIsSubmitting(true);
        try {
            await bugReportAPI.submitReport(data);
            toast.success('Bug report submitted successfully', {
                description: 'Our team will review it shortly.'
            });
            reset();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to submit bug report', {
                description: error.response?.data?.message || 'Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Report a Bug or Issue</DialogTitle>
                    <DialogDescription>
                        Help us improve by reporting any bugs or issues you encounter.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="Brief summary of the issue"
                        />
                        {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Describe the issue in detail. Include steps to reproduce if applicable."
                            className="resize-none h-32"
                        />
                        {errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select defaultValue="MEDIUM" onValueChange={(value) => setValue('priority', value as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Report
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReportBugModal;
