/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Mail, Search, RefreshCw, ExternalLink, User } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { format } from 'date-fns';
import { placementAPI, authAPI } from '../../services/api'; // Use placementAPI
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const PlacementMails = () => {
    const [mails, setMails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMail, setSelectedMail] = useState<any>(null);

    useEffect(() => {
        fetchMails();
    }, []);

    const fetchMails = async () => {
        setLoading(true);
        try {
            const res = await placementAPI.getEmails();
            if (res.data?.success) {
                setMails(res.data.data.emails);
            }
        } catch (error) {
            console.error('Failed to fetch mails', error);
            toast.error("Failed to load emails");
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGmail = async () => {
        try {
            const { data } = await authAPI.getGmailAuthUrl();
            if (data.success && data.data.authUrl) {
                window.location.href = data.data.authUrl;
            } else {
                toast.error("Failed to get Gmail connection URL");
            }
        } catch (error) {
            console.error("Gmail connect error", error);
            toast.error("Failed to initiate Gmail connection");
        }
    };

    const filteredMails = mails.filter(mail =>
        mail.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mail.sender?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col animate-in fade-in duration-500">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                    <p className="text-muted-foreground">Manage your communications</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchMails} size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleConnectGmail} variant="secondary">
                        <Mail className="mr-2 h-4 w-4" />
                        Connect Gmail
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
                {/* Mail List */}
                <Card className="md:col-span-1 flex flex-col h-full overflow-hidden">
                    <CardHeader className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search emails..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="flex flex-col divide-y">
                            {filteredMails.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No emails found.
                                </div>
                            ) : (
                                filteredMails.map((mail) => (
                                    <button
                                        key={mail.id}
                                        onClick={() => setSelectedMail(mail)}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-4 text-left transition-colors hover:bg-muted/50",
                                            selectedMail?.id === mail.id && "bg-muted"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-semibold text-sm truncate max-w-[150px]">
                                                {mail.sender?.firstName ? `${mail.sender.firstName} ${mail.sender.lastName}` : (mail.fromEmail || 'Unknown')}
                                            </span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {mail.receivedAt && format(new Date(mail.receivedAt), 'MMM d')}
                                            </span>
                                        </div>
                                        <span className="font-medium text-sm truncate w-full text-foreground/90">
                                            {mail.subject || '(No Subject)'}
                                        </span>
                                        <span className="text-xs text-muted-foreground line-clamp-2 w-full">
                                            {mail.body?.substring(0, 100)}...
                                        </span>
                                        <Badge variant="outline" className="mt-2 text-[10px] h-5 px-1.5">
                                            {mail.category || 'INBOX'}
                                        </Badge>
                                    </button>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Mail Detail */}
                <Card className="md:col-span-2 flex flex-col h-full overflow-hidden">
                    {selectedMail ? (
                        <>
                            <CardHeader className="p-6 border-b flex-shrink-0">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{selectedMail.subject}</CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                                                <User className="h-3 w-3" />
                                                <span>{selectedMail.sender?.firstName ? `${selectedMail.sender.firstName} ${selectedMail.sender.lastName}` : selectedMail.fromEmail}</span>
                                            </div>
                                            <span>to me</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {selectedMail.receivedAt && format(new Date(selectedMail.receivedAt), 'PP p')}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 overflow-y-auto">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {selectedMail.body}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 border-t flex-shrink-0 bg-muted/20 justify-end gap-2">
                                {/* Reply buttons etc could go here */}
                                {selectedMail.gmailMessageId && (
                                    <Button variant="outline" size="sm" onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${selectedMail.gmailMessageId}`, '_blank')}>
                                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                        Open in Gmail
                                    </Button>
                                )}
                            </CardFooter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                            <Mail className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select an email to read</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PlacementMails;
