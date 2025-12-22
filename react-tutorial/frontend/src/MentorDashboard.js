import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Bell,
  LogOut,
  GraduationCap,
  Menu,
  CheckCircle2,
  Clock,
  XCircle,
  Briefcase,
  CalendarDays,
  Mail,
  BarChart3,
  X,
  TrendingUp,
  Search,
  Star,
  Inbox,
  Tag,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Reply,
  Send,
  Eye,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  FileText
} from 'lucide-react';
import { CompanyLogo } from './components/CompanyLogos';
import MessagingPanel from './components/MessagingPanel';
import CalendarPanel from './components/CalendarPanel';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import gmailService from './services/gmailService';
import aiCategorizationService from './services/aiCategorizationService';
import gmailConfig from './config/gmailConfig';
import apiService from './services/apiService';
import socketService from './services/socketService';
// New feature components
import AdvancedSearch from './components/AdvancedSearch';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import EmailInbox from './components/EmailInbox';

const MentorDashboard = ({ onLogout, user }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [events, setEvents] = useState([]);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  // New feature states
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showResumeAnalyzer, setShowResumeAnalyzer] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', eventType: 'Workshop', date: '', time: '', endTime: '',
    venue: '', mode: 'In-Person', category: 'Other', organizer: '', maxParticipants: ''
  });

  // Theme classes
  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    sidebar: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    textSubtle: isDark ? 'text-gray-500' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-gray-500' : 'bg-white border-gray-300 text-gray-900 focus:border-gray-900',
    button: isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white',
    buttonSecondary: isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50',
    badge: isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200',
    success: isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200',
    icon: isDark ? 'text-gray-400' : 'text-gray-700',
  };

  // Gmail Integration States
  const [gmailConnected, setGmailConnected] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [mails, setMails] = useState([]);
  const [isLoadingMails, setIsLoadingMails] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [mailFilter, setMailFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorizationProgress, setCategorizationProgress] = useState(0);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchMyStudents();
    } else if (activeTab === 'approvals') {
      fetchPendingApprovals();
    } else if (activeTab === 'placements') {
      fetchPlacements();
    } else if (activeTab === 'events') {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load initial overview data
  useEffect(() => {
    fetchMyStudents();
    fetchPendingApprovals();
    fetchPlacements();
    fetchEvents();

    // Initialize WebSocket and listen for real-time updates
    socketService.initializeSocket('mentor');
    
    // Listen for approval updates
    socketService.on('approval-updated', (data) => {
      console.log('📡 Approval updated via WebSocket:', data);
      fetchPendingApprovals();
    });

    // Listen for placement updates
    socketService.on('placement-created', () => {
      console.log('📡 New placement created');
      fetchPlacements();
    });
    socketService.on('placement-deleted', () => {
      console.log('📡 Placement deleted');
      fetchPlacements();
    });

    // Listen for event updates
    socketService.on('event-created', () => {
      console.log('📡 New event created');
      fetchEvents();
    });
    socketService.on('event-deleted', () => {
      console.log('📡 Event deleted');
      fetchEvents();
    });

    // Listen for new messages
    socketService.on('new-message', () => {
      console.log('📨 New message received');
      fetchUnreadMessages();
    });

    // Cleanup on unmount
    return () => {
      socketService.off('approval-updated', null);
      socketService.off('placement-created', null);
      socketService.off('placement-deleted', null);
      socketService.off('event-created', null);
      socketService.off('event-deleted', null);
      socketService.off('new-message', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch unread messages on mount
  useEffect(() => {
    fetchUnreadMessages();
    // Join user room for messages
    if (user?.id) {
      socketService.emit('join-user', user.id);
    }
  }, [user]);

  // Load initial overview data
  useEffect(() => {
    fetchMyStudents();
    fetchPendingApprovals();
    fetchPlacements();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUnreadMessages = async () => {
    try {
      const response = await apiService.getUnreadCount();
      if (response.success) {
        setUnreadMessages(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchMyStudents = async () => {
    try {
      const response = await apiService.getMyStudents();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Failed to load students');
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await apiService.getPendingApprovals();
      if (response.success) {
        setPendingApprovals(response.data);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const fetchPlacements = async () => {
    try {
      const response = await apiService.getPlacements();
      if (response.success) {
        setPlacements(response.data);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEvents();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleApproveRequest = async (approvalId, comments = 'Approved') => {
    try {
      const response = await apiService.approveRequest(approvalId, comments);
      if (response.success) {
        showToast('✅ Request approved successfully!');
        fetchPendingApprovals();
        if (activeTab === 'students') fetchMyStudents();
      } else {
        showToast('❌ ' + (response.message || 'Failed to approve request'));
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('❌ ' + (error.message || 'Failed to approve request'));
    }
  };

  const handleRejectRequest = async (approvalId, reason = 'Rejected') => {
    try {
      const response = await apiService.rejectRequest(approvalId, reason);
      if (response.success) {
        showToast('⛔ Request rejected');
        fetchPendingApprovals();
        if (activeTab === 'students') fetchMyStudents();
      } else {
        showToast('❌ ' + (response.message || 'Failed to reject request'));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('❌ ' + (error.message || 'Failed to reject request'));
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Event CRUD functions
  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      showToast('❌ Title and date are required');
      return;
    }
    try {
      const payload = {
        ...newEvent,
        maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : undefined
      };
      
      if (editingEvent) {
        const response = await apiService.updateEvent(editingEvent._id, payload);
        if (response.success) {
          showToast('✅ Event updated successfully!');
          fetchEvents();
        }
      } else {
        const response = await apiService.createEvent(payload);
        if (response.success) {
          showToast('✅ Event created successfully!');
          fetchEvents();
        }
      }
      setShowCreateEventModal(false);
      resetEventForm();
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('❌ Failed to save event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await apiService.deleteEvent(eventId);
      if (response.success) {
        showToast('✅ Event deleted');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('❌ Failed to delete event');
    }
  };

  const openEditEventModal = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title || '',
      description: event.description || '',
      eventType: event.eventType || 'Workshop',
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      endTime: event.endTime || '',
      venue: event.venue || event.location || '',
      mode: event.mode || 'In-Person',
      category: event.category || 'Other',
      organizer: event.organizer || '',
      maxParticipants: event.maxParticipants || ''
    });
    setShowCreateEventModal(true);
  };

  const resetEventForm = () => {
    setNewEvent({
      title: '', description: '', eventType: 'Workshop', date: '', time: '', endTime: '',
      venue: '', mode: 'In-Person', category: 'Other', organizer: '', maxParticipants: ''
    });
    setEditingEvent(null);
  };

  const eventTypes = ['Workshop', 'Competition', 'Seminar', 'Hackathon', 'Career Fair', 'Webinar', 'Other'];
  const categories = ['Academic', 'Career', 'Technical', 'Cultural', 'Sports', 'Other'];
  const modes = ['In-Person', 'Virtual', 'Hybrid'];

  // Stats calculated from real API data
  const stats = [
    { label: 'Assigned Students', value: String(students.length), change: '✓', icon: Users, color: 'gray' },
    { label: 'Pending Approvals', value: String(pendingApprovals.length), change: '✓', icon: CheckCircle2, color: 'gray' },
    { label: 'Active Placements', value: String(placements.length), change: '✓', icon: Briefcase, color: 'gray' },
    { label: 'Events Available', value: String(events.length), change: '✓', icon: Calendar, color: 'gray' }
  ];



  // Initialize Gmail API on component mount
  useEffect(() => {
    const initGmail = async () => {
      if (gmailConfig.DEMO_MODE) {
        // In demo mode, load mock emails
        loadMockEmails();
      } else {
        try {
          await gmailService.initializeGapi(gmailConfig.CLIENT_ID, gmailConfig.API_KEY);
          gmailService.initializeGis(gmailConfig.CLIENT_ID, handleAuthCallback);
          
          // Check if already signed in
          if (gmailService.isSignedIn()) {
            setGmailConnected(true);
            await fetchAndCategorizeEmails();
          }
        } catch (error) {
          console.error('Failed to initialize Gmail:', error);
          showToast('Failed to initialize Gmail. Using demo mode.');
          loadMockEmails();
        }
      }
    };

    if (activeTab === 'mails') {
      initGmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Load mock emails for demo
  const loadMockEmails = () => {
    const mockMails = [
      {
        id: '1',
        from: 'Alex Johnson <alex.johnson@student.college.edu>',
        subject: 'Regarding placement application review',
        snippet: 'Hi Professor, I wanted to discuss my recent placement applications...',
        date: 'Oct 22, 2025',
        internalDate: new Date(),
        unread: true,
        important: true,
        starred: false,
        category: 'Academic'
      },
      {
        id: '2',
        from: 'Placement Cell <placement@college.edu>',
        subject: 'Google Campus Drive Scheduled - Oct 15',
        snippet: 'Dear Mentors, We are excited to announce that Google will be conducting...',
        date: 'Oct 21, 2025',
        internalDate: new Date(Date.now() - 86400000),
        unread: true,
        important: false,
        starred: true,
        category: 'Recruitment'
      },
      {
        id: '3',
        from: 'Sarah Williams <sarah.williams@student.college.edu>',
        subject: 'Request for career guidance meeting',
        snippet: 'Hello Sir, I would like to schedule a meeting to discuss my career options...',
        date: 'Oct 20, 2025',
        internalDate: new Date(Date.now() - 172800000),
        unread: false,
        important: false,
        starred: false,
        category: 'Academic'
      },
      {
        id: '4',
        from: 'Department Head <hod.cs@college.edu>',
        subject: 'Mentor meeting scheduled for next week',
        snippet: 'Dear Faculty, Please be informed that a mentor coordination meeting...',
        date: 'Oct 19, 2025',
        internalDate: new Date(Date.now() - 259200000),
        unread: false,
        important: true,
        starred: false,
        category: 'Administrative'
      },
      {
        id: '5',
        from: 'Michael Brown <michael.brown@student.college.edu>',
        subject: 'Thank you for the mock interview session',
        snippet: 'Dear Professor, Thank you so much for conducting the mock interview...',
        date: 'Oct 18, 2025',
        internalDate: new Date(Date.now() - 345600000),
        unread: false,
        important: false,
        starred: false,
        category: 'Personal'
      },
      {
        id: '6',
        from: 'TCS Recruitment <campus.recruitment@tcs.com>',
        subject: 'TCS Ninja Recruitment Drive - Registration Open',
        snippet: 'Dear Faculty Coordinators, We are pleased to inform you that TCS...',
        date: 'Oct 17, 2025',
        internalDate: new Date(Date.now() - 432000000),
        unread: false,
        important: true,
        starred: true,
        category: 'Recruitment'
      },
      {
        id: '7',
        from: 'Emily Davis <emily.davis@student.college.edu>',
        subject: 'Clarification needed on project guidelines',
        snippet: 'Hello Sir/Madam, I need some clarification regarding the final year project...',
        date: 'Oct 16, 2025',
        internalDate: new Date(Date.now() - 518400000),
        unread: false,
        important: false,
        starred: false,
        category: 'Academic'
      },
      {
        id: '8',
        from: 'Training & Placement <tp@college.edu>',
        subject: 'Workshop on Interview Skills - Nov 5',
        snippet: 'Dear All, We are organizing a workshop on interview skills and resume building...',
        date: 'Oct 15, 2025',
        internalDate: new Date(Date.now() - 604800000),
        unread: false,
        important: false,
        starred: false,
        category: 'Events'
      }
    ];
    
    setMails(mockMails);
    setGmailConnected(true);
  };

  // Handle Gmail authentication callback
  const handleAuthCallback = async (response) => {
    if (response.error) {
      showToast('Authentication failed. Please try again.');
      setIsAuthenticating(false);
      return;
    }
    
    setGmailConnected(true);
    setIsAuthenticating(false);
    showToast('Gmail connected successfully!');
    await fetchAndCategorizeEmails();
  };

  // Connect Gmail account
  const connectGmail = async () => {
    if (gmailConfig.DEMO_MODE) {
      showToast('Demo mode: Loading sample emails...');
      loadMockEmails();
      return;
    }

    try {
      setIsAuthenticating(true);
      await gmailService.authorize();
    } catch (error) {
      console.error('Gmail authorization failed:', error);
      showToast('Failed to connect Gmail. Please try again.');
      setIsAuthenticating(false);
    }
  };

  // Fetch and categorize emails
  const fetchAndCategorizeEmails = async () => {
    setIsLoadingMails(true);
    try {
      const { emails } = await gmailService.fetchEmails(50);
      
      showToast('Categorizing emails with AI...');
      
      const categorizedEmails = await aiCategorizationService.categorizeEmails(
        emails,
        (progress) => {
          setCategorizationProgress(progress.percentage);
        }
      );
      
      setMails(categorizedEmails);
      showToast('All emails categorized successfully!');
      setCategorizationProgress(0);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      showToast('Failed to load emails. Loading sample data.');
      loadMockEmails();
    } finally {
      setIsLoadingMails(false);
    }
  };

  // Disconnect Gmail
  const disconnectGmail = () => {
    if (!gmailConfig.DEMO_MODE) {
      gmailService.revokeToken();
    }
    setGmailConnected(false);
    setMails([]);
    showToast('Gmail disconnected');
  };

  // Toggle star on email
  const toggleStar = async (mailId) => {
    const mail = mails.find(m => m.id === mailId);
    if (!mail) return;

    if (!gmailConfig.DEMO_MODE) {
      await gmailService.starEmail(mailId, !mail.starred);
    }

    setMails(mails.map(m => 
      m.id === mailId ? { ...m, starred: !m.starred } : m
    ));
  };

  // Mark email as read
  const markAsRead = async (mailId) => {
    if (!gmailConfig.DEMO_MODE) {
      await gmailService.markAsRead(mailId);
    }

    setMails(mails.map(m => 
      m.id === mailId ? { ...m, unread: false } : m
    ));
  };

  // Filter emails by category
  const filteredMails = mails.filter(mail => {
    // Apply category filter
    if (mailFilter !== 'all') {
      if (mailFilter === 'unread' && !mail.unread) return false;
      if (mailFilter === 'starred' && !mail.starred) return false;
      if (mailFilter === 'important' && !mail.important) return false;
      if (mailFilter !== 'unread' && mailFilter !== 'starred' && mailFilter !== 'important') {
        if (mail.category !== mailFilter) return false;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        mail.subject?.toLowerCase().includes(query) ||
        mail.from?.toLowerCase().includes(query) ||
        mail.snippet?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Get category statistics
  const getCategoryStats = () => {
    return {
      all: mails.length,
      unread: mails.filter(m => m.unread).length,
      starred: mails.filter(m => m.starred).length,
      important: mails.filter(m => m.important).length,
      Recruitment: mails.filter(m => m.category === 'Recruitment').length,
      Academic: mails.filter(m => m.category === 'Academic').length,
      Events: mails.filter(m => m.category === 'Events').length,
      Administrative: mails.filter(m => m.category === 'Administrative').length,
      Personal: mails.filter(m => m.category === 'Personal').length,
    };
  };

  const categoryStats = getCategoryStats();

  const handleApprove = async (request) => {
    await handleApproveRequest(request._id, 'Approved by mentor');
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  const handleReject = async (request) => {
    await handleRejectRequest(request._id, 'Rejected by mentor');
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex flex-col md:flex-row transition-colors duration-300`}>
      {/* Messaging Panel */}
      <MessagingPanel 
        isOpen={showMessaging} 
        onClose={() => setShowMessaging(false)} 
        currentUser={user}
      />

      {/* Email Inbox */}
      {showEmailInbox && (
        <EmailInbox 
          onClose={() => setShowEmailInbox(false)}
          userRole="mentor"
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 ${themeClasses.card} border shadow px-4 md:px-6 py-2 md:py-3 flex items-center space-x-2 md:space-x-3`}>
          <CheckCircle2 className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
          <span className={`text-xs md:text-sm ${themeClasses.text}`}>{toast}</span>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className={`${themeClasses.card} shadow-2xl max-w-2xl w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto border`}>
            <div className={`flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b ${themeClasses.border}`}>
              <h2 className={`text-lg md:text-xl font-semibold ${themeClasses.text}`}>Review Approval Request</h2>
              <button onClick={() => setShowApprovalModal(false)}>
                <X className={`h-5 w-5 ${themeClasses.textMuted} hover:${themeClasses.text}`} />
              </button>
            </div>
            
            <div className="mb-4 md:mb-6">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center border ${themeClasses.border}`}>
                  <span className={`text-lg font-semibold ${themeClasses.textMuted}`}>
                    {selectedRequest.user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${themeClasses.text} text-sm md:text-base truncate`}>{selectedRequest.user?.name || 'Unknown Student'}</p>
                  <p className={`text-xs md:text-sm ${themeClasses.textMuted} truncate`}>
                    {selectedRequest.requestType === 'placement' 
                      ? `${selectedRequest.metadata?.role || 'Role'} at ${selectedRequest.metadata?.company || 'Company'}`
                      : selectedRequest.title
                    }
                  </p>
                </div>
              </div>
              
              <div className={`mb-3 md:mb-4 p-3 md:p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${themeClasses.border}`}>
                <p className={`text-xs font-medium ${themeClasses.textMuted} mb-1 uppercase tracking-wide`}>
                  {selectedRequest.requestType === 'placement' ? 'Placement Application' : 'Event Registration'}
                </p>
                <p className={`text-sm md:text-base font-semibold ${themeClasses.text} mb-2`}>
                  {selectedRequest.requestType === 'placement' 
                    ? `${selectedRequest.metadata?.company || 'Company'} - ${selectedRequest.metadata?.role || 'Role'}`
                    : selectedRequest.title
                  }
                </p>
                <p className={`text-xs md:text-sm ${themeClasses.textMuted} mb-2`}><strong>Applied:</strong> {new Date(selectedRequest.requestedAt).toLocaleDateString()}</p>
                {selectedRequest.metadata?.package && (
                  <p className={`text-xs md:text-sm ${themeClasses.textMuted}`}><strong>Package:</strong> {selectedRequest.metadata.package}</p>
                )}
              </div>

              <div className="mb-4 md:mb-6">
                <label className={`block text-xs md:text-sm font-medium ${themeClasses.textMuted} mb-2`}>
                  Student's Reason
                </label>
                <div className={`p-3 md:p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${themeClasses.border}`}>
                  <p className={`text-xs md:text-sm ${themeClasses.text}`}>{selectedRequest.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
              <button
                onClick={() => handleReject(selectedRequest)}
                className={`flex-1 px-3 md:px-4 py-2 border ${themeClasses.buttonSecondary} font-medium text-xs md:text-sm flex items-center justify-center space-x-2`}
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleApprove(selectedRequest)}
                className={`flex-1 px-3 md:px-4 py-2 ${themeClasses.button} font-medium text-xs md:text-sm flex items-center justify-center space-x-2`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 ${themeClasses.sidebar} border-r transition-all duration-300 flex flex-col z-50 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${themeClasses.border} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 ${isDark ? 'bg-gray-700' : 'bg-gray-900'} flex items-center justify-center`}>
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className={`font-semibold ${themeClasses.text} text-base`}>CampusConnect</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`md:hidden ${themeClasses.textMuted} hover:${themeClasses.text}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
              { id: 'students', label: 'Students Info', icon: Users },
              { id: 'placements', label: 'Placements', icon: Briefcase },
              { id: 'events', label: 'Events', icon: CalendarDays },
              { id: 'mails', label: 'Mails', icon: Mail, isModal: true }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isModal) {
                      setShowEmailInbox(true);
                    } else {
                      setActiveTab(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 font-medium transition-all ${
                    activeTab === item.id && !item.isModal
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                      : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ItemIcon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${themeClasses.border}`}>
          <div className={`mb-4 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${themeClasses.border}`}>
            <div className="flex items-center space-x-3">
              <img
                src={user?.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User") + "&background=1f2937&color=fff"}
                alt="Profile"
                className={`h-10 w-10 border ${themeClasses.border} rounded-full object-cover`}
              />
              <div>
                <p className={`font-medium ${themeClasses.text} text-sm`}>{user?.name || 'Mentor'}</p>
                <p className={`text-xs ${themeClasses.textMuted}`}>{user?.department || 'CS Department'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${themeClasses.button} font-medium transition-all`}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <header className={`${themeClasses.card} border-b ${themeClasses.border} px-4 md:px-8 py-3 md:py-4 sticky top-0 z-30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`md:hidden ${themeClasses.hover} p-2 rounded -ml-2`}
              >
                <Menu className={`h-5 w-5 ${themeClasses.icon}`} />
              </button>
              <div>
                <h1 className={`text-xl md:text-2xl font-semibold ${themeClasses.text}`}>Mentor Portal</h1>
                <p className={`${themeClasses.textMuted} text-xs md:text-sm mt-1 hidden sm:block`}>Welcome back, {user?.name || 'Mentor'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setShowEmailInbox(true)}
                className={`relative p-2 ${themeClasses.hover} rounded`}
                title="Email Inbox"
              >
                <Mail className={`h-5 w-5 ${themeClasses.textMuted}`} />
              </button>
              <button 
                onClick={() => setShowMessaging(true)}
                className={`relative p-2 ${themeClasses.hover} rounded`}
                title="Messages"
              >
                <MessageCircle className={`h-5 w-5 ${themeClasses.textMuted}`} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
              <button className={`relative p-2 ${themeClasses.hover}`}>
                <Bell className={`h-5 w-5 ${themeClasses.textMuted}`} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className={`${themeClasses.card} p-4 md:p-6 border`}
                    >
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className={`p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Icon className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                        </div>
                        <span className={`text-xs font-medium ${themeClasses.badge} px-2 py-1 border`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className={`text-xl md:text-2xl font-semibold ${themeClasses.text} mb-1`}>{stat.value}</p>
                      <p className={`text-xs md:text-sm ${themeClasses.textMuted}`}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`${themeClasses.card} border overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h2 className={`text-base font-semibold ${themeClasses.text}`}>Recent Approval Requests</h2>
                  </div>
                  <div className={`divide-y ${themeClasses.border}`}>
                    {pendingApprovals.length === 0 ? (
                      <div className={`p-4 text-center ${themeClasses.textMuted} text-sm`}>No pending approvals</div>
                    ) : (
                      pendingApprovals.slice(0, 3).map((request) => (
                        <div key={request._id} className={`p-4 ${themeClasses.hover} transition-colors cursor-pointer`} onClick={() => openApprovalModal(request)}>
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center border ${themeClasses.border}`}>
                              <span className={`text-sm font-semibold ${themeClasses.textMuted}`}>
                                {request.user?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${themeClasses.text} text-sm`}>{request.user?.name || 'Unknown Student'}</p>
                              <p className={`text-xs ${themeClasses.textMuted}`}>
                                {request.requestType === 'placement' 
                                  ? `${request.metadata?.company || 'Company'} - ${request.metadata?.role || 'Role'}`
                                  : request.title
                                }
                              </p>
                            </div>
                            <span className={`text-xs ${themeClasses.badge} px-2 py-1 border`}>
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-t ${themeClasses.border}`}>
                    <button onClick={() => setActiveTab('approvals')} className={`text-sm ${themeClasses.text} font-medium hover:underline`}>
                      View All Requests →
                    </button>
                  </div>
                </div>

                <div className={`${themeClasses.card} border overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h2 className={`text-base font-semibold ${themeClasses.text}`}>My Students</h2>
                  </div>
                  <div className={`divide-y ${themeClasses.border}`}>
                    {students.length === 0 ? (
                      <div className={`p-4 text-center ${themeClasses.textMuted} text-sm`}>No students assigned yet</div>
                    ) : (
                      students.slice(0, 3).map((assignment, idx) => (
                        <div key={idx} className={`p-4 ${themeClasses.hover} transition-colors`}>
                          <div className="flex items-center space-x-3">
                            <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center border ${themeClasses.border}`}>
                              <span className={`text-sm font-semibold ${themeClasses.textMuted}`}>
                                {assignment.student?.name?.charAt(0) || assignment.user?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${themeClasses.text} text-sm`}>
                                {assignment.student?.name || assignment.user?.name || 'Unknown Student'}
                              </p>
                              <p className={`text-xs ${themeClasses.textMuted}`}>
                                {assignment.student?.email || assignment.user?.email || 'No email'}
                              </p>
                            </div>
                            <span className={`text-xs ${themeClasses.badge} px-2 py-1 border`}>
                              {assignment.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-t ${themeClasses.border}`}>
                    <button onClick={() => setActiveTab('students')} className={`text-sm ${themeClasses.text} font-medium hover:underline`}>
                      View All Students →
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`${themeClasses.card} border p-6 mt-8`}>
                <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setShowAdvancedSearch(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <Search className="h-6 w-6 text-blue-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Search Students</span>
                  </button>
                  <button
                    onClick={() => setShowResumeAnalyzer(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <FileText className="h-6 w-6 text-cyan-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Resume Analyzer</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Approvals</span>
                  </button>
                  <button
                    onClick={() => setShowCalendar(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <CalendarDays className="h-6 w-6 text-purple-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Calendar</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className={`${themeClasses.card} border p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className={`h-6 w-6 ${themeClasses.icon}`} />
                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Approval Requests</h2>
                  </div>
                  <span className={`text-sm ${themeClasses.textMuted}`}>{pendingApprovals.length} pending</span>
                </div>

                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                      <CheckCircle2 className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p>No pending approvals</p>
                    </div>
                  ) : (
                    pendingApprovals.map((request) => (
                      <div
                        key={request._id}
                        className={`border ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-900'} p-6 transition-all`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center border ${themeClasses.border}`}>
                              <span className={`text-lg font-semibold ${themeClasses.textMuted}`}>
                                {request.user?.name?.charAt(0) || 'S'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>{request.user?.name || 'Unknown Student'}</h3>
                                <span className={`px-2 py-1 text-xs font-medium ${themeClasses.badge} border`}>
                                  {request.requestType === 'placement' ? 'Placement' : 'Event'}
                                </span>
                              </div>
                              <p className={`text-base font-medium ${themeClasses.text} mb-2`}>
                                {request.requestType === 'placement' 
                                  ? `${request.metadata?.company || 'Company'} - ${request.metadata?.role || 'Role'}`
                                  : request.title
                                }
                              </p>
                              <p className={`text-sm ${themeClasses.textMuted} mb-2`}>{request.reason}</p>
                              <div className={`flex items-center space-x-4 text-sm ${themeClasses.textMuted}`}>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Applied: {new Date(request.requestedAt).toLocaleDateString()}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => openApprovalModal(request)}
                            className={`px-6 py-2 ${themeClasses.button} font-medium transition-all text-sm`}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Students Info Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className={`${themeClasses.card} border p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Users className={`h-6 w-6 ${themeClasses.icon}`} />
                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>My Students</h2>
                  </div>
                  <span className={`text-sm ${themeClasses.textMuted}`}>{students.length} students</span>
                </div>

                <div className="space-y-4">
                  {students.length === 0 ? (
                    <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                      <Users className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p>No students assigned yet</p>
                      <p className="text-sm mt-2">Students will appear here once the Placement Officer assigns them to you.</p>
                    </div>
                  ) : (
                    students.map((assignment, idx) => (
                      <div
                        key={idx}
                        className={`border ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-900'} p-6 transition-all`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`h-16 w-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center border ${themeClasses.border}`}>
                            <span className={`text-xl font-semibold ${themeClasses.textMuted}`}>
                              {assignment.student?.name?.charAt(0) || assignment.user?.name?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                                  {assignment.student?.name || assignment.user?.name || 'Unknown Student'}
                                </h3>
                                <p className={`text-sm ${themeClasses.textMuted}`}>
                                  {assignment.student?.registrationNumber || 'N/A'} • {assignment.student?.department || 'Department'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-medium ${themeClasses.text}`}>GPA: {assignment.student?.gpa || 'N/A'}</p>
                                <p className={`text-xs ${themeClasses.textMuted}`}>{assignment.student?.year || 'Year'}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                              <div>
                                <p className={themeClasses.textMuted}>
                                  <strong>Email:</strong> <a href={`mailto:${assignment.student?.email || assignment.user?.email}`} className="text-blue-500 hover:underline">
                                    {assignment.student?.email || assignment.user?.email || 'N/A'}
                                  </a>
                                </p>
                                <p className={themeClasses.textMuted}><strong>Phone:</strong> {assignment.student?.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className={themeClasses.textMuted}><strong>Status:</strong> {assignment.status || 'Active'}</p>
                                <p className={themeClasses.textMuted}><strong>Skills:</strong> {assignment.student?.skills?.join(', ') || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="space-y-6">
              <div className={`${themeClasses.card} border p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Briefcase className={`h-6 w-6 ${themeClasses.icon}`} />
                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Placements & Internships</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className={`px-4 py-2 border font-medium text-sm ${themeClasses.buttonSecondary}`}>
                      Filter
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {placements.map((placement, idx) => (
                    <div
                      key={idx}
                      className={`border ${themeClasses.border} p-6 ${isDark ? 'hover:border-gray-500' : 'hover:border-gray-900'} transition-all`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <CompanyLogo companyName={placement.company} size="lg" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`text-lg font-semibold ${themeClasses.text}`}>{placement.company}</h3>
                              <span className={`px-2 py-1 text-xs font-medium ${themeClasses.badge}`}>
                                {placement.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium ${themeClasses.badge}`}>
                                {placement.type}
                              </span>
                            </div>
                            <p className={`text-base font-medium ${themeClasses.text} mb-2`}>{placement.role}</p>
                            <div className={`flex items-center space-x-6 text-sm ${themeClasses.textMuted}`}>
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-4 w-4" />
                                <span className="font-medium">{placement.package}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Deadline: {placement.deadline}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className={`${themeClasses.card} border p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <CalendarDays className={`h-6 w-6 ${themeClasses.icon}`} />
                    <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Events Management</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setShowCalendar(true)}
                      className={`px-4 py-2 border font-medium text-sm flex items-center space-x-2 ${themeClasses.buttonSecondary}`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>View Calendar</span>
                    </button>
                    <button 
                      onClick={() => {
                        resetEventForm();
                        setShowCreateEventModal(true);
                      }}
                      className={`px-4 py-2 ${themeClasses.button} font-medium text-sm flex items-center space-x-2`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Event</span>
                    </button>
                  </div>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.length === 0 ? (
                    <div className={`col-span-2 text-center py-12 ${themeClasses.textSubtle}`}>
                      <CalendarDays className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className="text-lg mb-2">No events yet</p>
                      <p className="text-sm">Create your first event to get started</p>
                    </div>
                  ) : (
                    events.map((event, idx) => {
                      const eventDate = new Date(event.date);
                      const isPast = eventDate < new Date();
                      
                      return (
                        <div
                          key={event._id || idx}
                          className={`border ${themeClasses.border} p-6 ${isDark ? 'hover:border-gray-500' : 'hover:border-gray-900'} transition-all ${isPast ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold ${themeClasses.text}`}>{event.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs font-medium ${themeClasses.badge}`}>
                                  {event.eventType || 'Event'}
                                </span>
                                {event.category && (
                                  <span className={`px-2 py-0.5 text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-400 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200'} border`}>
                                    {event.category}
                                  </span>
                                )}
                                {isPast && (
                                  <span className={`px-2 py-0.5 text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Past</span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditEventModal(event)}
                                className={`p-1.5 ${themeClasses.hover} transition-colors`}
                                title="Edit event"
                              >
                                <Edit2 className={`h-4 w-4 ${themeClasses.textMuted}`} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event._id)}
                                className={`p-1.5 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} transition-colors`}
                                title="Delete event"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className={`text-sm ${themeClasses.textMuted} mb-4 line-clamp-2`}>{event.description}</p>
                          )}
                          
                          <div className={`space-y-2 text-sm ${themeClasses.textMuted}`}>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className={`h-4 w-4 ${themeClasses.icon}`} />
                              <span className="font-medium">
                                {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            {event.time && (
                              <div className="flex items-center space-x-2">
                                <Clock className={`h-4 w-4 ${themeClasses.icon}`} />
                                <span>{event.time}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                              </div>
                            )}
                            {(event.venue || event.location) && (
                              <div className="flex items-center space-x-2">
                                <MapPin className={`h-4 w-4 ${themeClasses.icon}`} />
                                <span>{event.venue || event.location}</span>
                              </div>
                            )}
                            {event.mode && (
                              <div className="flex items-center space-x-2">
                                <Tag className={`h-4 w-4 ${themeClasses.icon}`} />
                                <span>{event.mode}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.registeredCount > 0 && (
                            <div className={`mt-4 pt-3 border-t ${themeClasses.border} text-sm ${themeClasses.textMuted}`}>
                              <span className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{event.registeredCount} registered</span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Event Modal */}
          {showCreateEventModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className={`${themeClasses.card} w-full max-w-2xl max-h-[85vh] overflow-y-auto`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${themeClasses.text}`}>
                      {editingEvent ? 'Edit Event' : 'Create New Event'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowCreateEventModal(false);
                        resetEventForm();
                      }}
                      className={`p-1 ${themeClasses.hover}`}
                    >
                      <X className={`h-5 w-5 ${themeClasses.textMuted}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>
                        Event Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        placeholder="Enter event title"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Description</label>
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        rows="3"
                        placeholder="Event description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Event Type</label>
                        <select
                          value={newEvent.eventType}
                          onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        >
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Category</label>
                        <select
                          value={newEvent.category}
                          onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Start Time</label>
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>End Time</label>
                        <input
                          type="time"
                          value={newEvent.endTime}
                          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Venue/Location</label>
                        <input
                          type="text"
                          value={newEvent.venue}
                          onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                          placeholder="e.g., Main Auditorium"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Mode</label>
                        <select
                          value={newEvent.mode}
                          onChange={(e) => setNewEvent({ ...newEvent, mode: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                        >
                          {modes.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Organizer</label>
                        <input
                          type="text"
                          value={newEvent.organizer}
                          onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                          placeholder="e.g., Tech Club"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Max Participants</label>
                        <input
                          type="number"
                          value={newEvent.maxParticipants}
                          onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: e.target.value })}
                          className={`w-full border px-3 py-2 ${themeClasses.input}`}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={`flex justify-end space-x-3 mt-6 pt-4 border-t ${themeClasses.border}`}>
                    <button
                      onClick={() => {
                        setShowCreateEventModal(false);
                        resetEventForm();
                      }}
                      className={`px-4 py-2 border ${themeClasses.buttonSecondary}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateEvent}
                      className={`px-6 py-2 ${themeClasses.button}`}
                    >
                      {editingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Panel */}
          <CalendarPanel
            isOpen={showCalendar}
            onClose={() => setShowCalendar(false)}
            user={user}
            canManageEvents={true}
            showToast={showToast}
          />

          {/* Mails Tab */}
          {activeTab === 'mails' && !gmailConnected && (
            <div className={`${themeClasses.card} border p-6 md:p-8 lg:p-12 text-center`}>
              <div className="max-w-md mx-auto">
                <div className={`h-16 w-16 md:h-20 md:w-20 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} border mx-auto mb-4 md:mb-6 flex items-center justify-center`}>
                  <Mail className={`h-8 w-8 md:h-10 md:w-10 ${themeClasses.icon}`} />
                </div>
                <h2 className={`text-xl md:text-2xl font-semibold ${themeClasses.text} mb-2 md:mb-3`}>Connect Your Gmail</h2>
                <p className={`text-sm md:text-base ${themeClasses.textMuted} mb-4 md:mb-6`}>
                  Connect your Gmail account to access your emails directly from CampusConnect. 
                  Our AI will automatically categorize your emails into Academic, Career, Events, and more.
                </p>
                <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border p-3 md:p-4 mb-4 md:mb-6 text-left`}>
                  <div className="flex items-start space-x-3 mb-3">
                    <Sparkles className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className={`font-medium ${themeClasses.text} text-xs md:text-sm mb-1`}>AI-Powered Categorization</p>
                      <p className={`text-xs ${themeClasses.textMuted}`}>Automatically sorts emails into relevant categories</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mb-3">
                    <Tag className="h-4 w-4 md:h-5 md:w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm mb-1">Smart Labels</p>
                      <p className="text-xs text-gray-600">Get intelligent tags for quick filtering</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-xs md:text-sm mb-1">Priority Inbox</p>
                      <p className="text-xs text-gray-600">Important emails highlighted automatically</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={connectGmail}
                  disabled={isAuthenticating}
                  className={`w-full ${themeClasses.button} font-medium py-3 mb-3 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Mail className="h-5 w-5" />
                  <span>{isAuthenticating ? 'Connecting...' : 'Connect Gmail Account'}</span>
                </button>
                <p className={`text-xs ${themeClasses.textSubtle}`}>
                  We'll never access your personal emails without permission. You control what we see.
                </p>
              </div>
            </div>
          )}

          {/* Mails Interface - After Connected */}
          {activeTab === 'mails' && gmailConnected && (
            <div className="flex h-[calc(100vh-80px)]">
              {/* Sidebar */}
              <div className={`w-64 ${themeClasses.sidebar} border-r flex flex-col`}>
                {/* Compose Button */}
                <div className="p-4">
                  <button className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${themeClasses.button} font-semibold transition-colors`}>
                    <Mail className="h-4 w-4" />
                    <span>Compose</span>
                  </button>
                </div>

                {/* Mail Categories */}
                <div className="flex-1 overflow-y-auto">
                  <nav className="px-2 space-y-1">
                    <button
                      onClick={() => setMailFilter('all')}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        mailFilter === 'all'
                          ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                          : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Inbox className="h-4 w-4" />
                        <span>All Mail</span>
                      </div>
                      <span className="text-xs">{categoryStats.all}</span>
                    </button>

                    <button
                      onClick={() => setMailFilter('unread')}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        mailFilter === 'unread'
                          ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                          : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4" />
                        <span>Unread</span>
                      </div>
                      <span className="text-xs">{categoryStats.unread}</span>
                    </button>

                    <button
                      onClick={() => setMailFilter('starred')}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        mailFilter === 'starred'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4" />
                        <span>Important</span>
                      </div>
                      <span className="text-xs">{categoryStats.starred}</span>
                    </button>
                  </nav>

                  {/* AI Categories */}
                  <div className={`px-4 py-3 border-t ${themeClasses.border} mt-4`}>
                    <div className={`flex items-center space-x-2 text-xs font-semibold ${themeClasses.textSubtle} mb-2`}>
                      <Sparkles className="h-3 w-3" />
                      <span>AI CATEGORIES</span>
                    </div>
                  </div>

                  <nav className="px-2 space-y-1">
                    {['Recruitment', 'Academic', 'Events', 'Administrative', 'Personal'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setMailFilter(category)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          mailFilter === category
                            ? isDark ? 'bg-gray-700 text-white font-medium' : 'bg-gray-100 text-gray-900 font-medium'
                            : isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`} />
                          <span>{category}</span>
                        </div>
                        <span className="text-xs">{categoryStats[category] || 0}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Disconnect Button */}
                <div className={`p-4 border-t ${themeClasses.border}`}>
                  <button
                    onClick={disconnectGmail}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm ${themeClasses.textMuted} ${themeClasses.hover} transition-colors`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Disconnect Gmail</span>
                  </button>
                </div>
              </div>

              {/* Email List or Detail View */}
              {!selectedMail ? (
                <div className={`flex-1 flex flex-col ${themeClasses.card}`}>
                  {/* Header */}
                  <div className={`border-b ${themeClasses.border} px-6 py-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                        {mailFilter === 'all' ? 'All Mail' : 
                         mailFilter === 'unread' ? 'Unread' :
                         mailFilter === 'starred' ? 'Important' : mailFilter}
                      </h2>
                      {categorizationProgress > 0 && (
                        <div className={`flex items-center space-x-2 text-sm ${themeClasses.textMuted}`}>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Categorizing... {categorizationProgress}%</span>
                        </div>
                      )}
                      {categorizationProgress === 0 && !isLoadingMails && mails.length > 0 && (
                        <div className={`flex items-center space-x-2 text-sm ${themeClasses.textMuted}`}>
                          <CheckCircle2 className={`h-4 w-4 ${themeClasses.icon}`} />
                          <span>All emails categorized successfully!</span>
                        </div>
                      )}
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border text-sm ${themeClasses.input}`}
                      />
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      {filteredMails.length} email{filteredMails.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="flex-1 overflow-y-auto">
                    {isLoadingMails ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">Loading emails...</p>
                        </div>
                      </div>
                    ) : filteredMails.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 font-medium">No emails found</p>
                          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredMails.map((mail) => (
                          <div
                            key={mail.id}
                            onClick={() => {
                              setSelectedMail(mail);
                              markAsRead(mail.id);
                            }}
                            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              mail.unread ? 'bg-gray-50' : ''
                            } ${selectedMail?.id === mail.id ? 'border-l-4 border-gray-900' : ''}`}
                          >
                            <div className="flex items-start space-x-4">
                              {/* Star Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(mail.id);
                                }}
                                className="mt-1 flex-shrink-0"
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    mail.starred
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 hover:text-gray-400'
                                  }`}
                                />
                              </button>

                              {/* Email Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <p
                                    className={`text-sm truncate ${
                                      mail.unread ? 'font-semibold text-gray-900' : 'text-gray-700'
                                    }`}
                                  >
                                    {mail.from}
                                  </p>
                                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                    {mail.date}
                                  </span>
                                </div>

                                <h3
                                  className={`text-sm mb-1 truncate ${
                                    mail.unread ? `font-semibold ${themeClasses.text}` : themeClasses.textMuted
                                  }`}
                                >
                                  {mail.subject}
                                </h3>

                                <p className={`text-sm ${themeClasses.textMuted} truncate mb-2`}>{mail.snippet}</p>

                                {/* Tags */}
                                <div className="flex items-center space-x-2 flex-wrap gap-1">
                                  {mail.category && (
                                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs ${themeClasses.badge}`}>
                                      <Tag className="h-3 w-3" />
                                      <span>{mail.category}</span>
                                    </span>
                                  )}
                                  {mail.important && (
                                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-900 text-white'}`}>
                                      <Bell className="h-3 w-3" />
                                      <span>Urgent</span>
                                    </span>
                                  )}
                                  {mail.unread && (
                                    <span className={`inline-flex items-center px-2 py-0.5 text-xs ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-900 text-white'}`}>
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Email Detail View */
                <div className={`flex-1 flex flex-col ${themeClasses.card}`}>
                  {/* Detail Header */}
                  <div className={`border-b ${themeClasses.border} px-6 py-4`}>
                    <button
                      onClick={() => setSelectedMail(null)}
                      className={`flex items-center space-x-2 ${themeClasses.textMuted} hover:${themeClasses.text} mb-4`}
                    >
                      <ArrowRight className="h-5 w-5 transform rotate-180" />
                      <span className="text-sm font-medium">Back to inbox</span>
                    </button>
                    
                    <h2 className={`text-2xl font-bold ${themeClasses.text}`}>{selectedMail.subject}</h2>
                  </div>

                  {/* Email Detail Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Sender Info */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <div className={`h-12 w-12 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-900'} text-white flex items-center justify-center text-lg font-semibold flex-shrink-0`}>
                          {selectedMail.from.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${themeClasses.text}`}>{selectedMail.from.split('<')[0].trim() || selectedMail.from}</p>
                          <p className={`text-sm ${themeClasses.textMuted}`}>{selectedMail.from.includes('<') ? selectedMail.from.match(/<(.+)>/)?.[1] : selectedMail.from}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm ${themeClasses.textMuted}`}>{selectedMail.date}</span>
                        <button
                          onClick={() => toggleStar(selectedMail.id)}
                          className="flex-shrink-0"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              selectedMail.starred
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Category Badge */}
                    {selectedMail.category && (
                      <div className="mb-6">
                        <span className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm ${themeClasses.badge}`}>
                          <Sparkles className="h-4 w-4" />
                          <span>Categorized as: {selectedMail.category}</span>
                        </span>
                      </div>
                    )}

                    {/* Email Body */}
                    <div className="prose max-w-none">
                      <p className={`${themeClasses.textMuted} whitespace-pre-wrap`}>{selectedMail.snippet}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`border-t ${themeClasses.border} px-6 py-4`}>
                    <div className="flex items-center space-x-3">
                      <button className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.button} transition-colors`}>
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                      <button className={`flex items-center space-x-2 px-4 py-2 border ${themeClasses.buttonSecondary} transition-colors`}>
                        <Send className="h-4 w-4" />
                        <span>Forward</span>
                      </button>
                      {selectedMail.unread && (
                        <button
                          onClick={() => markAsRead(selectedMail.id)}
                          className={`flex items-center space-x-2 px-4 py-2 border ${themeClasses.buttonSecondary} transition-colors`}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Mark as Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Modals */}
      {showAdvancedSearch && (
        <AdvancedSearch onClose={() => setShowAdvancedSearch(false)} />
      )}
      {showResumeAnalyzer && (
        <ResumeAnalyzer onClose={() => setShowResumeAnalyzer(false)} />
      )}
    </div>
  );
};

export default MentorDashboard;
