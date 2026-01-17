/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { chatAPI, commonAPI } from '../services/api';
import { socketService } from '../services/socket';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { MessageSquare, Send, Plus, Paperclip, FileText as FileIcon, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery } from '../hooks/useQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import type { Message } from '../types';

// Extend Message type for attachments
interface MessageWithAttachment extends Message {
    attachmentUrl?: string;
    attachmentType?: string;
}

interface Conversation {
    partnerId: string;
    partner: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        role: string;
    };
    lastMessage?: MessageWithAttachment;
    unreadCount: number;
}

const Chat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<MessageWithAttachment[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [partners, setPartners] = useState<any[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPartners = async () => {
        setLoadingPartners(true);
        try {
            const res = await chatAPI.getPartners();
            setPartners(res.data.data?.partners || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load users");
        } finally {
            setLoadingPartners(false);
        }
    };

    useEffect(() => {
        if (isNewChatOpen) {
            fetchPartners();
        }
    }, [isNewChatOpen]);

    const handleStartChat = (partner: any) => {
        // Check if conversation already exists
        const existing = conversations.find(c => c.partnerId === partner.id);
        if (existing) {
            setActiveConversation(existing);
        } else {
            // Create temporary conversation object
            const newConv: Conversation = {
                partnerId: partner.id,
                partner: partner,
                unreadCount: 0
            };
            setActiveConversation(newConv);
            // Optionally add to list immediately or wait for message
            setConversations(prev => [newConv, ...prev]);
        }
        setIsNewChatOpen(false);
    };

    const handleDeleteConversation = async (partnerId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation? This will delete all messages permanently.')) return;

        try {
            await chatAPI.deleteConversation(partnerId);
            toast.success('Conversation deleted');
            refetchConversations();
            if (activeConversation?.partnerId === partnerId) {
                setActiveConversation(null);
            }
        } catch (error) {
            console.error('Delete conversation error:', error);
            toast.error('Failed to delete conversation');
        }
    };

    // 1. Fetch Conversations with useQuery
    const { loading: loadingConversations, refetch: refetchConversations } = useQuery<any>(
        () => chatAPI.getConversations(),
        {
            onSuccess: (data) => {
                console.log('Chat conversations response:', data);
                // useQuery unwraps response.data.data -> { conversations: [...] }
                // So we access data.conversations
                const list = data?.conversations || [];
                console.log('Parsed conversations list:', list);
                setConversations(list);
            },
            onError: (err) => {
                console.error('Chat conversations error:', err);
                toast.error("Failed to load conversations");
            }
        }
    );

    // 2. Fetch Messages when active conversation changes
    useEffect(() => {
        if (!activeConversation) return;

        const loadMessages = async () => {
            try {
                const res = await chatAPI.getMessages(activeConversation.partnerId);
                setMessages(res.data.data?.messages || []);
                scrollToBottom();

                // Mark as read
                await chatAPI.markAsRead(activeConversation.partnerId);
                // Dispatch event for Sidebar to update
                window.dispatchEvent(new Event('chat-read'));
                // Refetch conversations to clear unread badge in list
                refetchConversations();
            } catch (error) {
                console.error("Failed to load messages", error);
                toast.error("Failed to load conversation history");
            }
        };

        loadMessages();
    }, [activeConversation]);

    // Helper to update conversations list locally
    const updateConversationOnMessage = (message: any) => {
        setConversations(prev => {
            const index = prev.findIndex(c => c.partnerId === (message.senderId === user?.id ? message.receiverId : message.senderId));
            if (index === -1) {
                // New conversation, let refetch handle it or fetch partner details
                refetchConversations();
                return prev;
            }

            const updatedConv = { ...prev[index] };
            updatedConv.lastMessage = message;

            // Increment unread if message is from partner and not active chat
            // Wait, if we are in active chat, we are reading it. 
            // But if we are in active chat, `activeConversation` is set.
            // This helper runs for ALL messages.
            // If message.senderId === activeConversation?.partnerId, then we are reading it? 
            // The `useEffect` for `activeConversation` handles marking read? No, that runs ONCE on mount/change.
            // If I receive message while chat is open:
            // `handleNewMessage` runs.
            // We should Mark Read immediately via API if active? 
            // AND not increment unread count.

            if (message.senderId !== user?.id && (!activeConversation || activeConversation.partnerId !== message.senderId)) {
                updatedConv.unreadCount = (updatedConv.unreadCount || 0) + 1;
            }

            // Move to top
            const newOrder = [...prev];
            newOrder.splice(index, 1);
            newOrder.unshift(updatedConv);
            return newOrder;
        });
    };

    // 3. Socket Connection & Event Handling
    useEffect(() => {
        if (!socketService.isConnected()) {
            socketService.connect();
        }

        const handleNewMessage = (message: any) => {
            if (!user) return; // Safety

            // 1. Update Messages list if active chat
            if (activeConversation && (message.senderId === activeConversation.partnerId || message.senderId === user.id)) {
                setMessages(prev => {
                    // Check strict ID duplicate
                    if (prev.some(m => m.id === message.id)) return prev;

                    // Check for temp message swap (deduplication for sender)
                    if (message.senderId === user.id) {
                        const tempIndex = prev.findIndex(m =>
                            typeof m.id === 'string' && m.id.startsWith('temp-') &&
                            m.content === message.content
                        );

                        if (tempIndex !== -1) {
                            const newMsgs = [...prev];
                            newMsgs[tempIndex] = message; // Swap temp with real
                            return newMsgs;
                        }
                    }

                    return [...prev, message];
                });
                scrollToBottom();
            } else {
                // Toast if not active and matches criteria (not handled by global)
                // Keeping it clean: Layout handles global notification. 
                // We only handle active chat logic here.
            }

            // 2. Update Conversations list (Optimistic)
            updateConversationOnMessage(message);
        };

        socketService.on('newMessage', handleNewMessage);

        return () => {
            socketService.off('newMessage', handleNewMessage);
        };
    }, [activeConversation, user, refetchConversations]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeConversation || !user) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await commonAPI.uploadFile(formData);
            const { url, mimetype } = uploadRes.data.data;

            // Send message with attachment
            const receiverId = activeConversation.partnerId;
            const content = ''; // Empty content for file-only message

            // Optimistic Update
            const tempId = 'temp-' + Date.now();
            const tempMessage: MessageWithAttachment = {
                id: tempId,
                senderId: user.id,
                receiverId: receiverId,
                content: content,
                attachmentUrl: url,
                attachmentType: mimetype,
                sentAt: new Date().toISOString(),
                isRead: false
            };

            setMessages(prev => [...prev, tempMessage]);
            scrollToBottom();

            await chatAPI.sendMessage(receiverId, content, url, mimetype);

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !user) return;

        const content = newMessage.trim();
        const receiverId = activeConversation.partnerId;

        // Optimistic Update
        const tempId = 'temp-' + Date.now();
        const tempMessage: MessageWithAttachment = {
            id: tempId,
            senderId: user.id,
            receiverId: receiverId,
            content: content,
            sentAt: new Date().toISOString(),
            isRead: false
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        scrollToBottom();

        // Optimistic conversation list update
        updateConversationOnMessage(tempMessage);

        try {
            const res = await chatAPI.sendMessage(receiverId, content);
            const realMessage = res.data.data;

            // Swap temp with real in messages
            if (realMessage) {
                setMessages(prev => prev.map(m => m.id === tempId ? realMessage : m));
                // Also update conversation list with real message (mostly for ID persistence)
                updateConversationOnMessage(realMessage);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
            // Revert optimistic update
            setMessages(prev => prev.filter(m => m.id !== tempId));
            refetchConversations();
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
            }, 100);
        }
    };

    return (
        <>
            <div className="h-[calc(100vh-6rem)] grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
                {/* Sidebar List */}
                <Card className="md:col-span-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                        <h2 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Chats
                        </h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsNewChatOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 && !loadingConversations ? (
                            <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                                <p>No conversations yet.</p>
                                <Button variant="outline" size="sm" onClick={() => setIsNewChatOpen(true)}>
                                    Start a Chat
                                </Button>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.partnerId}
                                    onClick={() => setActiveConversation(conv)}
                                    className={cn(
                                        "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b last:border-0 group relative pr-10",
                                        activeConversation?.partnerId === conv.partnerId && "bg-muted"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={conv.partner.profilePicture} />
                                        <AvatarFallback>{conv.partner.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="font-medium truncate text-sm">
                                                {conv.partner.firstName} {conv.partner.lastName}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(conv.lastMessage.sentAt), 'p')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                                {conv.lastMessage?.content || 'Start chatting'}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span className="bg-primary text-primary-foreground text-[10px] h-4 w-4 rounded-full flex items-center justify-center">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => handleDeleteConversation(conv.partnerId, e)}
                                        title="Delete Conversation"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </button>
                            ))
                        )}
                    </div>
                </Card>

                {/* Chat Area */}
                <Card className="md:col-span-3 flex flex-col overflow-hidden">
                    {!activeConversation ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b flex items-center gap-3 bg-muted/30">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={activeConversation.partner.profilePicture} />
                                    <AvatarFallback>{activeConversation.partner.firstName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-sm">
                                        {activeConversation.partner.firstName} {activeConversation.partner.lastName}
                                    </h3>
                                    <div className="text-xs text-muted-foreground capitalize">
                                        {activeConversation.partner.role.toLowerCase().replace('_', ' ')}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[75%] rounded-lg px-4 py-2 text-sm",
                                                isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                {/* Attachment Rendering */}
                                                {msg.attachmentUrl && (
                                                    <div className="mb-2">
                                                        {msg.attachmentType?.startsWith('image/') || msg.attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                            <img
                                                                src={msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${msg.attachmentUrl}`}
                                                                alt="Attachment"
                                                                className="max-w-full rounded-md max-h-60 object-cover cursor-pointer"
                                                                onClick={() => window.open(msg.attachmentUrl!.startsWith('http') ? msg.attachmentUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${msg.attachmentUrl}`, '_blank')}
                                                            />
                                                        ) : (
                                                            <a
                                                                href={msg.attachmentUrl.startsWith('http') ? msg.attachmentUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${msg.attachmentUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 underline"
                                                            >
                                                                <FileIcon className="h-4 w-4" />
                                                                Download Attachment
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {msg.content && <p>{msg.content}</p>}
                                                <p className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                                    {format(new Date(msg.sentAt), 'p')}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t mt-auto">
                                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        accept="image/*,application/pdf,.doc,.docx"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isUploading}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto">
                        {loadingPartners ? (
                            <div className="text-center py-4">Loading users...</div>
                        ) : partners.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No users found to chat with.</div>
                        ) : (
                            partners.map(partner => (
                                <button
                                    key={partner.id}
                                    onClick={() => handleStartChat(partner)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-md transition-colors text-left"
                                >
                                    <Avatar>
                                        <AvatarImage src={partner.profilePicture} />
                                        <AvatarFallback>{partner.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{partner.firstName} {partner.lastName}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {partner.role?.toLowerCase().replace('_', ' ')}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Chat;
