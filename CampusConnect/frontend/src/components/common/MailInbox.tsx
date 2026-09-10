/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Archive, Download, ExternalLink, Mail, Paperclip, RefreshCw, Search, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { mailAPI, authAPI } from '../../services/api';
import { socketService } from '../../services/socket';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import LoadingSpinner from './LoadingSpinner';

const categories = ['ALL', 'FOCUS', 'PLACEMENT', 'ACADEMIC', 'WORK', 'FINANCE', 'SHOPPING', 'TRAVEL', 'SOCIAL', 'SOCIAL_MEDIA', 'LEARNING', 'RECEIPTS', 'SECURITY', 'PROMOTIONS', 'NEWSLETTERS', 'SPAM', 'REVIEW'];
const syncWindows = [
    { label: 'All mail', value: 'all' },
    { label: '1 year', value: 'newer_than:1y' },
    { label: '2 months', value: 'newer_than:2m' },
    { label: '30 days', value: 'newer_than:30d' },
    { label: '7 days', value: 'newer_than:7d' },
];

const attachmentSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const htmlWithClickableLinks = (html: string) => `<base target="_blank" />${html}`;

function PlainEmailBody({ text }: { text?: string }) {
    const parts = String(text || '').split(/(https?:\/\/[^\s<>"']+)/g);
    return (
        <div className="p-6 whitespace-pre-wrap">
            {parts.map((part, index) => /^https?:\/\//i.test(part)
                ? <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="text-primary underline break-all">{part}</a>
                : <span key={`${part}-${index}`}>{part}</span>)}
        </div>
    );
}

function AttachmentPreview({ emailId, attachment }: { emailId: string; attachment: any }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const previewable = attachment.mimeType?.startsWith('image/') || attachment.mimeType?.startsWith('video/') || attachment.mimeType?.startsWith('audio/') || attachment.mimeType === 'application/pdf';
        if (!previewable) return;
        let active = true;
        let objectUrl: string | null = null;
        mailAPI.downloadAttachment(emailId, attachment.attachmentId).then((response) => {
            if (!active) return;
            objectUrl = window.URL.createObjectURL(response.data);
            setUrl(objectUrl);
        }).catch(() => undefined);
        return () => {
            active = false;
            if (objectUrl) window.URL.revokeObjectURL(objectUrl);
        };
    }, [emailId, attachment.attachmentId, attachment.mimeType]);

    if (!url) return null;
    if (attachment.mimeType?.startsWith('image/')) {
        return <img src={url} alt={attachment.filename || 'Attachment'} className="mt-3 max-h-80 w-full rounded-md border object-contain bg-muted/20" />;
    }
    if (attachment.mimeType?.startsWith('video/')) {
        return <video src={url} controls className="mt-3 max-h-80 w-full rounded-md border bg-black" />;
    }
    if (attachment.mimeType?.startsWith('audio/')) {
        return <audio src={url} controls className="mt-3 w-full" />;
    }
    return <iframe title={attachment.filename || 'PDF attachment'} src={url} className="mt-3 h-80 w-full rounded-md border bg-white" />;
}

export default function MailInbox() {
    const [emails, setEmails] = useState<any[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [selected, setSelected] = useState<any>(null);
    const [category, setCategory] = useState('ALL');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [syncWindow, setSyncWindow] = useState('all');
    const [composeOpen, setComposeOpen] = useState(false);
    const [compose, setCompose] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });

    const load = async (nextPage = 1, append = false) => {
        setLoading(true);
        try {
            const [statusResponse, emailResponse] = await Promise.all([
                mailAPI.getStatus(),
                mailAPI.getEmails({ category, search: search || undefined, page: nextPage }),
            ]);
            setStatus(statusResponse.data);
            const nextEmails = emailResponse.data.emails || [];
            setEmails((current) => append ? [...current, ...nextEmails] : nextEmails);
            setPage(emailResponse.data.page || nextPage);
            setPages(emailResponse.data.pages || 1);
            setTotal(emailResponse.data.total || 0);
        } catch {
            toast.error('Could not load Gmail inbox');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setSelected(null); void load(1); }, [category]);

    const connectGmail = async () => {
        try {
            const response = await authAPI.getGmailAuthUrl();
            window.location.href = response.data.data.authUrl;
        } catch {
            toast.error('Gmail is not configured on the backend');
        }
    };

    const sync = async () => {
        setBusy(true);
        try {
            await mailAPI.sync(syncWindow);
            toast.success('Gmail sync started');
            window.setTimeout(() => void load(1), 1200);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Could not start Gmail sync');
        } finally {
            setBusy(false);
        }
    };

    const selectEmail = async (email: any) => {
        setSelected(email);
        if (!email.isRead) {
            await mailAPI.update(email.id, { isRead: true });
            setEmails((current) => current.map((item) => item.id === email.id ? { ...item, isRead: true } : item));
        }
    };

    const searchSubmit = (event: React.FormEvent) => { event.preventDefault(); setSelected(null); void load(1); };
    const loadMore = () => void load(page + 1, true);
    const downloadAttachment = async (attachment: any) => {
        try {
            const response = await mailAPI.downloadAttachment(selected.id, attachment.attachmentId);
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.filename || 'attachment';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Could not download attachment');
        }
    };

    const runAction = async (action: () => Promise<any>, message: string) => {
        try {
            await action();
            toast.success(message);
            setSelected(null);
            await load(1);
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Could not ${message.toLowerCase()}`);
        }
    };

    const submitCompose = async (event: React.FormEvent) => {
        event.preventDefault();
        await runAction(() => mailAPI.send(compose), 'Message sent');
        setCompose({ to: '', cc: '', bcc: '', subject: '', body: '' });
        setComposeOpen(false);
    };

    useEffect(() => {
        const handleNewMail = () => void load(1);
        socketService.on('newMail', handleNewMail);
        return () => socketService.off('newMail', handleNewMail);
    }, [category, search]);

    if (loading && !status) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
                    <p className="text-sm text-muted-foreground">
                        {status?.gmailConnected ? `${status.gmailAddress || 'Gmail connected'} - ${status.mailStatus || 'IDLE'}` : 'Connect Gmail to import and filter your messages'}
                    </p>
                    {status?.mailError && <p className="text-sm text-destructive mt-1">{status.mailError}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                    {status?.gmailConnected && <select value={syncWindow} onChange={(event) => setSyncWindow(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
                        {syncWindows.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>}
                    {status?.gmailConnected && <Button onClick={() => setComposeOpen(true)}><Mail className="mr-2 h-4 w-4" />Compose</Button>}
                    {status?.gmailConnected ? <Button onClick={sync} disabled={busy}><RefreshCw className="mr-2 h-4 w-4" />Sync Gmail</Button> : <Button onClick={connectGmail}><Mail className="mr-2 h-4 w-4" />Connect Gmail</Button>}
                    <Button variant="outline" size="icon" onClick={() => void load(1)} aria-label="Refresh inbox"><RefreshCw className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => <Button key={item} size="sm" variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item.replace('_', ' ')}</Button>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
                <Card className="flex flex-col min-h-0">
                    <form onSubmit={searchSubmit} className="p-3 border-b flex gap-2">
                        <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search emails..." className="pl-8" /></div>
                        <Button type="submit" size="icon" variant="outline" aria-label="Search"><Search className="h-4 w-4" /></Button>
                    </form>
                    <div className="overflow-y-auto divide-y">
                        {!emails.length && <div className="p-8 text-center text-sm text-muted-foreground">{status?.gmailConnected ? 'No filtered emails found.' : 'Connect Gmail to begin filtering.'}</div>}
                        {emails.map((email) => <button key={email.id} onClick={() => void selectEmail(email)} className={`w-full p-3 text-left hover:bg-muted/50 ${selected?.id === email.id ? 'bg-muted' : ''} ${!email.isRead ? 'font-semibold' : ''}`}>
                            <div className="flex justify-between gap-2"><span className="truncate">{email.fromEmail || 'Unknown sender'}</span><span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(email.receivedAt), 'MMM d')}</span></div>
                            <div className="truncate text-sm mt-1">{email.subject || '(No subject)'}</div>
                            <div className="line-clamp-2 text-xs text-muted-foreground mt-1">{email.body || ''}</div>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{email.category || 'REVIEW'}</Badge>
                                {!!email.attachments?.length && <span className="inline-flex items-center text-xs text-muted-foreground"><Paperclip className="mr-1 h-3 w-3" />{email.attachments.length}</span>}
                            </div>
                        </button>)}
                        {page < pages && <div className="p-3"><Button variant="outline" className="w-full" onClick={loadMore} disabled={loading}>Load more {total ? `(${emails.length}/${total})` : ''}</Button></div>}
                    </div>
                </Card>
                <Card className="md:col-span-2 flex flex-col min-h-0">
                        {selected ? <><div className="p-5 border-b"><div className="flex justify-between gap-3"><div><h2 className="text-xl font-bold">{selected.subject || '(No subject)'}</h2><p className="text-sm text-muted-foreground mt-1">{selected.fromEmail}</p><p className="text-xs text-muted-foreground mt-1">To: {selected.toEmail || 'Not available'}</p></div><span className="text-xs text-muted-foreground">{format(new Date(selected.receivedAt), 'PP p')}</span></div><Badge variant="outline" className="mt-3">{selected.category}</Badge></div><div className="overflow-y-auto flex-1">{selected.htmlBody ? <iframe title={selected.subject || 'Email'} sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={htmlWithClickableLinks(selected.htmlBody)} className="h-full min-h-[420px] w-full bg-white" /> : <PlainEmailBody text={selected.body} />}{!!selected.attachments?.length && <div className="border-t p-4"><h3 className="mb-3 text-sm font-semibold">Attachments</h3><div className="grid gap-3 sm:grid-cols-2">{selected.attachments.map((attachment: any) => <div key={attachment.attachmentId} className="rounded-md border p-3"><button type="button" onClick={() => void downloadAttachment(attachment)} className="flex w-full items-center justify-between text-left text-sm"><span className="min-w-0"><span className="block truncate font-medium">{attachment.filename}</span><span className="text-xs text-muted-foreground">{attachment.mimeType} {attachmentSize(attachment.size)}</span></span><Download className="ml-3 h-4 w-4 shrink-0" /></button><AttachmentPreview emailId={selected.id} attachment={attachment} /></div>)}</div></div>}</div><div className="p-4 border-t flex flex-wrap gap-2"><Button variant="outline" size="icon" aria-label="Star" onClick={() => void runAction(() => mailAPI.star(selected.id, true), 'Message starred')}><Star className="h-4 w-4" /></Button><Button variant="outline" onClick={() => void runAction(() => mailAPI.archive(selected.id), 'Message archived')}><Archive className="mr-2 h-4 w-4" />Archive</Button><Button variant="outline" onClick={() => void runAction(() => mailAPI.trash(selected.id), 'Message moved to trash')}><Trash2 className="mr-2 h-4 w-4" />Trash</Button><Button variant="outline" onClick={() => void runAction(() => mailAPI.setRead(selected.id, !selected.isRead), selected.isRead ? 'Message marked unread' : 'Message marked read')}>{selected.isRead ? 'Mark unread' : 'Mark read'}</Button><Button variant="outline" onClick={() => { setCompose({ to: selected.fromEmail, cc: '', bcc: '', subject: `Re: ${selected.subject}`, body: `\n\nOn ${format(new Date(selected.receivedAt), 'PP p')}, ${selected.fromEmail} wrote:\n${selected.body}` }); setComposeOpen(true); }}><Mail className="mr-2 h-4 w-4" />Reply</Button>{selected.gmailMessageId && <Button variant="outline" onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${selected.gmailMessageId}`, '_blank')}><ExternalLink className="mr-2 h-4 w-4" />Open in Gmail</Button>}</div></> : <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground"><Mail className="h-16 w-16 mb-4 opacity-20" /><p>Select an email to read</p></div>}
                </Card>
            </div>
                    {composeOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><Card className="w-full max-w-2xl"><form onSubmit={submitCompose}><div className="flex items-center justify-between border-b p-4"><h2 className="text-lg font-semibold">New message</h2><Button type="button" variant="ghost" onClick={() => setComposeOpen(false)}>Close</Button></div><div className="space-y-3 p-4"><Input required placeholder="To" value={compose.to} onChange={(event) => setCompose({ ...compose, to: event.target.value })} /><Input placeholder="Cc" value={compose.cc} onChange={(event) => setCompose({ ...compose, cc: event.target.value })} /><Input placeholder="Bcc" value={compose.bcc} onChange={(event) => setCompose({ ...compose, bcc: event.target.value })} /><Input required placeholder="Subject" value={compose.subject} onChange={(event) => setCompose({ ...compose, subject: event.target.value })} /><textarea required className="min-h-48 w-full rounded-md border bg-background p-3 text-sm" placeholder="Write your message" value={compose.body} onChange={(event) => setCompose({ ...compose, body: event.target.value })} /></div><div className="flex justify-end gap-2 border-t p-4"><Button type="button" variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button><Button type="submit">Send</Button></div></form></Card></div>}
        </div>
    );
}
