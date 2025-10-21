import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Briefcase,
  BarChart3,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Mail,
  Menu,
  ChevronLeft,
  CalendarDays,
  User,
  X,
  LogOut,
  Settings,
  Bell,
  Search,
  MessageCircle,
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  FileText,
  Download,
  Star,
  Inbox,
  Send,
  Filter,
  Tag,
  Sparkles,
  RefreshCw,
  Eye,
  Reply,
  Upload
} from 'lucide-react';

const StudentDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [approvalType, setApprovalType] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@college.edu',
    phone: '+1 234 567 8900',
    department: 'Computer Science',
    year: '3rd Year',
    cgpa: '8.6',
    skills: 'React, Node.js, Python, Java',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe'
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    showToast('Profile updated successfully!');
  };

  const handleApprovalRequest = (item, type) => {
    setSelectedItem(item);
    setApprovalType(type);
    setShowApprovalModal(true);
  };

  const submitApprovalRequest = (e) => {
    e.preventDefault();
    showToast(`Request sent to mentor for approval: ${selectedItem.title || selectedItem.company}`);
    setShowApprovalModal(false);
    setApprovalReason('');
  };

  const stats = [
    { label: 'Internships Applied', value: '12', change: '+3', icon: Briefcase, color: 'blue' },
    { label: 'Course Progress', value: '78%', change: '+5%', icon: TrendingUp, color: 'emerald' },
    { label: 'Mentor Meetings', value: '8', change: '+2', icon: UserCheck, color: 'purple' },
    { label: 'Current GPA', value: '8.6', change: '+0.2', icon: Trophy, color: 'orange' }
  ];

  const assignments = [
    { title: 'Data Structures Assignment', course: 'CS201', due: 'Sep 25', status: 'pending', priority: 'high' },
    { title: 'Web Development Project', course: 'CS305', due: 'Sep 28', status: 'inProgress', priority: 'medium' },
    { title: 'Database Lab Report', course: 'CS401', due: 'Oct 02', status: 'pending', priority: 'low' },
    { title: 'Machine Learning Quiz', course: 'CS501', due: 'Sep 24', status: 'submitted', priority: 'high' }
  ];

  const upcomingEvents = [
    { title: 'Tech Talk: AI in 2024', date: 'Sep 26', time: '2:00 PM', location: 'Auditorium', type: 'seminar' },
    { title: 'Mentor Meeting', date: 'Sep 24', time: '4:00 PM', location: 'Room 301', type: 'meeting' },
    { title: 'Career Fair', date: 'Sep 30', time: '10:00 AM', location: 'Main Hall', type: 'career' },
    { title: 'Coding Competition', date: 'Oct 05', time: '9:00 AM', location: 'Lab 2', type: 'competition' }
  ];

  const recentNews = [
    { headline: 'New placement records: 95% students placed', category: 'Placements', time: '2h ago' },
    { headline: 'Library hours extended during exam week', category: 'Academic', time: '5h ago' },
    { headline: 'Robotics Club wins national competition', category: 'Achievements', time: '1d ago' },
    { headline: 'Guest lecture by Google engineer tomorrow', category: 'Events', time: '2d ago' }
  ];

  const studyResources = [
    { title: 'Advanced Algorithms Notes', subject: 'CS', downloads: 245, rating: 4.8 },
    { title: 'Web Dev Crash Course', subject: 'CS', downloads: 189, rating: 4.6 },
    { title: 'Machine Learning Basics', subject: 'CS', downloads: 312, rating: 4.9 },
    { title: 'Database Design Guide', subject: 'CS', downloads: 156, rating: 4.5 }
  ];

  const placements = [
    { company: 'Google', role: 'Software Engineer', package: '₹45 LPA', type: 'Full-time', deadline: 'Oct 15', status: 'Open', logo: '🔵' },
    { company: 'Microsoft', role: 'SDE Intern', package: '₹80k/month', type: 'Internship', deadline: 'Oct 20', status: 'Open', logo: '🟦' },
    { company: 'Amazon', role: 'Backend Developer', package: '₹38 LPA', type: 'Full-time', deadline: 'Oct 25', status: 'Open', logo: '🟠' },
    { company: 'Meta', role: 'Frontend Engineer', package: '₹42 LPA', type: 'Full-time', deadline: 'Oct 18', status: 'Closing Soon', logo: '🔵' },
    { company: 'Tesla', role: 'ML Engineer Intern', package: '₹75k/month', type: 'Internship', deadline: 'Nov 01', status: 'Open', logo: '🔴' }
  ];

  const collegeEvents = [
    { title: 'Tech Fest 2024', date: 'Oct 28-30', type: 'Festival', venue: 'Main Campus', description: 'Annual technical festival with competitions and workshops' },
    { title: 'AI/ML Workshop', date: 'Oct 22', type: 'Workshop', venue: 'Lab 301', description: 'Hands-on workshop on Machine Learning fundamentals' },
    { title: 'Startup Pitch Competition', date: 'Nov 05', type: 'Competition', venue: 'Auditorium', description: 'Present your startup ideas and win funding' },
    { title: 'Career Counseling Session', date: 'Oct 26', type: 'Seminar', venue: 'Room 201', description: 'Expert guidance on career paths and opportunities' },
    { title: 'Hackathon 48hrs', date: 'Nov 10-12', type: 'Hackathon', venue: 'Computer Lab', description: '48-hour coding marathon with exciting prizes' }
  ];

  // Gmail Integration State
  const [gmailConnected, setGmailConnected] = useState(false);
  const [emailFilter, setEmailFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Mock emails with AI categories (will be replaced with real Gmail data)
  const [mails, setMails] = useState([
    { 
      id: 1,
      from: 'placement@college.edu', 
      fromName: 'Placement Cell',
      subject: 'Google Campus Drive Scheduled - Oct 15', 
      body: 'Dear Students,\n\nWe are excited to announce that Google will be conducting a campus recruitment drive on October 15th. Eligible students are requested to register on the placement portal.\n\nEligibility:\n- CGPA: 7.5+\n- No active backlogs\n- CS/IT branches\n\nDeadline: Oct 12\n\nBest regards,\nPlacement Cell',
      time: '2h ago',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: true, 
      important: true,
      category: 'Career', // AI-categorized
      aiConfidence: 0.95,
      labels: ['Placement', 'Urgent']
    },
    { 
      id: 2,
      from: 'smith@college.edu', 
      fromName: 'Prof. John Smith',
      subject: 'Assignment Deadline Extended - Data Structures', 
      body: 'Hi Students,\n\nDue to the upcoming mid-term exams, the Data Structures assignment deadline has been extended to Oct 30th. Please make sure to submit quality work.\n\nRegards,\nProf. Smith',
      time: '5h ago',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      unread: true, 
      important: false,
      category: 'Academic', // AI-categorized
      aiConfidence: 0.92,
      labels: ['Assignment']
    },
    { 
      id: 3,
      from: 'career.services@college.edu', 
      fromName: 'Career Services',
      subject: 'Resume Building Workshop - Free Registration', 
      body: 'Hello,\n\nJoin our comprehensive Resume Building Workshop this Saturday. Learn from industry experts how to create an ATS-friendly resume.\n\nDate: Oct 28\nTime: 2 PM - 5 PM\nVenue: Seminar Hall\n\nRegister now!\n\nCareer Services Team',
      time: '1d ago',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: false, 
      important: true,
      category: 'Events', // AI-categorized
      aiConfidence: 0.88,
      labels: ['Workshop', 'Career']
    },
    { 
      id: 4,
      from: 'library@college.edu', 
      fromName: 'Library Administration',
      subject: 'Book Return Reminder - Overdue Fine', 
      body: 'Dear Student,\n\nThis is a reminder that you have 2 books overdue. Please return them by this week to avoid additional fines.\n\nOverdue Books:\n1. Introduction to Algorithms\n2. Computer Networks\n\nCurrent Fine: $5\n\nLibrary Desk',
      time: '2d ago',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false, 
      important: false,
      category: 'Administrative', // AI-categorized
      aiConfidence: 0.90,
      labels: ['Library']
    },
    { 
      id: 5,
      from: 'dean@college.edu', 
      fromName: 'Dean Office',
      subject: 'Semester Results Published - Check Portal', 
      body: 'Dear Students,\n\nThe results for the Spring 2024 semester have been published on the student portal. Please log in to check your grades.\n\nIf you have any queries, contact your respective HODs.\n\nBest wishes,\nDean Office',
      time: '3d ago',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      unread: false, 
      important: true,
      category: 'Academic', // AI-categorized
      aiConfidence: 0.97,
      labels: ['Results', 'Important']
    },
    { 
      id: 6,
      from: 'techfest@college.edu', 
      fromName: 'TechFest Committee',
      subject: 'TechFest 2024 - Call for Volunteers', 
      body: 'Hi Everyone,\n\nTechFest 2024 is coming! We are looking for enthusiastic volunteers to help organize various events.\n\nBenefits:\n- Certificate\n- Free TechFest pass\n- Networking opportunities\n\nInterested? Reply to this email.\n\nTechFest Team',
      time: '4d ago',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      unread: false, 
      important: false,
      category: 'Events', // AI-categorized
      aiConfidence: 0.85,
      labels: ['TechFest', 'Volunteer']
    },
    { 
      id: 7,
      from: 'alumni@college.edu', 
      fromName: 'Alumni Relations',
      subject: 'Alumni Meetup - Guest Lecture by Google Engineer', 
      body: 'Dear Students,\n\nOur alumnus, Mr. Rahul Sharma (Google, Senior SWE), will be conducting a guest lecture on "Career in Big Tech".\n\nDate: Nov 5\nTime: 4 PM\nMode: Hybrid (Auditorium + Online)\n\nDon\'t miss this opportunity!\n\nAlumni Committee',
      time: '5d ago',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      unread: false, 
      important: true,
      category: 'Events', // AI-categorized
      aiConfidence: 0.91,
      labels: ['Alumni', 'Career']
    },
    { 
      id: 8,
      from: 'noreply@newsletter.com', 
      fromName: 'Tech Newsletter',
      subject: 'Weekly Digest: Top 10 Programming Trends', 
      body: 'This week in tech...\n\n1. AI continues to dominate\n2. Rust gaining popularity\n3. Web3 challenges...\n\n[Full newsletter content]',
      time: '1w ago',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      unread: false, 
      important: false,
      category: 'Personal', // AI-categorized
      aiConfidence: 0.78,
      labels: ['Newsletter']
    }
  ]);

  // Connect to Gmail
  const connectGmail = () => {
    // In production, this would trigger OAuth2 flow
    // For now, simulate connection
    setToast('Connecting to Gmail...');
    setTimeout(() => {
      setGmailConnected(true);
      setToast('Gmail connected successfully! Categorizing emails with AI...');
      // Simulate fetching and categorizing emails
      setTimeout(() => {
        setToast('All emails categorized successfully!');
      }, 2000);
    }, 1500);
  };

  // Filter emails by category
  const filteredMails = mails.filter(mail => {
    const matchesFilter = emailFilter === 'all' || 
                         (emailFilter === 'unread' && mail.unread) ||
                         (emailFilter === 'important' && mail.important) ||
                         mail.category.toLowerCase() === emailFilter.toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
                         mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mail.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mail.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Mark email as read
  const markAsRead = (emailId) => {
    setMails(mails.map(mail => 
      mail.id === emailId ? { ...mail, unread: false } : mail
    ));
  };

  // Toggle important
  const toggleImportant = (emailId) => {
    setMails(mails.map(mail => 
      mail.id === emailId ? { ...mail, important: !mail.important } : mail
    ));
  };

  // Get category stats
  const getCategoryStats = () => {
    const stats = {
      all: mails.length,
      unread: mails.filter(m => m.unread).length,
      important: mails.filter(m => m.important).length,
      Academic: mails.filter(m => m.category === 'Academic').length,
      Career: mails.filter(m => m.category === 'Career').length,
      Events: mails.filter(m => m.category === 'Events').length,
      Administrative: mails.filter(m => m.category === 'Administrative').length,
      Personal: mails.filter(m => m.category === 'Personal').length,
    };
    return stats;
  };

  const categoryStats = getCategoryStats();

  const colorClasses = {
    blue: 'bg-gray-100 text-gray-700',
    emerald: 'bg-gray-100 text-gray-700',
    purple: 'bg-gray-100 text-gray-700',
    orange: 'bg-gray-100 text-gray-700'
  };

  const priorityColors = {
    high: 'border-l-4 border-l-gray-900 bg-gray-50',
    medium: 'border-l-4 border-l-gray-600 bg-gray-50',
    low: 'border-l-4 border-l-gray-400 bg-gray-50'
  };

  const statusBadges = {
    pending: 'bg-gray-100 text-gray-700',
    inProgress: 'bg-gray-100 text-gray-700',
    submitted: 'bg-gray-100 text-gray-700'
  };

  const eventTypeColors = {
    seminar: 'bg-gray-100 text-gray-700',
    meeting: 'bg-gray-100 text-gray-700',
    career: 'bg-gray-100 text-gray-700',
    competition: 'bg-gray-100 text-gray-700'
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 shadow px-6 py-3 flex items-center space-x-3">
          <CheckCircle2 className="h-5 w-5 text-gray-700" />
          <span className="text-sm text-gray-900">{toast}</span>
        </div>
      )}

      {/* Approval Request Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Request Approval</h2>
              <button onClick={() => setShowApprovalModal(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                {approvalType === 'placement' ? 'Placement/Internship' : 'Event Registration'}
              </p>
              <p className="text-base font-semibold text-gray-900">
                {selectedItem?.title || selectedItem?.company || ''}
              </p>
            </div>

            <form onSubmit={submitApprovalRequest}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Application
                </label>
                <textarea
                  required
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                  placeholder="Why do you want to participate? What are your expectations?"
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-900 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-base">CampusConnect</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profile', label: 'Update Profile', icon: User },
              { id: 'mails', label: 'Mails', icon: Mail },
              { id: 'placements', label: 'Placements', icon: Briefcase },
              { id: 'events', label: 'Events', icon: CalendarDays }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
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
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Profile"
                className="h-10 w-10 border border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">John Doe</p>
                <p className="text-xs text-gray-600">CS Engineering</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Student Portal</h1>
              <p className="text-gray-600 text-sm mt-1">Welcome back, John Doe</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
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
                      className="bg-white p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-gray-100">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1">
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Assignments Section */}
                  <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-700" />
                          <h2 className="text-base font-semibold text-gray-900">Assignments & Tasks</h2>
                        </div>
                        <button className="text-gray-900 text-sm font-medium hover:underline">View All</button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {assignments.map((assignment, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{assignment.title}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{assignment.course}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>Due: {assignment.due}</span>
                                </span>
                              </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {assignment.status === 'inProgress' ? 'In Progress' : assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* News Feed */}
                  <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-gray-700" />
                        <h2 className="text-base font-semibold text-gray-900">Campus News</h2>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {recentNews.map((news, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{news.headline}</h3>
                              <div className="flex items-center space-x-3 text-xs text-gray-600">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 font-medium border border-gray-200">
                                  {news.category}
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{news.time}</span>
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Upcoming Events */}
                  <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <CalendarDays className="h-5 w-5 text-gray-700" />
                        <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {upcomingEvents.map((event, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 border border-gray-200 hover:border-gray-900 transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p className="flex items-center space-x-2">
                              <CalendarDays className="h-3 w-3" />
                              <span>{event.date} at {event.time}</span>
                            </p>
                            <p className="flex items-center space-x-2">
                              <User className="h-3 w-3" />
                              <span>{event.location}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Resources */}
                  <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-gray-700" />
                        <h2 className="text-base font-semibold text-gray-900">Study Resources</h2>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {studyResources.map((resource, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 border border-gray-200 hover:border-gray-900 transition-all cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-sm mb-1">{resource.title}</h3>
                              <div className="flex items-center space-x-3 text-xs text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Download className="h-3 w-3" />
                                  <span>{resource.downloads}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Trophy className="h-3 w-3 text-gray-500" />
                                  <span>{resource.rating}</span>
                                </span>
                              </div>
                            </div>
                            <button className="p-2 bg-gray-900 hover:bg-gray-800 transition-colors">
                              <Download className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-900 p-6">
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
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Profile Update Tab */}
          {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="h-6 w-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Update Profile</h2>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <select
                        value={profileData.year}
                        onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CGPA</label>
                      <input
                        type="text"
                        value={profileData.cgpa}
                        onChange={(e) => setProfileData({...profileData, cgpa: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                    <textarea
                      value={profileData.skills}
                      onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      placeholder="e.g., React, Node.js, Python"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
                      <input
                        type="url"
                        value={profileData.github}
                        onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 transition-all"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload Resume */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="h-5 w-5 text-gray-700" />
                  <h3 className="text-base font-semibold text-gray-900">Upload Resume</h3>
                </div>
                <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-900 transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (MAX. 5MB)</p>
                </div>
                <button className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2">
                  Upload Resume
                </button>
              </div>

              {/* Upload Certificates */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-5 w-5 text-gray-700" />
                  <h3 className="text-base font-semibold text-gray-900">Certificates</h3>
                </div>
                <div className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-900 transition-colors cursor-pointer">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">Upload Certificates</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (MAX. 10MB)</p>
                </div>
                <button className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2">
                  Add Certificate
                </button>
              </div>

              {/* Achievements */}
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Trophy className="h-5 w-5 text-gray-700" />
                  <h3 className="text-base font-semibold text-gray-900">Achievements</h3>
                </div>
                <textarea
                  rows="4"
                  placeholder="Add your achievements, awards, or recognitions..."
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-gray-900"
                ></textarea>
                <button className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2">
                  Save Achievements
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Mails Tab - Gmail Integration with AI Categorization */}
          {activeTab === 'mails' && (
            <div className="h-full flex flex-col">
              {!gmailConnected ? (
                // Gmail Connection Screen
                <div className="bg-white border border-gray-200 p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="h-20 w-20 bg-gray-100 border border-gray-300 mx-auto mb-6 flex items-center justify-center">
                      <Mail className="h-10 w-10 text-gray-700" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Connect Your Gmail</h2>
                    <p className="text-gray-600 mb-6">
                      Connect your Gmail account to access your emails directly from CampusConnect. 
                      Our AI will automatically categorize your emails into Academic, Career, Events, and more.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 p-4 mb-6 text-left">
                      <div className="flex items-start space-x-3 mb-3">
                        <Sparkles className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm mb-1">AI-Powered Categorization</p>
                          <p className="text-xs text-gray-600">Automatically sorts emails into relevant categories</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 mb-3">
                        <Tag className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm mb-1">Smart Labels</p>
                          <p className="text-xs text-gray-600">Get intelligent tags for quick filtering</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Bell className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm mb-1">Priority Inbox</p>
                          <p className="text-xs text-gray-600">Important emails highlighted automatically</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={connectGmail}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 mb-3 transition-all flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-5 w-5" />
                      <span>Connect Gmail Account</span>
                    </button>
                    <p className="text-xs text-gray-500">
                      We'll never access your personal emails without permission. You control what we see.
                    </p>
                  </div>
                </div>
              ) : (
                // Gmail Inbox with AI Categories
                <div className="flex h-full">
                  {/* Sidebar - Categories */}
                  <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <button
                        onClick={() => setShowComposeModal(true)}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 flex items-center justify-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Compose</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                      <div className="space-y-1">
                        {/* All Mails */}
                        <button
                          onClick={() => setEmailFilter('all')}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                            emailFilter === 'all'
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Inbox className="h-4 w-4" />
                            <span>All Mail</span>
                          </div>
                          <span className={`text-xs ${emailFilter === 'all' ? 'text-white' : 'text-gray-500'}`}>
                            {categoryStats.all}
                          </span>
                        </button>

                        {/* Unread */}
                        <button
                          onClick={() => setEmailFilter('unread')}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                            emailFilter === 'unread'
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Mail className="h-4 w-4" />
                            <span>Unread</span>
                          </div>
                          <span className={`text-xs ${emailFilter === 'unread' ? 'text-white' : 'text-gray-500'}`}>
                            {categoryStats.unread}
                          </span>
                        </button>

                        {/* Important */}
                        <button
                          onClick={() => setEmailFilter('important')}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                            emailFilter === 'important'
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Star className="h-4 w-4" />
                            <span>Important</span>
                          </div>
                          <span className={`text-xs ${emailFilter === 'important' ? 'text-white' : 'text-gray-500'}`}>
                            {categoryStats.important}
                          </span>
                        </button>

                        <div className="border-t border-gray-200 my-2 pt-2">
                          <div className="px-3 py-2 flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-gray-700" />
                            <span className="text-xs font-semibold text-gray-700 uppercase">AI Categories</span>
                          </div>

                          {/* Academic */}
                          <button
                            onClick={() => setEmailFilter('academic')}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                              emailFilter === 'academic'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <BookOpen className="h-4 w-4" />
                              <span>Academic</span>
                            </div>
                            <span className={`text-xs ${emailFilter === 'academic' ? 'text-white' : 'text-gray-500'}`}>
                              {categoryStats.Academic}
                            </span>
                          </button>

                          {/* Career */}
                          <button
                            onClick={() => setEmailFilter('career')}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                              emailFilter === 'career'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Briefcase className="h-4 w-4" />
                              <span>Career</span>
                            </div>
                            <span className={`text-xs ${emailFilter === 'career' ? 'text-white' : 'text-gray-500'}`}>
                              {categoryStats.Career}
                            </span>
                          </button>

                          {/* Events */}
                          <button
                            onClick={() => setEmailFilter('events')}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                              emailFilter === 'events'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <CalendarDays className="h-4 w-4" />
                              <span>Events</span>
                            </div>
                            <span className={`text-xs ${emailFilter === 'events' ? 'text-white' : 'text-gray-500'}`}>
                              {categoryStats.Events}
                            </span>
                          </button>

                          {/* Administrative */}
                          <button
                            onClick={() => setEmailFilter('administrative')}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                              emailFilter === 'administrative'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4" />
                              <span>Administrative</span>
                            </div>
                            <span className={`text-xs ${emailFilter === 'administrative' ? 'text-white' : 'text-gray-500'}`}>
                              {categoryStats.Administrative}
                            </span>
                          </button>

                          {/* Personal */}
                          <button
                            onClick={() => setEmailFilter('personal')}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all ${
                              emailFilter === 'personal'
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4" />
                              <span>Personal</span>
                            </div>
                            <span className={`text-xs ${emailFilter === 'personal' ? 'text-white' : 'text-gray-500'}`}>
                              {categoryStats.Personal}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={connectGmail}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Sync Gmail</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Content - Email List or Email Detail */}
                  <div className="flex-1 flex flex-col bg-gray-50">
                    {!selectedEmail ? (
                      // Email List View
                      <>
                        <div className="bg-white border-b border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                              {emailFilter === 'all' ? 'All Mail' : 
                               emailFilter === 'unread' ? 'Unread' :
                               emailFilter === 'important' ? 'Important' :
                               emailFilter.charAt(0).toUpperCase() + emailFilter.slice(1)}
                            </h2>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">{filteredMails.length} emails</span>
                            </div>
                          </div>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search emails..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                          {filteredMails.length === 0 ? (
                            <div className="p-12 text-center">
                              <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-600 font-medium">No emails found</p>
                              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200 bg-white">
                              {filteredMails.map((mail) => (
                                <div
                                  key={mail.id}
                                  onClick={() => {
                                    setSelectedEmail(mail);
                                    if (mail.unread) markAsRead(mail.id);
                                  }}
                                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    mail.unread ? 'bg-blue-50 border-l-4 border-l-gray-900' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className={`text-sm truncate ${
                                          mail.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                        }`}>
                                          {mail.fromName}
                                        </p>
                                        {mail.unread && (
                                          <span className="flex-shrink-0 h-2 w-2 bg-gray-900 rounded-full"></span>
                                        )}
                                      </div>
                                      <h3 className={`text-sm mb-1 truncate ${
                                        mail.unread ? 'font-medium text-gray-900' : 'text-gray-700'
                                      }`}>
                                        {mail.subject}
                                      </h3>
                                      <p className="text-xs text-gray-500 truncate mb-2">
                                        {mail.body.substring(0, 100)}...
                                      </p>
                                      <div className="flex items-center space-x-2 flex-wrap">
                                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                          <Tag className="h-3 w-3" />
                                          <span>{mail.category}</span>
                                        </span>
                                        {mail.labels.map((label, idx) => (
                                          <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs border border-gray-200">
                                            {label}
                                          </span>
                                        ))}
                                        {mail.important && (
                                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 text-right">
                                      <p className="text-xs text-gray-500 mb-2">{mail.time}</p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleImportant(mail.id);
                                        }}
                                        className="hover:bg-gray-200 p-1 rounded"
                                      >
                                        <Star className={`h-4 w-4 ${
                                          mail.important ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                                        }`} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Email Detail View
                      <div className="flex-1 flex flex-col bg-white">
                        <div className="border-b border-gray-200 p-4">
                          <button
                            onClick={() => setSelectedEmail(null)}
                            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 mb-4"
                          >
                            <ArrowRight className="h-4 w-4 rotate-180" />
                            <span>Back to inbox</span>
                          </button>
                          
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedEmail.subject}</h2>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-gray-900 text-white flex items-center justify-center font-semibold">
                                  {selectedEmail.fromName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{selectedEmail.fromName}</p>
                                  <p className="text-sm text-gray-600">{selectedEmail.from}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-2">{selectedEmail.time}</p>
                              <button
                                onClick={() => toggleImportant(selectedEmail.id)}
                                className="hover:bg-gray-100 p-2 rounded"
                              >
                                <Star className={`h-5 w-5 ${
                                  selectedEmail.important ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                                }`} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-900 text-white text-xs font-medium">
                              <Sparkles className="h-3 w-3" />
                              <span>{selectedEmail.category}</span>
                              <span className="opacity-75">({Math.round(selectedEmail.aiConfidence * 100)}% confidence)</span>
                            </span>
                            {selectedEmail.labels.map((label, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
                              {selectedEmail.body}
                            </pre>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm">
                              <Reply className="h-4 w-4" />
                              <span>Reply</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm">
                              <Send className="h-4 w-4" />
                              <span>Forward</span>
                            </button>
                            {selectedEmail.unread && (
                              <button
                                onClick={() => markAsRead(selectedEmail.id)}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium text-sm"
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
                </div>
              )}
            </div>
          )}

          {/* Placements & Internships Tab */}
          {activeTab === 'placements' && (
            <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-6 w-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Placements & Internships</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 border border-gray-300 font-medium hover:bg-gray-50 text-sm">
                    Filter
                  </button>
                  <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm">
                    Applied (3)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {placements.map((placement, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 p-6 hover:border-gray-900 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-3xl">{placement.logo}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{placement.company}</h3>
                            <span className={`px-2 py-1 text-xs font-medium border ${
                              placement.status === 'Open' 
                                ? 'bg-gray-100 text-gray-700 border-gray-200' 
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {placement.status}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              {placement.type}
                            </span>
                          </div>
                          <p className="text-base font-medium text-gray-900 mb-2">{placement.role}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
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
                      <button 
                        onClick={() => handleApprovalRequest(placement, 'placement')}
                        className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Request Approval</span>
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events & Workshops Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-6 w-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">College Events & Workshops</h2>
                </div>
                <button className="px-4 py-2 border border-gray-300 font-medium hover:bg-gray-50 text-sm">
                  View Calendar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collegeEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 p-6 hover:border-gray-900 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {event.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4 text-gray-700" />
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-700" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleApprovalRequest(event, 'event')}
                      className="w-full mt-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all flex items-center justify-center space-x-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Request Approval</span>
                    </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
