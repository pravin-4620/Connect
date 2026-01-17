/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { studentAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useQuery } from '../../hooks/useQuery';
import { Search, Mail, Star, Archive, Trash2, Reply } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const StudentMails = () => {
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, loading } = useQuery<any>(() => studentAPI.getEmails(), {
        onError: () => {
            toast.error("Failed to fetch emails");
        }
    });

    const mockMails = useMemo(() => [
        {
            id: '1',
            sender: { name: 'Dr. John Smith', email: 'john.smith@campusconnect.edu' },
            subject: 'Re: Project Submission Deadline',
            preview: 'Yes, you can submit the project by Monday morning without any penalty...',
            content: 'Dear Student,\n\nYes, you can submit the project by Monday morning without any penalty. Please make sure to include the documentation as well.\n\nRegards,\nDr. John Smith',
            date: new Date().toISOString(),
            isRead: false,
            labels: ['Important']
        },
        {
            id: '2',
            sender: { name: 'Placement Cell', email: 'placements@campusconnect.edu' },
            subject: 'Upcoming Google Recruitment Drive',
            preview: 'We are excited to announce that Google will be visiting our campus...',
            content: 'Dear Students,\n\nWe are excited to announce that Google will be visiting our campus on the 25th of this month. Please update your resumes and register on the portal.\n\nBest,\nPlacement Cell',
            date: new Date(Date.now() - 86400000).toISOString(),
            isRead: true,
            labels: ['Placement']
        },
        {
            id: '3',
            sender: { name: 'Library', email: 'library@campusconnect.edu' },
            subject: 'Overdue Book Reminder',
            preview: 'This is a reminder that the book "Clean Code" is overdue...',
            content: 'This is a reminder that the book "Clean Code" is overdue. Please return it as soon as possible to avoid fines.',
            date: new Date(Date.now() - 172800000).toISOString(),
            isRead: true,
            labels: []
        }
    ], []);

    const mails = (data && Array.isArray(data)) ? data : (data?.data?.emails || mockMails);

    const filteredMails = mails.filter((m: any) =>
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 animate-in fade-in duration-500">
            {/* Mail List */}
            <div className={`w-full md:w-1/3 flex flex-col gap-2 ${selectedMail ? 'hidden md:flex' : 'flex'}`}>
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search emails..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredMails.map((mail: any) => (
                        <Card
                            key={mail.id}
                            className={`p-3 cursor-pointer transition-colors hover:bg-accent ${selectedMail?.id === mail.id ? 'bg-accent border-primary' : ''} ${!mail.isRead ? 'font-medium' : ''}`}
                            onClick={() => setSelectedMail(mail)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold truncate">{mail.sender.name}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(mail.date), 'MMM d')}
                                </span>
                            </div>
                            <div className="text-sm font-medium mb-1 truncate">{mail.subject}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{mail.preview}</div>
                            {mail.labels && mail.labels.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    {mail.labels.map((label: string) => (
                                        <Badge key={label} variant="outline" className="text-[10px] h-5">{label}</Badge>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>

            {/* Mail View */}
            <Card className={`w-full md:w-2/3 flex-col ${selectedMail ? 'flex' : 'hidden md:flex'}`}>
                {selectedMail ? (
                    <>
                        <div className="p-4 border-b flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold mb-2">{selectedMail.subject}</h2>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {selectedMail.sender.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{selectedMail.sender.name}</div>
                                        <div className="text-xs text-muted-foreground">{selectedMail.sender.email}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-xs">{format(new Date(selectedMail.date), 'MMM d, h:mm a')}</span>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedMail(null)} className="md:hidden">
                                    <span className="sr-only">Back</span>
                                    {/* Back Icon if needed */}
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap">
                            {selectedMail.content}
                        </div>
                        <div className="p-4 border-t flex gap-2">
                            <Button className="gap-2">
                                <Reply className="w-4 h-4" /> Reply
                            </Button>
                            <Button variant="outline" size="icon">
                                <Star className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <Archive className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <Mail className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select an email to read</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StudentMails;
