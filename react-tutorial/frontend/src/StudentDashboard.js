import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Briefcase,
  BarChart3,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Menu,
  CalendarDays,
  User,
  X,
  LogOut,
  Bell,
  MessageCircle,
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  FileText,
  Download,
  Upload,
  Calendar,
  MapPin,
  Tag,
  ClipboardCheck
} from "lucide-react";
import { CompanyLogo } from './components/CompanyLogos';
import ChangePasswordModal from './components/ChangePasswordModal';
import StudentProfileForm from './components/StudentProfileForm';
import MessagingPanel from './components/MessagingPanel';
import CalendarPanel from './components/CalendarPanel';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import { getStoredUser } from './services/apiService';
import apiService from './services/apiService';
import socketService from './services/socketService';
// New feature components
import ResumeAnalyzer from './components/ResumeAnalyzer';
import SkillAssessment from './components/SkillAssessment';
import EmailInbox from './components/EmailInbox';

const StudentDashboard = ({ onLogout, user }) => {
  const { isDark } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [approvalType, setApprovalType] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [collegeEvents, setCollegeEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [studyResources, setStudyResources] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myEventRegistrations, setMyEventRegistrations] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  // New feature states
  const [showResumeAnalyzer, setShowResumeAnalyzer] = useState(false);
  const [showSkillAssessment, setShowSkillAssessment] = useState(false);
  const [showEmailInbox, setShowEmailInbox] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    cgpa: '',
    skills: '',
    linkedin: '',
    github: ''
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
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    button: isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-900 hover:bg-gray-800 text-white',
    buttonSecondary: isDark ? 'border-gray-600 hover:bg-gray-700 text-gray-300' : 'border-gray-300 hover:bg-gray-50 text-gray-700',
    badge: isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200',
    success: isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200',
    icon: isDark ? 'text-gray-400' : 'text-gray-700',
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Check if profile needs to be completed
  useEffect(() => {
    if (currentUser && !currentUser.profileCompleted) {
      setShowProfileForm(true);
    }
  }, [currentUser]);

  // Load initial data when dashboard mounts
  useEffect(() => {
    fetchPlacements();
    fetchMyApplications();
    fetchEvents();
    fetchMyEventRegistrations();
    fetchAssignments();
    fetchResources();
    // Initialize WebSocket and listen for real-time updates
    socketService.initializeSocket('student');

    // Listen for placement updates
    socketService.on('placement-created', () => {
      console.log('📡 New placement available');
      fetchPlacements();
    });
    socketService.on('placement-deleted', () => {
      console.log('📡 Placement closed');
      fetchPlacements();
    });

    // Listen for event updates
    socketService.on('event-created', () => {
      console.log('📡 New event available');
      fetchEvents();
    });
    socketService.on('event-deleted', () => {
      console.log('📡 Event cancelled');
      fetchEvents();
    });

    // Listen for approval updates
    socketService.on('approval-updated', () => {
      console.log('📡 Approval status updated');
      fetchMyApplications();
      fetchMyEventRegistrations();
    });

    // Listen for new messages
    socketService.on('new-message', () => {
      console.log('📨 New message received');
      fetchUnreadMessages();
    });

    // Cleanup on unmount
    return () => {
      socketService.off('placement-created', null);
      socketService.off('placement-deleted', null);
      socketService.off('event-created', null);
      socketService.off('event-deleted', null);
      socketService.off('approval-updated', null);
      socketService.off('new-message', null);
    };    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lightweight polling to keep data in sync across portals
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlacements();
      fetchMyApplications();
      fetchEvents();
      fetchMyEventRegistrations();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        year: currentUser.year || '',
        cgpa: currentUser.cgpa || '',
        skills: currentUser.skills || '',
        linkedin: currentUser.linkedin || '',
        github: currentUser.github || ''
      });
    }
  }, [currentUser]);


  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
    // Update user from localStorage
    const updatedUser = getStoredUser();
    setCurrentUser(updatedUser);
    showToast('Password changed successfully!');
  };

  const handleProfileComplete = () => {
    setShowProfileForm(false);
    const updatedUser = getStoredUser();
    setCurrentUser(updatedUser);
    showToast('Profile completed successfully!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPlacements = async () => {
    try {
      const response = await apiService.getPlacements();
      if (response.success) {
        setPlacements(response.data);
      }
    } catch (error) {
      console.error('Error fetching placements:', error);
      showToast('Failed to load placements');
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await apiService.getMyApplications();
      if (response.success) {
        setMyApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEvents({ status: 'Upcoming' });
      if (response.success) {
        setCollegeEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Failed to load events');
    }
  };

  const fetchMyEventRegistrations = async () => {
    try {
      const response = await apiService.getMyEventRegistrations();
      if (response.success) {
        setMyEventRegistrations(response.data);
      }
    } catch (error) {
      console.error('Error fetching event registrations:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await apiService.getAssignments();
      if (response.success) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await apiService.getResources();
      if (response.success) {
        setStudyResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

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

  // Fetch unread messages on mount
  useEffect(() => {
    fetchUnreadMessages();
    // Join user room for messages
    if (currentUser?.id) {
      socketService.emit('join-user', currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'placements') {
      fetchPlacements();
      fetchMyApplications();
    } else if (activeTab === 'events') {
      fetchEvents();
      fetchMyEventRegistrations();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
    } else if (activeTab === 'resources') {
      fetchResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    showToast('Profile updated successfully!');
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('❌ Please select an image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ Image size should be less than 5MB');
      return;
    }
    
    setUploadingPhoto(true);
    try {
      const response = await apiService.uploadProfilePhoto(file);
      if (response.success) {
        // Update current user with new photo
        const updatedUser = { ...currentUser, photo: response.data.photoUrl };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('✅ Profile photo updated successfully!');
      } else {
        showToast('❌ Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      showToast('❌ ' + (error.message || 'Failed to upload photo'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      showToast('❌ Please select a PDF or Word document');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ File size should be less than 5MB');
      return;
    }
    
    setResumeFile(file);
  };

  const submitResume = async () => {
    if (!resumeFile) {
      showToast('❌ Please select a file first');
      return;
    }
    
    setUploadingResume(true);
    try {
      const response = await apiService.uploadResume(resumeFile);
      if (response.success) {
        showToast('✅ Resume uploaded successfully!');
        setResumeFile(null);
        // Reset file input
        const fileInput = document.getElementById('resumeInput');
        if (fileInput) fileInput.value = '';
      } else {
        showToast('❌ Failed to upload resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      showToast('❌ ' + (error.message || 'Failed to upload resume'));
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApprovalRequest = (item, type) => {
    setSelectedItem(item);
    setApprovalType(type);
    setShowApprovalModal(true);
  };

  const submitApprovalRequest = async (e) => {
    e.preventDefault();
    if (!approvalReason.trim()) {
      showToast('❌ Please provide a reason for your application');
      return;
    }
    
    try {
      if (approvalType === 'placement') {
        const response = await apiService.applyForPlacement(
          selectedItem._id,
          approvalReason
        );
        if (response.success) {
          showToast('✅ Application submitted! Awaiting mentor approval.');
          setShowApprovalModal(false);
          setApprovalReason('');
          setSelectedItem(null);
          fetchPlacements();
          fetchMyApplications();
        } else {
          showToast('❌ ' + (response.message || 'Failed to submit application'));
        }
      } else if (approvalType === 'event') {
        const response = await apiService.registerForEvent(
          selectedItem._id,
          approvalReason
        );
        if (response.success) {
          showToast('✅ Event registration submitted! Awaiting mentor approval.');
          setShowApprovalModal(false);
          setApprovalReason('');
          setSelectedItem(null);
          fetchEvents();
          fetchMyEventRegistrations();
        } else {
          showToast('❌ ' + (response.message || 'Failed to submit registration'));
        }
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
      showToast('❌ ' + (error.message || 'Failed to submit request'));
    }
  };

  // Stats calculated from real API data
  const stats = [
    { label: 'Applications', value: String(myApplications.length), change: '✓', icon: Briefcase, color: 'blue' },
    { label: 'Events Registered', value: String(myEventRegistrations.length), change: '✓', icon: Clock, color: 'emerald' },
    { label: 'Available Placements', value: String(placements.length), change: '✓', icon: UserCheck, color: 'purple' },
    { label: 'Available Events', value: String(collegeEvents.length), change: '✓', icon: Trophy, color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-4 border-gray-900 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show password change modal for first-time login
  if (showPasswordModal) {
    return (
      <ChangePasswordModal
        onSuccess={handlePasswordChangeSuccess}
        onClose={() => {}} // Cannot close on first login
      />
    );
  }

  // Show profile form after password change (or skip if already completed)
  if (showProfileForm) {
    return (
      <StudentProfileForm
        user={currentUser}
        onComplete={handleProfileComplete}
      />
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex flex-col md:flex-row transition-colors duration-300`}>
      {/* Messaging Panel */}
      <MessagingPanel 
        isOpen={showMessaging} 
        onClose={() => setShowMessaging(false)} 
        currentUser={currentUser}
      />

      {/* Email Inbox */}
      {showEmailInbox && (
        <EmailInbox 
          onClose={() => setShowEmailInbox(false)}
          userRole="student"
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 ${themeClasses.card} border shadow px-4 md:px-6 py-3 flex items-center space-x-3 max-w-sm`}>
          <CheckCircle2 className={`h-5 w-5 ${themeClasses.icon} flex-shrink-0`} />
          <span className={`text-sm ${themeClasses.text} truncate`}>{toast}</span>
        </div>
      )}

      {/* Approval Request Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`${themeClasses.card} border shadow-2xl max-w-md w-full p-6`}>
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${themeClasses.border}`}>
              <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Request Approval</h2>
              <button onClick={() => setShowApprovalModal(false)}>
                <X className={`h-5 w-5 ${themeClasses.textMuted} hover:${themeClasses.text}`} />
              </button>
            </div>
            
            <div className={`mb-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${themeClasses.border}`}>
              <p className={`text-xs font-medium ${themeClasses.textMuted} mb-1 uppercase tracking-wide`}>
                {approvalType === 'placement' ? 'Placement/Internship' : 'Event Registration'}
              </p>
              <p className={`text-base font-semibold ${themeClasses.text}`}>
                {selectedItem?.title || selectedItem?.company || ''}
              </p>
            </div>

            <form onSubmit={submitApprovalRequest}>
              <div className="mb-6">
                <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                  Reason for Application
                </label>
                <textarea
                  required
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows="4"
                  className={`w-full px-3 py-2 border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm`}
                  placeholder="Why do you want to participate? What are your expectations?"
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className={`flex-1 px-4 py-2 border ${themeClasses.buttonSecondary} font-medium text-sm`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 ${themeClasses.button} font-medium text-sm`}
                >
                  Send Request
                </button>
              </div>
            </form>
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
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 ${themeClasses.sidebar} border-r flex flex-col
        transform transition-all duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 ${isDark ? 'bg-gray-700' : 'bg-gray-900'} flex items-center justify-center`}>
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className={`font-semibold ${themeClasses.text} text-base`}>CampusConnect</span>
            </div>
            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className={`md:hidden ${themeClasses.hover} p-2 rounded`}
            >
              <X className={`h-5 w-5 ${themeClasses.textMuted}`} />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profile', label: 'Update Profile', icon: User },
              { id: 'placements', label: 'Placements', icon: Briefcase },
              { id: 'events', label: 'Events', icon: CalendarDays },
              { id: 'assessments', label: 'Skill Tests', icon: ClipboardCheck },
              { id: 'mails', label: 'Mails', icon: FileText, isModal: true }
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
                    setMobileMenuOpen(false); // Close mobile menu on selection
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 font-medium transition-all ${
                    activeTab === item.id && !item.isModal
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                      : `${themeClasses.textMuted} ${themeClasses.hover}`
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
              <div className="relative group">
                <img
                  src={currentUser?.photo ? `http://localhost:5001${currentUser.photo}` : "https://ui-avatars.com/api/?name=" + encodeURIComponent(currentUser?.name || "User") + "&background=1f2937&color=fff"}
                  alt="Profile"
                  className="h-10 w-10 border border-gray-300 rounded-full object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Upload className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
                {uploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <div>
                <p className={`font-medium ${themeClasses.text} text-sm`}>{currentUser?.name || 'User'}</p>
                <p className={`text-xs ${themeClasses.textMuted}`}>{currentUser?.department || currentUser?.role || 'Student'}</p>
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
      <div className="flex-1 overflow-y-auto w-full md:w-auto">
        {/* Top Header Bar */}
        <header className={`${themeClasses.card} border-b px-4 md:px-8 py-4 sticky top-0 z-30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className={`md:hidden ${themeClasses.hover} p-2 rounded -ml-2`}
              >
                <Menu className={`h-6 w-6 ${themeClasses.textMuted}`} />
              </button>
              <div>
                <h1 className={`text-xl md:text-2xl font-semibold ${themeClasses.text}`}>Student Portal</h1>
                <p className={`${themeClasses.textMuted} text-xs md:text-sm mt-1 hidden sm:block`}>Welcome back, {currentUser?.name || 'Student'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => setShowEmailInbox(true)}
                className={`relative p-2 ${themeClasses.hover} rounded`}
                title="Email Inbox"
              >
                <svg className={`h-5 w-5 ${themeClasses.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
              <button className={`relative p-2 ${themeClasses.hover} rounded`}>
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

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  {/* Assignments Section */}
                  <div className={`${themeClasses.card} border overflow-hidden`}>
                    <div className={`px-4 md:px-6 py-3 md:py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <FileText className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                          <h2 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Assignments & Tasks</h2>
                        </div>
                        <button className={`${themeClasses.text} text-xs md:text-sm font-medium hover:underline`}>View All</button>
                      </div>
                    </div>
                    <div className={`divide-y ${themeClasses.border}`}>
                      {assignments.length === 0 ? (
                        <div className={`p-8 text-center ${themeClasses.textMuted}`}>
                          <FileText className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <p className="text-sm">No assignments available</p>
                        </div>
                      ) : (
                        assignments.map((assignment, idx) => (
                          <div key={idx} className={`p-3 md:p-4 ${themeClasses.hover} transition-colors`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-medium ${themeClasses.text} mb-1 text-sm md:text-base`}>{assignment.title}</h3>
                                <p className={`text-xs ${themeClasses.textMuted} mb-2`}>{assignment.description?.slice(0, 100)}...</p>
                                <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm ${themeClasses.textMuted} gap-1 sm:gap-0`}>
                                  <span className="flex items-center space-x-1">
                                    <BookOpen className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    <span className="truncate">{assignment.course}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</span>
                                  </span>
                                  <span className={`flex items-center space-x-1 ${themeClasses.text} font-medium`}>
                                    {assignment.points} pts
                                  </span>
                                </div>
                              </div>
                              <span className={`px-2 md:px-3 py-1 text-xs font-medium border whitespace-nowrap flex-shrink-0 ${
                                assignment.priority === 'High' 
                                  ? isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-50 text-red-700 border-red-200'
                                  : assignment.priority === 'Medium' 
                                    ? isDark ? 'bg-yellow-900/50 text-yellow-400 border-yellow-700' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : themeClasses.badge
                              }`}>
                                {assignment.priority || 'Normal'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* News Feed */}
                  <div className={`${themeClasses.card} border overflow-hidden`}>
                    <div className={`px-4 md:px-6 py-3 md:py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <Bell className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                        <h2 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Campus News</h2>
                      </div>
                    </div>
                    <div className={`divide-y ${themeClasses.border}`}>
                      <div className={`p-8 text-center ${themeClasses.textMuted}`}>
                        <Bell className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className="text-sm">No news available</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4 md:space-y-6">
                  {/* Upcoming Events */}
                  <div className={`${themeClasses.card} border overflow-hidden`}>
                    <div className={`px-4 md:px-6 py-3 md:py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-2 md:space-x-3">
                        <CalendarDays className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                        <h2 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Upcoming Events</h2>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 space-y-3">
                      {collegeEvents.length === 0 ? (
                        <div className={`py-8 text-center ${themeClasses.textMuted}`}>
                          <CalendarDays className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                          <p className="text-sm">No upcoming events</p>
                        </div>
                      ) : (
                        collegeEvents.slice(0, 3).map((event, idx) => (
                          <div key={idx} className={`p-3 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
                            <p className={`text-xs font-medium ${themeClasses.textMuted} mb-1`}>{event.date}</p>
                            <p className={`text-sm font-semibold ${themeClasses.text}`}>{event.title}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Study Resources */}
                  <div className={`${themeClasses.card} border overflow-hidden`}>
                    <div className={`px-6 py-4 border-b ${themeClasses.border} ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <BookOpen className={`h-5 w-5 ${themeClasses.icon}`} />
                        <h2 className={`text-base font-semibold ${themeClasses.text}`}>Study Resources</h2>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {studyResources.length === 0 ? (
                        <div className={`text-center py-6 ${themeClasses.textMuted}`}>
                          <BookOpen className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                          <p className="text-sm">No resources available</p>
                        </div>
                      ) : studyResources.map((resource, idx) => (
                        <div key={idx} className={`p-3 ${isDark ? 'bg-gray-700 border-gray-600 hover:border-gray-400' : 'bg-gray-50 border-gray-200 hover:border-gray-900'} border transition-all cursor-pointer`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`font-medium ${themeClasses.text} text-sm mb-1`}>{resource.title}</h3>
                              <p className={`text-xs ${themeClasses.textMuted} mb-1`}>{resource.subject} • {resource.resourceType}</p>
                              <div className={`flex items-center space-x-3 text-xs ${themeClasses.textMuted}`}>
                                <span className="flex items-center space-x-1">
                                  <Download className="h-3 w-3" />
                                  <span>{resource.downloadCount || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Trophy className={`h-3 w-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                  <span>{resource.rating || 0}</span>
                                </span>
                              </div>
                            </div>
                            <a 
                              href={resource.fileUrl || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`p-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-900 hover:bg-gray-800'} transition-colors`}
                            >
                              <Download className="h-4 w-4 text-white" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-900'} p-6`}>
                    <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                      <button className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-3 transition-all flex items-center justify-between px-4 text-sm">
                        <span className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Upload Assignment</span>
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-3 transition-all flex items-center justify-between px-4 text-sm">
                        <span className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>Message Mentor</span>
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-3 transition-all flex items-center justify-between px-4 text-sm">
                        <span className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Update Profile</span>
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setShowResumeAnalyzer(true)}
                        className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-3 transition-all flex items-center justify-between px-4 text-sm">
                        <span className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Analyze Resume</span>
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setShowSkillAssessment(true)}
                        className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-medium py-3 transition-all flex items-center justify-between px-4 text-sm">
                        <span className="flex items-center space-x-2">
                          <ClipboardCheck className="h-4 w-4" />
                          <span>Take Skill Test</span>
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Profile Update Tab */}
          {activeTab === 'profile' && (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className={`${themeClasses.card} border p-4 md:p-6 lg:p-8`}>
                <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
                  <User className={`h-5 w-5 md:h-6 md:w-6 ${themeClasses.icon}`} />
                  <h2 className={`text-lg md:text-xl font-semibold ${themeClasses.text}`}>Update Profile</h2>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Department</label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Year</label>
                      <select
                        value={profileData.year}
                        onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                        className={`w-full px-4 py-2.5 border rounded-lg ${themeClasses.input} cursor-pointer transition text-sm md:text-base`}
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>CGPA</label>
                      <input
                        type="text"
                        value={profileData.cgpa}
                        onChange={(e) => setProfileData({...profileData, cgpa: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>Skills</label>
                    <textarea
                      value={profileData.skills}
                      onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                      rows="3"
                      className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      placeholder="e.g., React, Node.js, Python"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>LinkedIn Profile</label>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.textMuted} mb-2`}>GitHub Profile</label>
                      <input
                        type="url"
                        value={profileData.github}
                        onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                        className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full ${themeClasses.button} font-medium py-2 md:py-3 transition-all text-sm md:text-base`}
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Profile Photo Upload */}
              <div className={`${themeClasses.card} border p-4 md:p-6`}>
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <User className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                  <h3 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Profile Photo</h3>
                </div>
                <div className="flex flex-col items-center">
                  <div className="relative group mb-4">
                    <img
                      src={currentUser?.photo ? `http://localhost:5001${currentUser.photo}` : "https://ui-avatars.com/api/?name=" + encodeURIComponent(currentUser?.name || "User") + "&background=1f2937&color=fff&size=128"}
                      alt="Profile"
                      className={`h-24 w-24 md:h-32 md:w-32 border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded-full object-cover`}
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Upload className="h-6 w-6 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs ${themeClasses.textMuted} text-center`}>Hover over photo to change</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>JPG, PNG (MAX. 5MB)</p>
                </div>
              </div>

              {/* Upload Resume */}
              <div className={`${themeClasses.card} border p-4 md:p-6`}>
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <Upload className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                  <h3 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Upload Resume</h3>
                </div>
                <label className={`block border-2 border-dashed ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-900'} p-6 md:p-8 text-center transition-colors cursor-pointer`}>
                  <input
                    type="file"
                    id="resumeInput"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                  <Upload className={`h-8 w-8 md:h-10 md:w-10 ${isDark ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-2 md:mb-3`} />
                  {resumeFile ? (
                    <>
                      <p className="text-xs md:text-sm font-medium text-green-600">{resumeFile.name}</p>
                      <p className={`text-xs ${themeClasses.textMuted} mt-1`}>{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <p className={`text-xs md:text-sm font-medium ${themeClasses.text}`}>Click to upload or drag and drop</p>
                      <p className={`text-xs ${themeClasses.textMuted} mt-1`}>PDF, DOC, DOCX (MAX. 5MB)</p>
                    </>
                  )}
                </label>
                <button 
                  onClick={submitResume}
                  disabled={!resumeFile || uploadingResume}
                  className={`w-full mt-3 md:mt-4 font-medium py-2 text-sm md:text-base transition-all ${
                    resumeFile && !uploadingResume
                      ? themeClasses.button
                      : isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {uploadingResume ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Uploading...
                    </span>
                  ) : (
                    'Upload Resume'
                  )}
                </button>
              </div>

              {/* Upload Certificates */}
              <div className={`${themeClasses.card} border p-4 md:p-6`}>
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <FileText className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                  <h3 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Certificates</h3>
                </div>
                <div className={`border-2 border-dashed ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-900'} p-6 md:p-8 text-center transition-colors cursor-pointer`}>
                  <FileText className={`h-8 w-8 md:h-10 md:w-10 ${isDark ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-2 md:mb-3`} />
                  <p className={`text-xs md:text-sm font-medium ${themeClasses.text}`}>Upload Certificates</p>
                  <p className={`text-xs ${themeClasses.textMuted} mt-1`}>PDF, JPG, PNG (MAX. 10MB)</p>
                </div>
                <button className={`w-full mt-3 md:mt-4 ${themeClasses.button} font-medium py-2 text-sm md:text-base`}>
                  Add Certificate
                </button>
              </div>

              {/* Achievements */}
              <div className={`${themeClasses.card} border p-4 md:p-6`}>
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <Trophy className={`h-4 w-4 md:h-5 md:w-5 ${themeClasses.icon}`} />
                  <h3 className={`text-sm md:text-base font-semibold ${themeClasses.text}`}>Achievements</h3>
                </div>
                <textarea
                  rows="4"
                  placeholder="Add your achievements, awards, or recognitions..."
                  className={`w-full px-3 py-2 border ${themeClasses.input} text-sm md:text-base`}
                ></textarea>
                <button className={`w-full mt-3 md:mt-4 ${themeClasses.button} font-medium py-2 text-sm md:text-base`}>
                  Save Achievements
                </button>
              </div>
            </div>
          </div>
          </>
        )}

          {/* Placements & Internships Tab */}
          {activeTab === 'placements' && (
          <>
            <div className="space-y-4 md:space-y-6">
            <div className={`${themeClasses.card} border p-4 md:p-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Briefcase className={`h-5 w-5 md:h-6 md:w-6 ${themeClasses.icon}`} />
                  <h2 className={`text-lg md:text-xl font-semibold ${themeClasses.text}`}>Placements & Internships</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className={`px-3 md:px-4 py-2 border ${themeClasses.buttonSecondary} font-medium text-xs md:text-sm`}>
                    Filter
                  </button>
                  <button className={`px-3 md:px-4 py-2 ${themeClasses.button} font-medium text-xs md:text-sm`}>
                    Applied (3)
                  </button>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {placements.length === 0 ? (
                  <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                    <Briefcase className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p>No placements available at the moment</p>
                  </div>
                ) : (
                  placements.map((placement, idx) => {
                    const isApplied = myApplications.some(app => app.placement?._id === placement._id);
                    return (
                      <div
                        key={placement._id || idx}
                        className={`border ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-900'} p-4 md:p-6 transition-all`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start space-x-3 md:space-x-4 flex-1 min-w-0">
                            <CompanyLogo companyName={placement.company} size="lg" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className={`text-base md:text-lg font-semibold ${themeClasses.text}`}>{placement.company}</h3>
                                <span className={`px-2 py-1 text-xs font-medium border whitespace-nowrap ${
                                  placement.status === 'Open' 
                                    ? isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200'
                                    : themeClasses.badge
                                }`}>
                                  {placement.status}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium ${themeClasses.badge} border whitespace-nowrap`}>
                                  {placement.jobType || placement.mode || 'Full-time'}
                                </span>
                              </div>
                              <p className={`text-sm md:text-base font-medium ${themeClasses.text} mb-2`}>{placement.role}</p>
                              <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-1 sm:gap-0 text-xs md:text-sm ${themeClasses.textMuted}`}>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span className="font-medium">{placement.package}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                  <span>Deadline: {new Date(placement.applicationDeadline).toLocaleDateString()}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          {isApplied ? (
                            <span className={`mt-3 sm:mt-0 px-3 md:px-4 py-2 ${isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200'} font-medium text-xs md:text-sm whitespace-nowrap border`}>
                              ✓ Applied
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleApprovalRequest(placement, 'placement')}
                              className={`mt-3 sm:mt-0 px-3 md:px-4 py-2 ${themeClasses.button} font-medium text-xs md:text-sm whitespace-nowrap`}
                            >
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          </>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
          <>
            <div className="space-y-4 md:space-y-6">
            <div className={`${themeClasses.card} border p-4 md:p-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <CalendarDays className={`h-5 w-5 md:h-6 md:w-6 ${themeClasses.icon}`} />
                  <h2 className={`text-lg md:text-xl font-semibold ${themeClasses.text}`}>Events</h2>
                </div>
                <button 
                  onClick={() => setShowCalendar(true)}
                  className={`px-4 py-2 border ${themeClasses.buttonSecondary} font-medium text-sm flex items-center space-x-2`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Calendar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {collegeEvents.length === 0 ? (
                  <div className={`col-span-2 text-center py-8 ${themeClasses.textMuted}`}>
                    <CalendarDays className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  collegeEvents.map((event, idx) => {
                    const isRegistered = myEventRegistrations.some(reg => reg.event?._id === event._id);
                    const eventDate = new Date(event.date);
                    const isPast = eventDate < new Date();
                    
                    return (
                      <div
                        key={event._id || idx}
                        className={`border ${isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-900'} p-4 md:p-6 transition-all ${isPast ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3 md:mb-4">
                          <h3 className={`text-base md:text-lg font-semibold ${themeClasses.text} flex-1`}>
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <span className={`px-2 py-1 text-xs font-medium ${themeClasses.badge} border whitespace-nowrap flex-shrink-0`}>
                              {event.eventType || event.status || 'Event'}
                            </span>
                            {isPast && (
                              <span className={`px-2 py-1 text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>Past</span>
                            )}
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className={`text-xs md:text-sm ${themeClasses.textMuted} mb-3 md:mb-4 line-clamp-2`}>{event.description}</p>
                        )}
                        <div className={`space-y-2 text-xs md:text-sm ${themeClasses.textMuted}`}>
                          <div className="flex items-center space-x-2">
                            <CalendarDays className={`h-3 w-3 md:h-4 md:w-4 ${themeClasses.icon} flex-shrink-0`} />
                            <span className="font-medium">
                              {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {event.time && (
                            <div className="flex items-center space-x-2">
                              <Clock className={`h-3 w-3 md:h-4 md:w-4 ${themeClasses.icon} flex-shrink-0`} />
                              <span>{event.time}{event.endTime ? ` - ${event.endTime}` : ''}</span>
                            </div>
                          )}
                          {(event.venue || event.location) && (
                            <div className="flex items-center space-x-2">
                              <MapPin className={`h-3 w-3 md:h-4 md:w-4 ${themeClasses.icon} flex-shrink-0`} />
                              <span className="truncate">{event.venue || event.location}</span>
                            </div>
                          )}
                          {event.mode && (
                            <div className="flex items-center space-x-2">
                              <Tag className={`h-3 w-3 md:h-4 md:w-4 ${themeClasses.icon} flex-shrink-0`} />
                              <span>{event.mode}</span>
                            </div>
                          )}
                        </div>
                        
                        {isRegistered ? (
                          <span className={`w-full mt-3 md:mt-4 px-3 md:px-4 py-2 ${isDark ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200'} border font-medium flex items-center justify-center space-x-2 text-xs md:text-sm`}>
                            ✓ Registered
                          </span>
                        ) : !isPast ? (
                          <button 
                            onClick={() => handleApprovalRequest(event, 'event')}
                            className={`w-full mt-3 md:mt-4 px-3 md:px-4 py-2 ${themeClasses.button} font-medium transition-all flex items-center justify-center space-x-2 text-xs md:text-sm`}
                          >
                            <span>Register</span>
                          </button>
                        ) : (
                          <span className={`w-full mt-3 md:mt-4 px-3 md:px-4 py-2 ${isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-200'} border font-medium flex items-center justify-center text-xs md:text-sm`}>
                            Event Ended
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          {/* Calendar Panel for Students */}
          <CalendarPanel
            isOpen={showCalendar}
            onClose={() => setShowCalendar(false)}
            user={currentUser}
            canManageEvents={false}
            showToast={showToast}
            myRegistrations={myEventRegistrations}
            onRegisterForEvent={(event) => handleApprovalRequest(event, 'event')}
          />
          </>
          )}

          {/* Skill Assessments Tab */}
          {activeTab === 'assessments' && (
            <div>
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className={`text-xl md:text-2xl font-bold ${themeClasses.text}`}>Skill Assessments</h1>
                  <p className={`text-sm ${themeClasses.textMuted} mt-1`}>Test your skills and earn certificates</p>
                </div>
                <button
                  onClick={() => setShowSkillAssessment(true)}
                  className={`px-4 py-2 ${themeClasses.button} flex items-center gap-2`}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Take Assessment
                </button>
              </div>
              
              <div className={`${themeClasses.card} border p-6`}>
                <div className="text-center py-8">
                  <ClipboardCheck className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>Ready to Test Your Skills?</h3>
                  <p className={`${themeClasses.textMuted} mb-4`}>
                    Take skill assessments to showcase your abilities to potential employers
                  </p>
                  <button
                    onClick={() => setShowSkillAssessment(true)}
                    className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600`}
                  >
                    Browse Available Tests
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Modals */}
      {showResumeAnalyzer && (
        <ResumeAnalyzer onClose={() => setShowResumeAnalyzer(false)} />
      )}
      {showSkillAssessment && (
        <SkillAssessment onClose={() => setShowSkillAssessment(false)} />
      )}
    </div>
  );
};

export default StudentDashboard;
