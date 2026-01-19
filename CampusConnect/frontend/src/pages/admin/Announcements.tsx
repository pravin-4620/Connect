/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
import { Plus, Trash2, Calendar, Users, Archive } from 'lucide-react';
import { format } from 'date-fns';

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        fetchAnnouncements();
    }, [activeTab]);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getAnnouncements({ archived: activeTab === 'archived' });
            if (res.data?.success) {
                setAnnouncements(res.data.data.announcements || []);
            }
        } catch (error) {
            console.error(error);
            setAnnouncements([]);
            toast.error("Failed to fetch announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await adminAPI.deleteAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            toast.success("Announcement deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete announcement");
        }
    };

    const handleArchive = async (id: string) => {
        if (!confirm("Are you sure you want to archive this announcement?")) return;
        try {
            await adminAPI.archiveAnnouncement(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            toast.success("Announcement archived");
        } catch (error) {
            console.error(error);
            toast.error("Failed to archive announcement");
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await adminAPI.createAnnouncement(data);
            if (res.data?.success) {
                toast.success("Announcement created successfully");
                if (activeTab === 'active') {
                    setAnnouncements(prev => [res.data.data.announcement, ...prev]);
                }
                setIsCreateOpen(false);
                reset();
                setValue('priority', 'MEDIUM');
                setValue('targetRole', 'ALL');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-orange-100 text-orange-800';
            case 'LOW': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const AnnouncementGrid = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {announcements.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground">
                    No {activeTab} announcements found.
                </div>
            ) : (
                announcements.map((announcement) => (
                    <Card key={announcement.id} className="flex flex-col animate-in fade-in duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <CardTitle className="line-clamp-2">{announcement.title}</CardTitle>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className={getPriorityColor(announcement.priority)}>{announcement.priority}</Badge>
                                        <Badge variant="outline">{announcement.targetRole || 'ALL USERS'}</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {activeTab === 'active' && (
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-blue-600 shrink-0" onClick={() => handleArchive(announcement.id)} title="Archive">
                                            <Archive className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDelete(announcement.id)} title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                                {announcement.content}
                            </p>
                        </CardContent>
                        <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex justify-between">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                            </div>
                            {announcement.createdBy && (
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {announcement.createdBy.firstName}
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                ))
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">Broadcast messages to users</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Announcement
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="active">Active Announcements</TabsTrigger>
                    <TabsTrigger value="archived">Archived History</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {loading ? <LoadingSpinner fullScreen={false} /> : <AnnouncementGrid />}
                </div>
            </Tabs>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Announcement</DialogTitle>
                        <DialogDescription>Send a message to all users or specific roles.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" {...register('title', { required: 'Title is required' })} />
                            {errors.title && <p className="text-xs text-red-500">{errors.title.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                className="min-h-[100px]"
                                {...register('content', { required: 'Content is required' })}
                            />
                            {errors.content && <p className="text-xs text-red-500">{errors.content.message as string}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Audience</Label>
                                <Select
                                    defaultValue="ALL"
                                    onValueChange={(val) => setValue('targetRole', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Users</SelectItem>
                                        <SelectItem value="ADMIN">Admins</SelectItem>
                                        <SelectItem value="STUDENT">Students</SelectItem>
                                        <SelectItem value="MENTOR">Mentors</SelectItem>
                                        <SelectItem value="PLACEMENT_OFFICER">Placement Officers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    defaultValue="MEDIUM"
                                    onValueChange={(val) => setValue('priority', val)}
                                >
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
        </div>
    );
};

export default AdminAnnouncements;
