/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { placementAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const PlacementAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getAnnouncements();
            if (res.data?.success) {
                setAnnouncements(res.data.data.announcements);
            }
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await placementAPI.createAnnouncement({
                ...data,
                priority: data.priority || 'MEDIUM'
            });
            toast.success("Announcement created");
            fetchAnnouncements();
            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await placementAPI.deleteAnnouncement(id);
            toast.success("Announcement deleted");
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete announcement");
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">Broadcast updates to students</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Announcement
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {announcements.map((ann) => (
                    <Card key={ann.id} className="flex flex-col">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold leading-tight">
                                    {ann.title}
                                </CardTitle>
                                <Badge variant={ann.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                                    {ann.priority}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <CardDescription className="flex items-center text-xs">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {format(new Date(ann.createdAt), 'PPP')}
                                </CardDescription>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ann.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {ann.content}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Announcement</DialogTitle>
                        <DialogDescription>Send a notification to all eligible students.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" placeholder="e.g. Resume Submission Deadline" {...register('title', { required: true })} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select onValueChange={(val) => setValue('priority', val)} defaultValue="MEDIUM">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                placeholder="Details of the announcement..."
                                className="min-h-[100px]"
                                {...register('content', { required: true })}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Post
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default PlacementAnnouncements;
