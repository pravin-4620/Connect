/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { mentorAPI } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
import { Plus, Calendar, MapPin, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Event } from '../../types';
import { useQuery } from '../../hooks/useQuery';

interface EventForm {
    title: string;
    description: string;
    eventDate: string;
    location: string;
    maxParticipants: number;
}

const MentorEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EventForm>();

    const { loading } = useQuery<any>(() => mentorAPI.getEvents(), {
        onSuccess: (data) => {
            const list = Array.isArray(data) ? data : (data?.data?.events || data?.events || []);
            const safeList = Array.isArray(list) ? list : [];
            setEvents(safeList);
        },
        onError: () => {
            // Mock Data
            const mockEvents: any[] = [
                {
                    id: '1',
                    title: 'Tech Talk: AI Futures',
                    description: 'A deep dive into the future of AI in software engineering.',
                    eventDate: new Date(Date.now() + 172800000).toISOString(),
                    location: 'Auditorium A',
                    maxParticipants: 200,
                    registeredCount: 45
                },
                {
                    id: '2',
                    title: 'Coding Workshop',
                    description: 'Hands-on React workshop for beginners.',
                    eventDate: new Date(Date.now() + 604800000).toISOString(),
                    location: 'Lab 2',
                    maxParticipants: 50,
                    registeredCount: 50
                }
            ];
            setEvents(mockEvents);
            toast.error("Failed to load events (using mock)");
        }
    });

    const onSubmit = async (data: EventForm) => {
        setIsSubmitting(true);
        try {
            await mentorAPI.createEvent(data);
            toast.success("Event created successfully");

            // Optimistic update
            setEvents(prev => [{
                id: 'temp-' + Date.now(),
                ...data,
                organizerId: 'me',
                registeredCount: 0,
                createdAt: new Date().toISOString()
            } as any, ...prev]);

            setIsCreateOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create event");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await mentorAPI.deleteEvent(id);
            toast.success("Event deleted");
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete event");
        }
    };

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
                    <p className="text-muted-foreground">Schedule and manage workshops and seminars</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Event
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                        <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No events scheduled. Create one to get started.</p>
                    </div>
                ) : events.map(event => (
                    <Card key={event.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(event.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(event.eventDate), 'PPP p')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {event.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> {event.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {event.registeredCount || 0}/{event.maxParticipants || '∞'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-lg z-[100]">
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>Fill in the details for the new event.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input id="title" {...register('title', { required: 'Title is required' })} />
                            {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description', { required: 'Description is required' })} />
                            {errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventDate">Date & Time</Label>
                                <Input id="eventDate" type="datetime-local" {...register('eventDate', { required: 'Date is required' })} />
                                {errors.eventDate && <span className="text-xs text-destructive">{errors.eventDate.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" {...register('location', { required: 'Location is required' })} />
                                {errors.location && <span className="text-xs text-destructive">{errors.location.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxParticipants">Max Participants</Label>
                            <Input
                                id="maxParticipants"
                                type="number"
                                {...register('maxParticipants', { required: 'Required', min: 1 })}
                            />
                            {errors.maxParticipants && <span className="text-xs text-destructive">{errors.maxParticipants.message}</span>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Create Event
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MentorEvents;
