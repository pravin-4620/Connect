import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

const AdminChats = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await adminAPI.getChats();
                if (res.data?.success) {
                    setMessages(res.data.data.messages || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    if (loading) return <LoadingSpinner fullScreen={false} />;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Chat Monitoring</h1>
                <p className="text-muted-foreground">Recent messages across the platform (Last 100)</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Message Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">No messages found.</div>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className="flex flex-col border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start text-sm mb-1">
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <span className="font-semibold text-primary">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">{msg.sender?.role}</Badge>
                                            <span className="text-muted-foreground">to</span>
                                            <span className="font-semibold">{msg.receiver?.firstName} {msg.receiver?.lastName}</span>
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">{msg.receiver?.role}</Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {format(new Date(msg.sentAt), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm pl-0 text-foreground/90 bg-muted/30 p-2 rounded-md mt-1">
                                        {msg.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminChats;
