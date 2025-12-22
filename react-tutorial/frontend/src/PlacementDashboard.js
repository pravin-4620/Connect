import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  Briefcase,
  FileText,
  BarChart3,
  CheckCircle2,
  Mail,
  Megaphone,
  PieChart,
  MessageCircle,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Search,
  Download,
  Video,
  ClipboardCheck
} from 'lucide-react';
import { CompanyLogo } from './components/CompanyLogos';
import MessagingPanel from './components/MessagingPanel';
import CalendarPanel from './components/CalendarPanel';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import apiService from './services/apiService';
import socketService from './services/socketService';
// New feature components
import ResumeAnalyzer from './components/ResumeAnalyzer';
import AdvancedSearch from './components/AdvancedSearch';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExportPanel from './components/ExportPanel';
import InterviewScheduler from './components/InterviewScheduler';
import SkillAssessment from './components/SkillAssessment';
import EmailInbox from './components/EmailInbox';

const PlacementDashboard = ({ onLogout, user }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  // New feature panel states
  const [showResumeAnalyzer, setShowResumeAnalyzer] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showSkillAssessment, setShowSkillAssessment] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [newPlacement, setNewPlacement] = useState({
    company: '',
    role: '',
    package: '',
    jobType: 'Full-time',
    applicationDeadline: '',
    workLocation: '',
    mode: 'On-Campus',
    status: 'Open'
  });
  const [newDrive, setNewDrive] = useState({
    company: '',
    date: '',
    time: '',
    venue: '',
    status: 'Upcoming',
    driveType: 'On-Campus',
    mode: 'In-Person'
  });
  const [newCompany, setNewCompany] = useState({ name: '', industry: '', location: '', status: 'Active' });
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', status: 'Upcoming', description: '' });
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState({});

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

  const fetchCompanies = async () => {
    try {
      const response = await apiService.getCompanies({ status: 'Active' });
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast('Failed to load companies');
    }
  };

  const fetchPlacements = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getPlacements();
      if (response.success) {
        setPlacements(response.data);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
      showToast('Failed to load placements');
    }
    setLoadingData(false);
  };

  const fetchDrives = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getDrives('Upcoming');
      if (response.success) {
        setDrives(response.data);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
      showToast('Failed to load drives');
    }
    setLoadingData(false);
  };

  const fetchApplications = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getAllApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Failed to load applications');
    }
    setLoadingData(false);
  };

  const handleCreatePlacement = async (placementData) => {
    try {
      const response = await apiService.createPlacement(placementData);
      if (response.success) {
        showToast('✅ Placement created successfully!');
        fetchPlacements();
      }
    } catch (error) {
      console.error('Error creating placement:', error);
      showToast('❌ Failed to create placement');
    }
  };

  const handleDeletePlacement = async (placementId) => {
    if (window.confirm('Are you sure you want to delete this placement?')) {
      try {
        const response = await apiService.deletePlacement(placementId);
        if (response.success) {
          showToast('✅ Placement deleted');
          fetchPlacements();
        }
      } catch (error) {
        console.error('Error deleting placement:', error);
        showToast('❌ Failed to delete placement');
      }
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateDrive = async (driveData) => {
    try {
      const payload = {
        company: driveData.company,
        date: driveData.date,
        time: driveData.time,
        venue: driveData.venue,
        status: driveData.status,
        driveType: driveData.driveType,
        mode: driveData.mode
      };
      const response = await apiService.createDrive(payload);
      if (response.success) {
        showToast('✅ Drive created successfully!');
        setNewDrive({ company: '', date: '', time: '', venue: '', status: 'Upcoming', driveType: 'On-Campus', mode: 'In-Person' });
        fetchDrives();
      }
    } catch (error) {
      console.error('Error creating drive:', error);
      showToast('❌ Failed to create drive');
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (window.confirm('Are you sure you want to delete this drive?')) {
      try {
        const response = await apiService.deleteDrive(driveId);
        if (response.success) {
          showToast('✅ Drive deleted');
          fetchDrives();
        }
      } catch (error) {
        console.error('Error deleting drive:', error);
        showToast('❌ Failed to delete drive');
      }
    }
  };

  const fetchEvents = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getEvents();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Failed to load events');
    }
    setLoadingData(false);
  };

  const handleCreateEvent = async (evt) => {
    try {
      const response = await apiService.createEvent(evt);
      if (response.success) {
        showToast('✅ Event created successfully!');
        setNewEvent({ title: '', date: '', time: '', location: '', status: 'Upcoming', description: '' });
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showToast('❌ Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
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
    }
  };

  const handleCreateCompany = async (company) => {
    try {
      const response = await apiService.createCompany(company);
      if (response.success) {
        showToast('✅ Company created successfully!');
        setNewCompany({ name: '', industry: '', location: '', status: 'Active' });
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error creating company:', error);
      showToast('❌ Failed to create company');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const response = await apiService.deleteCompany(companyId);
        if (response.success) {
          showToast('✅ Company deleted');
          fetchCompanies();
        }
      } catch (error) {
        console.error('Error deleting company:', error);
        showToast('❌ Failed to delete company');
      }
    }
  };

  const fetchStudents = async () => {
    setLoadingData(true);
    try {
      const response = await apiService.getStudents();
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showToast('Failed to load students');
    }
    setLoadingData(false);
  };

  const fetchMentors = async () => {
    try {
      const response = await apiService.getMentors();
      if (response.success) {
        setMentors(response.data);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleAssignMentor = async (studentId, mentorId) => {
    try {
      const response = await apiService.assignMentor({ studentId, mentorId });
      if (response.success) {
        showToast('✅ Mentor assigned');
        fetchStudents();
      }
    } catch (error) {
      console.error('Error assigning mentor:', error);
      showToast('❌ Failed to assign mentor');
    }
  };

  // Stats calculated from real API data
  const stats = [
    { label: 'Partner Companies', value: String(companies.length), change: '✓', icon: Building2, color: 'gray' },
    { label: 'Active Placements', value: String(placements.length), change: '✓', icon: Briefcase, color: 'gray' },
    { label: 'Upcoming Drives', value: String(drives.length), change: '✓', icon: TrendingUp, color: 'gray' },
    { label: 'Active Status', value: 'Live', change: '✓', icon: Users, color: 'gray' }
  ];

  // Load data on mount
  useEffect(() => {
    fetchCompanies();
    fetchPlacements();
    fetchDrives();
    fetchEvents();

    // Initialize WebSocket and listen for real-time updates
    socketService.initializeSocket('placement_officer');

    // Listen for company updates
    socketService.on('company-created', () => {
      console.log('📡 New company created');
      fetchCompanies();
    });
    socketService.on('company-deleted', () => {
      console.log('📡 Company deleted');
      fetchCompanies();
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

    // Listen for drive updates
    socketService.on('drive-created', () => {
      console.log('📡 New drive created');
      fetchDrives();
    });
    socketService.on('drive-deleted', () => {
      console.log('📡 Drive deleted');
      fetchDrives();
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
      socketService.off('company-created', null);
      socketService.off('company-deleted', null);
      socketService.off('placement-created', null);
      socketService.off('placement-deleted', null);
      socketService.off('drive-created', null);
      socketService.off('drive-deleted', null);
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

  // Load data on tab change
  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    } else if (activeTab === 'placements') {
      fetchPlacements();
    } else if (activeTab === 'drives') {
      fetchDrives();
    } else if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'students') {
      fetchStudents();
      fetchMentors();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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
          userRole="officer"
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 ${themeClasses.card} border shadow px-4 md:px-6 py-2 md:py-3 flex items-center space-x-2 md:space-x-3`}>
          <CheckCircle2 className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
          <span className={`text-xs md:text-sm ${themeClasses.text}`}>{toast}</span>
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
              <Building2 className="h-6 w-6 text-white" />
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
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'drives', label: 'Placement Drives', icon: Calendar },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'interviews', label: 'Interviews', icon: Video },
              { id: 'assessments', label: 'Skill Tests', icon: ClipboardCheck },
              { id: 'analytics', label: 'Reports & Analytics', icon: PieChart },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
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
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${themeClasses.text} text-sm truncate`}>{user?.name || 'Placement Officer'}</p>
                <p className={`text-xs ${themeClasses.textMuted}`}>{user?.department || 'Placement Officer'}</p>
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
                <h1 className={`text-xl md:text-2xl font-semibold ${themeClasses.text}`}>Placement Officer Portal</h1>
                <p className={`${themeClasses.textMuted} text-xs md:text-sm mt-1 hidden sm:block`}>Welcome back, {user?.name || 'Officer'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className={`${themeClasses.card} p-6 border`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Icon className={`h-5 w-5 ${themeClasses.icon}`} />
                        </div>
                        <span className={`text-xs font-medium ${themeClasses.badge} px-2 py-1 border`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className={`text-2xl font-semibold ${themeClasses.text} mb-1`}>{stat.value}</p>
                      <p className={`text-sm ${themeClasses.textMuted}`}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`${themeClasses.card} border overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h2 className={`text-base font-semibold ${themeClasses.text}`}>Recent Placement Drives</h2>
                  </div>
                  <div className={`divide-y ${themeClasses.border}`}>
                    {drives.slice(0, 3).map((drive) => (
                      <div key={drive.id} className={`p-4 ${themeClasses.hover} transition-colors`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <CompanyLogo companyName={drive.company} size="md" />
                          <div className="flex-1">
                            <p className={`font-medium ${themeClasses.text} text-sm`}>{drive.company}</p>
                            <p className={`text-xs ${themeClasses.textMuted}`}>{drive.date} • {drive.time}</p>
                          </div>
                          <span className={`text-xs ${themeClasses.badge} px-2 py-1 border`}>
                            {drive.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-t ${themeClasses.border}`}>
                    <button onClick={() => setActiveTab('drives')} className={`text-sm ${themeClasses.text} font-medium hover:underline`}>
                      View All Drives →
                    </button>
                  </div>
                </div>

                <div className={`${themeClasses.card} border overflow-hidden`}>
                  <div className={`px-6 py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h2 className={`text-base font-semibold ${themeClasses.text}`}>Top Companies</h2>
                  </div>
                  <div className={`divide-y ${themeClasses.border}`}>
                    {companies.slice(0, 3).map((company) => (
                      <div key={company.id} className={`p-4 ${themeClasses.hover} transition-colors`}>
                        <div className="flex items-center space-x-3">
                          <CompanyLogo companyName={company.name} size="md" />
                          <div className="flex-1">
                            <p className={`font-medium ${themeClasses.text} text-sm`}>{company.name}</p>
                            <p className={`text-xs ${themeClasses.textMuted}`}>{company.industry} • {company.location}</p>
                          </div>
                          <span className={`text-xs ${themeClasses.badge} px-2 py-1 border`}>
                            {company.offersCount} roles
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`px-6 py-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border-t ${themeClasses.border}`}>
                    <button onClick={() => setActiveTab('companies')} className={`text-sm ${themeClasses.text} font-medium hover:underline`}>
                      View All Companies →
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions - New Features */}
              <div className={`${themeClasses.card} border p-6 mt-8`}>
                <h2 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => setShowAdvancedSearch(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <Search className="h-6 w-6 text-blue-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Advanced Search</span>
                  </button>
                  <button
                    onClick={() => setShowAnalyticsDashboard(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <PieChart className="h-6 w-6 text-purple-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Analytics</span>
                  </button>
                  <button
                    onClick={() => setShowExportPanel(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <Download className="h-6 w-6 text-green-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Export Data</span>
                  </button>
                  <button
                    onClick={() => setShowInterviewScheduler(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <Video className="h-6 w-6 text-orange-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Interviews</span>
                  </button>
                  <button
                    onClick={() => setShowSkillAssessment(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <ClipboardCheck className="h-6 w-6 text-pink-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Skill Tests</span>
                  </button>
                  <button
                    onClick={() => setShowResumeAnalyzer(true)}
                    className={`p-4 rounded-lg border ${themeClasses.border} ${themeClasses.hover} transition-all flex flex-col items-center gap-2`}
                  >
                    <FileText className="h-6 w-6 text-cyan-500" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>Resume Analyzer</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Companies</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Manage partner companies</p>
              </div>
              {/* Create Company */}
              <div className={`${themeClasses.card} border p-6 mb-8`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Name</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Industry</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newCompany.industry} onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Location</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newCompany.location} onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })} />
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={() => handleCreateCompany(newCompany)} className={`px-4 py-2 ${themeClasses.button}`}>Add Company</button>
                </div>
              </div>
              <div className={`${themeClasses.card} border`}>
                <div className={`divide-y ${themeClasses.border}`}>
                  {loadingData ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>Loading companies...</div>
                  ) : companies.length === 0 ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>No companies found</div>
                  ) : (
                    companies.map((company) => (
                      <div key={company._id || company.id} className={`p-4 ${themeClasses.hover}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CompanyLogo companyName={company.name} size="lg" />
                            <div>
                              <p className={`font-medium ${themeClasses.text}`}>{company.name}</p>
                              <p className={`text-sm ${themeClasses.textMuted}`}>{company.industry || 'N/A'} • {company.location || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm px-3 py-1 ${themeClasses.badge}`}>{company.status || 'Active'}</span>
                            <button onClick={() => handleDeleteCompany(company._id || company.id)} className={`px-3 py-1 border ${themeClasses.buttonSecondary}`}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Drives Tab */}
          {activeTab === 'drives' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Placement Drives</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Manage placement drives</p>
              </div>
              {/* Create Drive Form */}
              <div className={`${themeClasses.card} border p-6 mb-8`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Company</label>
                    <select
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newDrive.company}
                      onChange={(e) => setNewDrive({ ...newDrive, company: e.target.value })}
                    >
                      <option value="">Select company</option>
                      {companies.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Date</label>
                    <input type="date" className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newDrive.date} onChange={(e) => setNewDrive({ ...newDrive, date: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Time</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} placeholder="e.g. 10:00 AM" value={newDrive.time} onChange={(e) => setNewDrive({ ...newDrive, time: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Venue</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} placeholder="Auditorium / Online" value={newDrive.venue} onChange={(e) => setNewDrive({ ...newDrive, venue: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Status</label>
                    <select className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newDrive.status} onChange={(e) => setNewDrive({ ...newDrive, status: e.target.value })}>
                      <option>Upcoming</option>
                      <option>Ongoing</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Drive Type</label>
                    <select className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newDrive.driveType} onChange={(e) => setNewDrive({ ...newDrive, driveType: e.target.value })}>
                      <option>On-Campus</option>
                      <option>Virtual</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Mode</label>
                    <select className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newDrive.mode} onChange={(e) => setNewDrive({ ...newDrive, mode: e.target.value })}>
                      <option>In-Person</option>
                      <option>Online</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={() => handleCreateDrive(newDrive)} className={`px-4 py-2 ${themeClasses.button}`}>Create Drive</button>
                </div>
              </div>

              {/* Drives List */}
              <div className={`${themeClasses.card} border`}>
                <div className={`divide-y ${themeClasses.border}`}>
                  {loadingData ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>Loading drives...</div>
                  ) : drives.length === 0 ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>No drives found</div>
                  ) : (
                    drives.map((drive) => (
                      <div key={drive._id || drive.id} className={`p-4 ${themeClasses.hover}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${themeClasses.text}`}>{drive.company?.name || drive.companyName || drive.company}</p>
                            <p className={`text-sm ${themeClasses.textMuted}`}>{(drive.date || '').toString().slice(0,10) || 'Date TBD'} • {drive.venue || 'Venue TBD'}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm px-3 py-1 ${themeClasses.badge}`}>{drive.status}</span>
                            <button onClick={() => handleDeleteDrive(drive._id || drive.id)} className={`ml-1 px-3 py-1 border ${themeClasses.buttonSecondary}`}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Events Management</h1>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Create, manage and track campus events</p>
                </div>
                <button 
                  onClick={() => setShowCalendar(true)}
                  className={`px-4 py-2 border font-medium text-sm flex items-center space-x-2 ${themeClasses.buttonSecondary}`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </button>
              </div>
              
              {/* Create Event Form */}
              <div className={`${themeClasses.card} border p-6 mb-8`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4 flex items-center space-x-2`}>
                  <Plus className="h-5 w-5" />
                  <span>Create New Event</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Title *</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Date *</label>
                    <input type="date" className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Time</label>
                    <input type="time" className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Location/Venue</label>
                    <input className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="e.g., Main Auditorium" />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Event Type</label>
                    <select className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newEvent.eventType || 'Workshop'} onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}>
                      <option value="Workshop">Workshop</option>
                      <option value="Competition">Competition</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Career Fair">Career Fair</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Status</label>
                    <select className={`w-full border px-3 py-2 ${themeClasses.input}`} value={newEvent.status} onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}>
                      <option>Upcoming</option>
                      <option>Ongoing</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Description</label>
                    <textarea className={`w-full border px-3 py-2 ${themeClasses.input}`} rows="2" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Event description..." />
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={() => handleCreateEvent({...newEvent, venue: newEvent.location})} className={`px-4 py-2 ${themeClasses.button} flex items-center space-x-2`}>
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              <div className={`${themeClasses.card} border`}>
                <div className={`p-4 border-b ${themeClasses.border}`}>
                  <h3 className={`font-semibold ${themeClasses.text}`}>All Events ({events.length})</h3>
                </div>
                {loadingData ? (
                  <div className={`p-8 text-center ${themeClasses.textMuted}`}>Loading events...</div>
                ) : events.length === 0 ? (
                  <div className={`p-12 text-center ${themeClasses.textSubtle}`}>
                    <CalendarDays className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className="text-lg mb-2">No events yet</p>
                    <p className="text-sm">Create your first event using the form above</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {events.map((evt) => {
                      const eventDate = new Date(evt.date);
                      const isPast = eventDate < new Date();
                      
                      return (
                        <div key={evt._id || evt.id} className={`border ${themeClasses.border} p-4 ${isDark ? 'hover:border-gray-500' : 'hover:border-gray-400'} transition-colors ${isPast ? 'opacity-60' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${themeClasses.text}`}>{evt.title}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 ${themeClasses.badge}`}>
                                  {evt.eventType || evt.status || 'Event'}
                                </span>
                                {isPast && (
                                  <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Past</span>
                                )}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteEvent(evt._id || evt.id)} 
                              className={`p-1.5 ${isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} transition-colors`}
                              title="Delete event"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                          
                          {evt.description && (
                            <p className={`text-sm ${themeClasses.textMuted} mb-3 line-clamp-2`}>{evt.description}</p>
                          )}
                          
                          <div className={`space-y-1.5 text-sm ${themeClasses.textMuted}`}>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className={`h-4 w-4 ${themeClasses.textSubtle}`} />
                              <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            </div>
                            {evt.time && (
                              <div className="flex items-center space-x-2">
                                <Clock className={`h-4 w-4 ${themeClasses.textSubtle}`} />
                                <span>{evt.time}</span>
                              </div>
                            )}
                            {(evt.venue || evt.location) && (
                              <div className="flex items-center space-x-2">
                                <MapPin className={`h-4 w-4 ${themeClasses.textSubtle}`} />
                                <span className="truncate">{evt.venue || evt.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {evt.registeredCount > 0 && (
                            <div className={`mt-3 pt-2 border-t ${themeClasses.border} text-xs ${themeClasses.textSubtle}`}>
                              {evt.registeredCount} registered
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Placements</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Create and manage placement postings</p>
              </div>
              {/* Create Placement Form */}
              <div className={`${themeClasses.card} border p-6 mb-8`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Company</label>
                    <input
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.company}
                      onChange={(e) => setNewPlacement({ ...newPlacement, company: e.target.value })}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Role</label>
                    <input
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.role}
                      onChange={(e) => setNewPlacement({ ...newPlacement, role: e.target.value })}
                      placeholder="Role title"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Package</label>
                    <input
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.package}
                      onChange={(e) => setNewPlacement({ ...newPlacement, package: e.target.value })}
                      placeholder="e.g. 6 LPA"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Job Type</label>
                    <select
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.jobType}
                      onChange={(e) => setNewPlacement({ ...newPlacement, jobType: e.target.value })}
                    >
                      <option>Full-time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                      <option>Part-time</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Application Deadline</label>
                    <input
                      type="date"
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.applicationDeadline}
                      onChange={(e) => setNewPlacement({ ...newPlacement, applicationDeadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Work Location</label>
                    <input
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.workLocation}
                      onChange={(e) => setNewPlacement({ ...newPlacement, workLocation: e.target.value })}
                      placeholder="City / Remote"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Mode</label>
                    <select
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.mode}
                      onChange={(e) => setNewPlacement({ ...newPlacement, mode: e.target.value })}
                    >
                      <option>On-Campus</option>
                      <option>Virtual</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Status</label>
                    <select
                      className={`w-full border px-3 py-2 ${themeClasses.input}`}
                      value={newPlacement.status}
                      onChange={(e) => setNewPlacement({ ...newPlacement, status: e.target.value })}
                    >
                      <option>Open</option>
                      <option>Closing Soon</option>
                      <option>Closed</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleCreatePlacement(newPlacement)}
                    className={`px-4 py-2 ${themeClasses.button}`}
                  >
                    Create Placement
                  </button>
                </div>
              </div>

              {/* Placements List */}
              <div className={`${themeClasses.card} border`}>
                <div className={`divide-y ${themeClasses.border}`}>
                  {loadingData ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>Loading placements...</div>
                  ) : placements.length === 0 ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>No placements found</div>
                  ) : (
                    placements.map((p) => (
                      <div key={p._id || p.id} className={`p-4 ${themeClasses.hover}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${themeClasses.text}`}>{p.company} — {p.role}</p>
                            <p className={`text-sm ${themeClasses.textMuted}`}>{p.package} • {p.jobType} • {p.workLocation || 'Location'}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm px-3 py-1 ${themeClasses.badge}`}>{p.status}</span>
                            <button
                              onClick={() => handleDeletePlacement(p._id || p.id)}
                              className={`px-3 py-1 border ${themeClasses.buttonSecondary}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Students Tab - Show all students */}
          {activeTab === 'students' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Students</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Assign mentors to students</p>
              </div>

              <div className={`${themeClasses.card} border p-4 mb-4`}>
                <p className={`text-sm ${themeClasses.textMuted}`}>Use the dropdown to select a mentor for each student. Click Assign to save.</p>
              </div>

              <div className={`${themeClasses.card} border`}>
                <div className={`divide-y ${themeClasses.border}`}>
                  {loadingData ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>Loading students...</div>
                  ) : students.length === 0 ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>No students found</div>
                  ) : (
                    students.map((student) => (
                      <div key={student._id || student.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div>
                            <p className={`font-medium ${themeClasses.text}`}>{student.name || student.fullName || 'Unnamed'}</p>
                            <p className={`text-sm ${themeClasses.textMuted}`}>{student.email || 'No email'}</p>
                          </div>
                          <div>
                            <label className={`block text-sm ${themeClasses.textMuted} mb-1`}>Select Mentor</label>
                            <select
                              className={`w-full border px-3 py-2 ${themeClasses.input}`}
                              value={selectedMentor[student._id || student.id] || ''}
                              onChange={(e) => setSelectedMentor({ ...selectedMentor, [student._id || student.id]: e.target.value })}
                            >
                              <option value="">Choose mentor</option>
                              {mentors.map((m) => (
                                <option key={m._id || m.id} value={m._id || m.id}>{m.name || m.fullName || m.email}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex md:justify-end">
                            <button
                              onClick={() => handleAssignMentor(student._id || student.id, selectedMentor[student._id || student.id])}
                              className={`px-4 py-2 ${themeClasses.button}`}
                              disabled={!selectedMentor[student._id || student.id]}
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Applications</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>View all placement applications</p>
              </div>
              <div className={`${themeClasses.card} border`}>
                <div className={`divide-y ${themeClasses.border}`}>
                  {loadingData ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>Loading applications...</div>
                  ) : applications.length === 0 ? (
                    <div className={`p-8 text-center ${themeClasses.textMuted}`}>No applications found</div>
                  ) : (
                    applications.map((app) => (
                      <div key={app._id || app.id} className={`p-4 ${themeClasses.hover}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${themeClasses.text}`}>{app.student?.name || 'Student'} — {app.role || app.placement?.role}</p>
                            <p className={`text-sm ${themeClasses.textMuted}`}>{app.company || app.placement?.company} • Reason: {app.applicationReason || '—'}</p>
                          </div>
                          <span className={`text-sm px-3 py-1 ${themeClasses.badge}`}>{app.mentorApproval?.status || 'Pending'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Reports & Analytics</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>View placement statistics and reports</p>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={`${themeClasses.card} border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeClasses.textMuted}`}>Total Students</p>
                      <p className={`text-2xl font-bold ${themeClasses.text}`}>{students.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <div className={`${themeClasses.card} border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeClasses.textMuted}`}>Active Placements</p>
                      <p className={`text-2xl font-bold ${themeClasses.text}`}>{placements.filter(p => p.status === 'Open').length}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className={`${themeClasses.card} border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeClasses.textMuted}`}>Total Applications</p>
                      <p className={`text-2xl font-bold ${themeClasses.text}`}>{applications.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
                <div className={`${themeClasses.card} border p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${themeClasses.textMuted}`}>Partner Companies</p>
                      <p className={`text-2xl font-bold ${themeClasses.text}`}>{companies.length}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Placement Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`${themeClasses.card} border p-6`}>
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Placements by Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${themeClasses.textMuted}`}>Open</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-32 h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}>
                          <div 
                            className="h-2 bg-green-500 rounded" 
                            style={{ width: `${placements.length ? (placements.filter(p => p.status === 'Open').length / placements.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${themeClasses.text}`}>{placements.filter(p => p.status === 'Open').length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${themeClasses.textMuted}`}>Closing Soon</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-32 h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}>
                          <div 
                            className="h-2 bg-yellow-500 rounded" 
                            style={{ width: `${placements.length ? (placements.filter(p => p.status === 'Closing Soon').length / placements.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${themeClasses.text}`}>{placements.filter(p => p.status === 'Closing Soon').length}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${themeClasses.textMuted}`}>Closed</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-32 h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}>
                          <div 
                            className="h-2 bg-red-500 rounded" 
                            style={{ width: `${placements.length ? (placements.filter(p => p.status === 'Closed').length / placements.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${themeClasses.text}`}>{placements.filter(p => p.status === 'Closed').length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${themeClasses.card} border p-6`}>
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Top Companies</h3>
                  <div className="space-y-3">
                    {companies.slice(0, 5).map((company, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-2 ${themeClasses.hover} rounded`}>
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded flex items-center justify-center text-xs font-bold ${themeClasses.text}`}>
                            {company.name?.charAt(0) || 'C'}
                          </div>
                          <span className={`text-sm font-medium ${themeClasses.text}`}>{company.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}>{company.status || 'Active'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Events Summary */}
              <div className={`mt-6 ${themeClasses.card} border p-6`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Upcoming Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {events.slice(0, 3).map((event, idx) => (
                    <div key={idx} className={`p-4 border ${themeClasses.border} rounded`}>
                      <p className={`text-xs ${themeClasses.textSubtle} mb-1`}>{event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</p>
                      <p className={`font-medium ${themeClasses.text}`}>{event.title}</p>
                      <p className={`text-sm ${themeClasses.textMuted} mt-1`}>{event.venue || event.location || 'TBD'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <div className="mb-6">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Announcements</h1>
                <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Send announcements to students</p>
              </div>
              
              {/* Create Announcement */}
              <div className={`${themeClasses.card} border p-6 mb-6`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Create New Announcement</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  showToast('✅ Announcement sent to all students!');
                  e.target.reset();
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Title</label>
                      <input
                        type="text"
                        required
                        className={`w-full border px-4 py-2 ${themeClasses.input}`}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Category</label>
                      <select className={`w-full border px-4 py-2 ${themeClasses.input}`}>
                        <option value="general">General</option>
                        <option value="placement">Placement</option>
                        <option value="event">Event</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Target Audience</label>
                      <select className={`w-full border px-4 py-2 ${themeClasses.input}`}>
                        <option value="all">All Students</option>
                        <option value="final-year">Final Year Only</option>
                        <option value="cse">CSE Department</option>
                        <option value="it">IT Department</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-1`}>Message</label>
                      <textarea
                        required
                        rows="4"
                        className={`w-full border px-4 py-2 ${themeClasses.input}`}
                        placeholder="Write your announcement message..."
                      ></textarea>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className={`px-6 py-2 ${themeClasses.button}`}
                      >
                        Send Announcement
                      </button>
                      <button
                        type="button"
                        className={`px-6 py-2 border ${themeClasses.buttonSecondary}`}
                      >
                        Save as Draft
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Recent Announcements */}
              <div className={`${themeClasses.card} border p-6`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>Recent Announcements</h3>
                <div className="space-y-4">
                  <div className={`p-4 border ${themeClasses.border} rounded`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>Placement</span>
                        <h4 className={`font-medium ${themeClasses.text} mt-2`}>Google Campus Drive - Registration Open</h4>
                        <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Registration for Google campus drive is now open. All eligible students are requested to apply before the deadline.</p>
                        <p className={`text-xs ${themeClasses.textSubtle} mt-2`}>Sent to: All Students • 2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 border ${themeClasses.border} rounded`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}>Event</span>
                        <h4 className={`font-medium ${themeClasses.text} mt-2`}>Technical Workshop - React Fundamentals</h4>
                        <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Join us for an exciting workshop on React development. Limited seats available!</p>
                        <p className={`text-xs ${themeClasses.textSubtle} mt-2`}>Sent to: CSE & IT Students • 1 day ago</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 border ${themeClasses.border} rounded`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'}`}>Urgent</span>
                        <h4 className={`font-medium ${themeClasses.text} mt-2`}>Resume Submission Deadline Extended</h4>
                        <p className={`text-sm ${themeClasses.textMuted} mt-1`}>The deadline for resume submission for TCS drive has been extended to next week.</p>
                        <p className={`text-xs ${themeClasses.textSubtle} mt-2`}>Sent to: Final Year • 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Interview Management</h1>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Schedule and manage student interviews</p>
                </div>
                <button
                  onClick={() => setShowInterviewScheduler(true)}
                  className={`px-4 py-2 ${themeClasses.button} flex items-center gap-2`}
                >
                  <Plus className="h-4 w-4" />
                  Schedule Interview
                </button>
              </div>
              
              <div className={`${themeClasses.card} border p-6`}>
                <p className={`text-center py-8 ${themeClasses.textMuted}`}>
                  Click "Schedule Interview" to open the interview scheduler panel
                </p>
              </div>
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === 'assessments' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Skill Assessments</h1>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Manage skill tests for students</p>
                </div>
                <button
                  onClick={() => setShowSkillAssessment(true)}
                  className={`px-4 py-2 ${themeClasses.button} flex items-center gap-2`}
                >
                  <Plus className="h-4 w-4" />
                  View Assessments
                </button>
              </div>
              
              <div className={`${themeClasses.card} border p-6`}>
                <p className={`text-center py-8 ${themeClasses.textMuted}`}>
                  Click "View Assessments" to manage skill tests and view results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Modals */}
      {showResumeAnalyzer && (
        <ResumeAnalyzer onClose={() => setShowResumeAnalyzer(false)} />
      )}
      {showAdvancedSearch && (
        <AdvancedSearch onClose={() => setShowAdvancedSearch(false)} />
      )}
      {showAnalyticsDashboard && (
        <AnalyticsDashboard onClose={() => setShowAnalyticsDashboard(false)} />
      )}
      {showExportPanel && (
        <ExportPanel onClose={() => setShowExportPanel(false)} />
      )}
      {showInterviewScheduler && (
        <InterviewScheduler onClose={() => setShowInterviewScheduler(false)} />
      )}
      {showSkillAssessment && (
        <SkillAssessment onClose={() => setShowSkillAssessment(false)} />
      )}
    </div>
  );
};

export default PlacementDashboard;
