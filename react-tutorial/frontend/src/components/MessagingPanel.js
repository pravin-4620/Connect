import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Circle,
  Loader2
} from 'lucide-react';
import apiService from '../services/apiService';
import socketService from '../services/socketService';
import { useTheme } from '../context/ThemeContext';

const MessagingPanel = ({ isOpen, onClose, currentUser }) => {
  const { isDark } = useTheme();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch contacts when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      fetchUnreadCount();
      
      // Join user's personal room for messages
      if (currentUser?.id) {
        socketService.emit('join-user', currentUser.id);
      }
    }
  }, [isOpen, currentUser]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (data) => {
      console.log('📨 New message received:', data);
      
      // If we're in the conversation, add the message
      if (selectedContact && data.message.sender._id === selectedContact._id) {
        setMessages(prev => [...prev, data.message]);
        // Mark as read immediately
        apiService.markMessagesAsRead(data.conversationId);
      } else {
        // Update unread count
        fetchUnreadCount();
        fetchContacts();
      }
    };

    const handleMessageSent = (data) => {
      console.log('✅ Message sent confirmed:', data);
    };

    const handleTyping = ({ userId, isTyping: typing }) => {
      if (selectedContact && userId === selectedContact._id) {
        setTypingUser(typing ? selectedContact.name : null);
      }
    };

    const handleUserOnline = ({ userId, online }) => {
      setContacts(prev => prev.map(contact => 
        contact._id === userId ? { ...contact, online } : contact
      ));
    };

    socketService.on('new-message', handleNewMessage);
    socketService.on('message-sent', handleMessageSent);
    socketService.on('user-typing', handleTyping);
    socketService.on('user-online', handleUserOnline);

    return () => {
      socketService.off('new-message', handleNewMessage);
      socketService.off('message-sent', handleMessageSent);
      socketService.off('user-typing', handleTyping);
      socketService.off('user-online', handleUserOnline);
    };
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContacts();
      if (response.success) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    setMessages([]);
    setLoading(true);

    try {
      const response = await apiService.getConversation(contact._id);
      if (response.success) {
        setMessages(response.data.messages);
        
        // Join conversation room
        socketService.emit('join-conversation', response.data.conversationId);
        
        // Update contact's unread count
        setContacts(prev => prev.map(c => 
          c._id === contact._id ? { ...c, unreadCount: 0 } : c
        ));
        fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Optimistically add message to UI
    const optimisticMessage = {
      _id: 'temp_' + Date.now(),
      content: messageContent,
      sender: { _id: currentUser.id, name: currentUser.name },
      receiver: { _id: selectedContact._id, name: selectedContact.name },
      createdAt: new Date().toISOString(),
      sending: true
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await apiService.sendMessage(selectedContact._id, messageContent);
      if (response.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => 
          m._id === optimisticMessage._id ? response.data : m
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== optimisticMessage._id));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTypingIndicator = () => {
    if (selectedContact) {
      const conversationId = [currentUser.id, selectedContact._id].sort().join('_');
      socketService.emit('typing', {
        conversationId,
        userId: currentUser.id,
        isTyping: true
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit('typing', {
          conversationId,
          userId: currentUser.id,
          isTyping: false
        });
      }, 1500);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  // Theme classes
  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    bgSecondary: isDark ? 'bg-gray-800' : 'bg-gray-50',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    textSubtle: isDark ? 'text-gray-500' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
    button: isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    icon: isDark ? 'text-gray-400' : 'text-gray-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${themeClasses.bg} w-full max-w-4xl h-[600px] flex shadow-2xl rounded-lg overflow-hidden`}>
        {/* Contacts List */}
        <div className={`w-full md:w-1/3 border-r ${themeClasses.border} flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className={`p-4 border-b ${themeClasses.border} ${themeClasses.bgSecondary}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-semibold ${themeClasses.text} flex items-center`}>
                <MessageCircle className="h-5 w-5 mr-2" />
                Messages
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className={`p-1 ${themeClasses.hover} rounded transition`}
              >
                <X className={`h-5 w-5 ${themeClasses.icon}`} />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.textSubtle}`} />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none ${themeClasses.input} ${isDark ? 'focus:border-gray-500' : 'focus:border-gray-900'}`}
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto">
            {loading && !selectedContact ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className={`h-6 w-6 animate-spin ${themeClasses.textSubtle}`} />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className={`p-4 text-center ${themeClasses.textMuted}`}>
                <MessageCircle className={`h-12 w-12 mx-auto mb-2 ${themeClasses.textSubtle}`} />
                <p className="text-sm">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => selectContact(contact)}
                  className={`p-4 border-b ${themeClasses.border} cursor-pointer ${themeClasses.hover} transition ${
                    selectedContact?._id === contact._id ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={contact.photo ? `http://localhost:5001${contact.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name || 'User')}&background=1f2937&color=fff`}
                        alt={contact.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      {contact.online && (
                        <div className={`absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${themeClasses.text} truncate`}>{contact.name}</h3>
                        {contact.lastMessage && (
                          <span className={`text-xs ${themeClasses.textSubtle}`}>
                            {formatTime(contact.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-500 mb-1">{contact.relationship}</p>
                      {contact.lastMessage && (
                        <p className={`text-sm ${themeClasses.textMuted} truncate`}>
                          {contact.lastMessage.sender === currentUser?.id ? 'You: ' : ''}
                          {contact.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {contact.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {contact.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b ${themeClasses.border} ${themeClasses.bgSecondary} flex items-center`}>
                <button
                  onClick={() => setSelectedContact(null)}
                  className={`md:hidden p-1 mr-2 ${themeClasses.hover} rounded`}
                >
                  <ArrowLeft className={`h-5 w-5 ${themeClasses.icon}`} />
                </button>
                <img
                  src={selectedContact.photo ? `http://localhost:5001${selectedContact.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name || 'User')}&background=1f2937&color=fff`}
                  alt={selectedContact.name}
                  className="h-10 w-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1">
                  <h3 className={`font-semibold ${themeClasses.text}`}>{selectedContact.name}</h3>
                  <p className={`text-xs ${themeClasses.textMuted}`}>
                    {selectedContact.relationship} • {selectedContact.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${themeClasses.bgSecondary}`}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className={`h-6 w-6 animate-spin ${themeClasses.textSubtle}`} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center h-full ${themeClasses.textMuted}`}>
                    <MessageCircle className={`h-16 w-16 mb-4 ${themeClasses.textSubtle}`} />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.sender?._id === currentUser?.id;
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? `${isDark ? 'bg-gray-700' : 'bg-gray-900'} text-white rounded-br-md`
                              : `${themeClasses.card} border ${themeClasses.text} rounded-bl-md`
                          } ${message.sending ? 'opacity-70' : ''}`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwnMessage ? (isDark ? 'text-gray-400' : 'text-gray-300') : themeClasses.textSubtle}`}>
                            <span className="text-xs">
                              {formatTime(message.createdAt)}
                            </span>
                            {isOwnMessage && (
                              message.sending ? (
                                <Circle className="h-3 w-3" />
                              ) : message.read ? (
                                <CheckCheck className="h-3 w-3 text-blue-400" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {/* Typing Indicator */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-4 py-2 rounded-2xl rounded-bl-md`}>
                      <div className="flex space-x-1">
                        <div className={`h-2 w-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`}></div>
                        <div className={`h-2 w-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`h-2 w-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t ${themeClasses.border} ${themeClasses.bg}`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTypingIndicator();
                    }}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2 border rounded-full text-sm ${themeClasses.input} ${isDark ? 'focus:border-gray-500' : 'focus:border-gray-900'} focus:outline-none`}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className={`p-2 rounded-full transition ${
                      newMessage.trim() && !sendingMessage
                        ? themeClasses.button
                        : `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    }`}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center ${themeClasses.textMuted} ${themeClasses.bgSecondary}`}>
              <MessageCircle className={`h-20 w-20 mb-4 ${themeClasses.textSubtle}`} />
              <h3 className={`text-lg font-medium ${themeClasses.text} mb-2`}>Your Messages</h3>
              <p className="text-sm">Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPanel;
