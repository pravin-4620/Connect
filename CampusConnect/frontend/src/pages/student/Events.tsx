import { useState } from 'react';
import { Calendar, dateFnsLocalizer, type View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { studentAPI } from '../../services/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import type { Event } from '../../types';
import { useQuery } from '../../hooks/useQuery';

// Setup localizer
const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Mock Data
const MOCK_EVENTS: Event[] = [
    {
        id: '1',
        title: 'Tech Talk: AI Futures',
        description: 'A deep dive into the future of AI in software engineering.',
        eventDate: new Date(Date.now() + 172800000).toISOString(),
        location: 'Auditorium A',
        maxParticipants: 200,
        registeredCount: 45,
        createdById: 'admin',
        createdByRole: 'ADMIN',
        status: 'UPCOMING',
        registration: undefined
    },
    {
        id: '2',
        title: 'Coding Workshop',
        description: 'Hands-on React workshop for beginners.',
        eventDate: new Date(Date.now() + 604800000).toISOString(),
        location: 'Lab 2',
        maxParticipants: 50,
        registeredCount: 50, // Full
        createdById: 'mentor',
        createdByRole: 'MENTOR',
        status: 'UPCOMING',
        registration: { id: 'r2', eventId: '2', studentId: 'me', status: 'APPROVED', appliedAt: new Date().toISOString() }
    }
];

const StudentEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [view, setView] = useState<View>(Views.MONTH);

    const { loading, refetch } = useQuery<{ events: Event[] }>(() => studentAPI.getEvents(), {
        onSuccess: (data) => {
            const eventList = Array.isArray(data) ? data : (data?.events || []);
            setEvents(eventList);
        },
        onError: () => {
            toast.error("Failed to load events");
            setEvents(MOCK_EVENTS);
        }
    });

    const handleEventSelect = (calendarEvent: { resource: Event }) => {
        // calendarEvent.resource contains the full event object
        setSelectedEvent(calendarEvent.resource);
        setIsDetailOpen(true);
    };

    const handleRegister = async () => {
        if (!selectedEvent) return;
        setRegistering(true);
        try {
            await studentAPI.registerForEvent(selectedEvent.id);
            toast.success("Registered successfully");

            // Update local state optimistic
            setEvents(prev => prev.map(e =>
                e.id === selectedEvent.id
                    ? {
                        ...e,
                        registeredCount: (e.registeredCount || 0) + 1,
                        registration: { id: 'temp', eventId: e.id, studentId: 'me', status: 'PENDING', appliedAt: new Date().toISOString() }
                    } as Event
                    : e
            ));
            setIsDetailOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to register for event");
        } finally {
            setRegistering(false);
        }
    };

    // Transform events for Calendar
    const calendarEvents = events.map(event => ({
        title: event.title,
        start: new Date(event.eventDate),
        end: new Date(new Date(event.eventDate).getTime() + (2 * 60 * 60 * 1000)), // Assume 2 hours duration
        resource: event,
    }));

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
                    <p className="text-muted-foreground">Upcoming workshops, seminars, and activities</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    Refresh
                </Button>
            </div>

            <Card className="h-[600px] border shadow-sm">
                <CardContent className="h-full p-4">
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        onSelectEvent={handleEventSelect}
                        views={['month', 'week', 'day', 'agenda']}
                        view={view}
                        onView={setView}
                        date={new Date()}
                        popup
                        step={60}
                        showMultiDayTimes
                        eventPropGetter={(event: { resource: Event }) => {
                            const isRegistered = !!(event.resource as Event).registration;
                            return {
                                className: isRegistered ? 'bg-green-500 border-green-600' : 'bg-primary border-primary'
                            };
                        }}
                    />
                </CardContent>
            </Card>

            {/* Event Detail Modal */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="z-[100]">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                            <CalendarIcon className="h-4 w-4" />
                            {selectedEvent && format(new Date(selectedEvent.eventDate), 'MMMM d, yyyy h:mm a')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/40 rounded-lg flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Location</p>
                                        <p className="text-xs text-muted-foreground">{selectedEvent.location || 'TBA'}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-muted/40 rounded-lg flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Participants</p>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedEvent.registeredCount}/{selectedEvent.maxParticipants || '∞'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Description</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {selectedEvent.description}
                                </p>
                            </div>

                            {selectedEvent.registration ? (
                                <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium text-center">
                                    You are registered for this event.
                                    <br />
                                    <span className="text-xs opacity-75">Status: {selectedEvent.registration.status}</span>
                                </div>
                            ) : (
                                selectedEvent.maxParticipants && (selectedEvent.registeredCount || 0) >= selectedEvent.maxParticipants ? (
                                    <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium text-center">
                                        Event Full
                                    </div>
                                ) : (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 rounded-lg text-sm text-center">
                                        Click register to secure your spot.
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {selectedEvent?.registration ? (
                            <Button variant="outline" disabled className="w-full">Already Registered</Button>
                        ) : selectedEvent?.maxParticipants && (selectedEvent.registeredCount || 0) >= selectedEvent.maxParticipants ? (
                            <Button variant="destructive" disabled className="w-full">Full</Button>
                        ) : (
                            <Button className="w-full" onClick={handleRegister} disabled={registering}>
                                {registering && <LoadingSpinner fullScreen={false} className="mr-2 h-4 w-4" />}
                                Register Now
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StudentEvents;
