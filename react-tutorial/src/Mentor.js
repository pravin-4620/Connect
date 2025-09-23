import React, { useState, useEffect } from 'react';
import { 
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Mail,
  Bell,
  Home,
  FileText,
  Award,
  AlertCircle,
  User,
  Briefcase,
  Star,
  Target,
  BookOpen,
  ChevronRight,
  Phone,
  GraduationCap,
  Zap,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

const MentorDashboard = ({ onLogout = () => {} }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New application from Sarah Chen needs approval', type: 'urgent', time: '5 min ago' },
    { id: 2, message: 'John completed his mock interview', type: 'success', time: '2 hours ago' },
    { id: 3, message: 'Reminder: Weekly mentorship meeting tomorrow', type: 'info', time: '1 day ago' }
  ]);

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
    sidebarBg: darkMode ? 'bg-gray-900' : 'bg-white',
    sidebarBorder: darkMode ? 'border-gray-800' : 'border-gray-200',
    headerBg: darkMode ? 'bg-gray-800' : 'bg-white',
    headerBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
    textPrimary: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-500' : 'text-gray-500',
    input: darkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-300',
    inputFocus: darkMode ? 'focus:border-emerald-500 focus:ring-emerald-500' : 'focus:border-emerald-500 focus:ring-emerald-500',
    hover: darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100',
    divider: darkMode ? 'bg-gray-700' : 'bg-gray-200',
    tertiary: darkMode ? 'bg-gray-900/50' : 'bg-gray-100'
  };

  // Sample data
  const [mentorStats, setMentorStats] = useState({
    totalMentees: 24,
    pendingApprovals: 8,
    activeApplications: 15,
    successfulPlacements: 18,
    averageRating: 4.7,
    responseTime: '2.3 hours',
    meetingsThisWeek: 6,
    completedSessions: 142
  });

  const [mentees, setMentees] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      rollNumber: '21CSE045',
      email: 'sarah.chen@college.edu',
      department: 'Computer Science',
      year: 3,
      cgpa: 8.9,
      skills: ['React', 'Python', 'Machine Learning'],
      applications: 4,
      status: 'Active',
      lastMeeting: '3 days ago',
      nextMeeting: '2024-09-25 10:00 AM',
      performance: 'Excellent',
      goals: ['Improve DSA skills', 'Build portfolio', 'Prepare for interviews'],
      placement: { status: 'Interview Scheduled', company: 'TechCorp', stage: 'Technical Round' }
    },
    {
      id: 2,
      name: 'Rahul Kumar',
      rollNumber: '21IT023',
      email: 'rahul.kumar@college.edu',
      department: 'Information Technology',
      year: 4,
      cgpa: 7.8,
      skills: ['Java', 'Spring Boot', 'MySQL'],
      applications: 6,
      status: 'Needs Attention',
      lastMeeting: '1 week ago',
      nextMeeting: 'Not Scheduled',
      performance: 'Good',
      goals: ['System design preparation', 'Mock interviews', 'Resume improvement'],
      placement: { status: 'Applied', company: 'Multiple', stage: 'Waiting for response' }
    },
    {
      id: 3,
      name: 'Priya Sharma',
      rollNumber: '21CSE067',
      email: 'priya.sharma@college.edu',
      department: 'Computer Science',
      year: 3,
      cgpa: 9.2,
      skills: ['JavaScript', 'Node.js', 'MongoDB'],
      applications: 3,
      status: 'Excellent',
      lastMeeting: '2 days ago',
      nextMeeting: '2024-09-24 2:00 PM',
      performance: 'Outstanding',
      goals: ['Full-stack projects', 'Open source contributions', 'Leadership skills'],
      placement: { status: 'Placed', company: 'DataFlow Inc', stage: 'Offer Accepted' }
    }
  ]);

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      student: {
        name: 'Alex Johnson',
        rollNumber: '21CSE089',
        email: 'alex.johnson@college.edu',
        cgpa: 8.4
      },
      internship: {
        title: 'Software Development Intern',
        company: 'TechCorp',
        location: 'Mumbai',
        stipend: '₹25,000',
        duration: '6 months'
      },
      appliedDate: '2024-09-20',
      resume: 'Available',
      coverLetter: 'Submitted',
      status: 'Pending Review'
    },
    {
      id: 2,
      student: {
        name: 'Maya Patel',
        rollNumber: '21IT045',
        email: 'maya.patel@college.edu',
        cgpa: 8.7
      },
      internship: {
        title: 'Data Science Intern',
        company: 'DataFlow Inc',
        location: 'Bangalore',
        stipend: '₹30,000',
        duration: '4 months'
      },
      appliedDate: '2024-09-19',
      resume: 'Available',
      coverLetter: 'Submitted',
      status: 'Urgent Review'
    }
  ]);

  const [upcomingMeetings, setUpcomingMeetings] = useState([
    {
      id: 1,
      student: 'Sarah Chen',
      type: 'Career Guidance',
      date: '2024-09-25',
      time: '10:00 AM',
      duration: '45 min',
      agenda: 'Interview preparation and portfolio review',
      mode: 'Video Call'
    },
    {
      id: 2,
      student: 'Priya Sharma',
      type: 'Progress Review',
      date: '2024-09-24',
      time: '2:00 PM',
      duration: '30 min',
      agenda: 'Project discussion and next steps',
      mode: 'In-person'
    },
    {
      id: 3,
      student: 'Amit Singh',
      type: 'Mock Interview',
      date: '2024-09-26',
      time: '4:00 PM',
      duration: '60 min',
      agenda: 'Technical interview simulation',
      mode: 'Video Call'
    }
  ]);

  const Sidebar = () => (
    <div className={`${theme.sidebarBg} ${theme.textPrimary} w-64 min-h-screen border-r ${theme.sidebarBorder} shadow-lg flex flex-col`}>
      <div className={`p-6 border-b ${theme.sidebarBorder} flex-shrink-0`}>
        <div className="flex items-center">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500 mr-3">
            <UserCheck className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${theme.textPrimary}`}>Mentor Panel</h1>
            <p className={`text-xs ${theme.textSecondary}`}>Student Guidance</p>
          </div>
        </div>
      </div>

      <nav className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-emerald-400' },
            { id: 'mentees', label: 'My Mentees', icon: Users, color: 'text-cyan-400' },
            { id: 'approvals', label: 'Approvals', icon: CheckCircle2, color: 'text-orange-400', badge: pendingApprovals.length },
            { id: 'meetings', label: 'Meetings', icon: Calendar, color: 'text-violet-400' },
            { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, color: 'text-pink-400' },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-yellow-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 relative ${
                activeTab === item.id 
                  ? `${theme.cardBg} border ${theme.cardBorder} shadow-lg` 
                  : theme.hover
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? item.color : theme.textMuted}`} />
              <span className={activeTab === item.id ? `${theme.textPrimary} font-medium` : theme.textSecondary}>
                {item.label}
              </span>
              {item.badge && (
                <span className="ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className={`p-6 border-t ${theme.sidebarBorder} flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 flex-shrink-0">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className={`text-sm font-medium ${theme.textPrimary} truncate`}>Prof. Michael Chen</p>
              <p className={`text-xs ${theme.textSecondary} truncate`}>Senior Mentor</p>
            </div>
          </div>
          <button 
            onClick={() => {
              console.log('Logout button clicked');
              if (onLogout) {
                console.log('Calling onLogout function');
                onLogout();
              } else {
                console.log('onLogout function not available');
              }
            }}
            className={`p-2 rounded-lg ${theme.hover} transition-colors flex-shrink-0`}
            title="Logout"
          >
            <LogOut className={`h-5 w-5 ${theme.textSecondary} hover:${theme.textPrimary} transition-colors`} />
          </button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <header className={`${theme.headerBg} border-b ${theme.headerBorder} px-6 py-4 shadow-sm`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${theme.textPrimary} capitalize`}>
            {activeTab === 'dashboard' ? 'Mentorship Dashboard' : activeTab.replace('-', ' ')}
          </h2>
          <p className={theme.textSecondary}>Guide students to success</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 ${theme.input} border rounded-xl ${theme.textPrimary} placeholder-gray-400 ${theme.inputFocus} w-64 outline-none`}
            />
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl ${theme.cardBg} border ${theme.cardBorder} transition-colors hover:opacity-80`}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          <div className="relative">
            <Bell className={`h-6 w-6 ${theme.textSecondary} cursor-pointer hover:text-emerald-400 transition-colors`} />
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  const DashboardOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm mb-2`}>Total Mentees</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>{mentorStats.totalMentees}</p>
              <p className="text-emerald-400 text-sm mt-1">Active guidance</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm mb-2`}>Pending Approvals</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>{mentorStats.pendingApprovals}</p>
              <p className="text-orange-400 text-sm mt-1">Needs attention</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm mb-2`}>Success Rate</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>87%</p>
              <p className="text-violet-400 text-sm mt-1">Placement success</p>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500">
              <Target className="h-8 w-8 text-violet-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm mb-2`}>Mentor Rating</p>
              <div className="flex items-center">
                <p className={`text-3xl font-bold ${theme.textPrimary} mr-2`}>{mentorStats.averageRating}</p>
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </div>
              <p className="text-cyan-400 text-sm mt-1">Student feedback</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500">
              <Award className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals Preview */}
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Urgent Approvals</h3>
            <button
              onClick={() => setActiveTab('approvals')}
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {pendingApprovals.slice(0, 3).map((approval) => (
              <div key={approval.id} className={`flex items-center p-4 ${theme.tertiary} rounded-xl border ${theme.cardBorder} hover:border-orange-500 transition-colors`}>
                <div className="p-2 bg-orange-500/20 rounded-lg mr-3 border border-orange-500 flex-shrink-0">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${theme.textPrimary} text-sm font-medium truncate`}>{approval.student.name}</p>
                  <p className={`${theme.textSecondary} text-xs truncate`}>{approval.internship.title} at {approval.internship.company}</p>
                </div>
                <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs transition-colors flex-shrink-0">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Today's Meetings</h3>
            <button
              onClick={() => setActiveTab('meetings')}
              className="text-violet-400 hover:text-violet-300 font-medium flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingMeetings.slice(0, 3).map((meeting) => (
              <div key={meeting.id} className={`flex items-center p-4 ${theme.tertiary} rounded-xl border ${theme.cardBorder} hover:border-violet-500 transition-colors`}>
                <div className="p-2 bg-violet-500/20 rounded-lg mr-3 border border-violet-500 flex-shrink-0">
                  <Calendar className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${theme.textPrimary} text-sm font-medium truncate`}>{meeting.student}</p>
                  <p className={`${theme.textSecondary} text-xs truncate`}>{meeting.time} • {meeting.type}</p>
                </div>
                <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs transition-colors flex-shrink-0">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-8`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-8`}>Mentorship Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-4">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>{mentorStats.successfulPlacements}</p>
            <p className={`${theme.textSecondary} text-sm`}>Students Placed</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mx-auto mb-4">
              <Clock className="h-8 w-8 text-cyan-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>{mentorStats.responseTime}</p>
            <p className={`${theme.textSecondary} text-sm`}>Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-violet-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>{mentorStats.completedSessions}</p>
            <p className={`${theme.textSecondary} text-sm`}>Total Sessions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>{mentorStats.meetingsThisWeek}</p>
            <p className={`${theme.textSecondary} text-sm`}>This Week</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MenteesManagement = () => (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 min-w-0">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Search mentees..."
                className={`w-full pl-10 pr-4 py-2 ${theme.input} border rounded-xl ${theme.textPrimary} placeholder-gray-400 ${theme.inputFocus} outline-none`}
              />
            </div>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Years</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Performance</option>
              <option>Outstanding</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Needs Attention</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Mentees Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {mentees.map((mentee) => (
          <div key={mentee.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center flex-1 min-w-0">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mr-4 flex-shrink-0">
                  <User className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{mentee.name}</h3>
                  <p className="text-cyan-400 text-sm">{mentee.rollNumber}</p>
                  <p className={`${theme.textSecondary} text-xs`}>{mentee.department} • Year {mentee.year}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${
                mentee.performance === 'Outstanding' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' :
                mentee.performance === 'Excellent' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' :
                mentee.performance === 'Good' ? 'bg-orange-500/20 text-orange-400 border-orange-500' :
                'bg-red-500/20 text-red-400 border-red-500'
              }`}>
                {mentee.performance}
              </span>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-xs font-medium`}>CGPA</p>
                <p className={`text-xl font-bold mt-1 ${
                  mentee.cgpa >= 9 ? 'text-emerald-400' :
                  mentee.cgpa >= 8 ? 'text-cyan-400' : 'text-orange-400'
                }`}>
                  {mentee.cgpa}
                </p>
              </div>
              <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-xs font-medium`}>Applications</p>
                <p className={`text-xl font-bold ${theme.textPrimary} mt-1`}>{mentee.applications}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <p className={`${theme.textSecondary} text-sm mb-3 font-medium`}>Skills:</p>
              <div className="flex flex-wrap gap-2">
                {mentee.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs border border-cyan-500">
                    {skill}
                  </span>
                ))}
                {mentee.skills.length > 4 && (
                  <span className={`px-2 py-1 ${theme.tertiary} ${theme.textSecondary} rounded text-xs`}>
                    +{mentee.skills.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Placement Status */}
            <div className={`mb-6 p-4 ${theme.tertiary} rounded-xl border ${theme.cardBorder}`}>
              <div className="flex justify-between items-center mb-2">
                <p className={`${theme.textSecondary} text-sm font-medium`}>Placement Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  mentee.placement.status === 'Placed' ? 'bg-emerald-500/20 text-emerald-400' :
                  mentee.placement.status === 'Interview Scheduled' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {mentee.placement.status}
                </span>
              </div>
              <p className={`${theme.textPrimary} text-sm font-medium`}>{mentee.placement.company}</p>
              <p className={`${theme.textSecondary} text-xs`}>{mentee.placement.stage}</p>
            </div>

            {/* Meeting Info */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`${theme.textSecondary} font-medium`}>Last Meeting:</span>
                <span className={theme.textPrimary}>{mentee.lastMeeting}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`${theme.textSecondary} font-medium`}>Next Meeting:</span>
                <span className={mentee.nextMeeting === 'Not Scheduled' ? 'text-red-400' : 'text-emerald-400'}>
                  {mentee.nextMeeting}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button className="col-span-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium">
                View Profile
              </button>
              <div className="col-span-1 grid grid-cols-3 gap-2">
                <button className={`px-3 py-2 ${theme.tertiary} ${theme.hover} rounded-lg transition-colors`}>
                  <MessageSquare className={`h-4 w-4 ${theme.textSecondary}`} />
                </button>
                <button className={`px-3 py-2 ${theme.tertiary} ${theme.hover} rounded-lg transition-colors`}>
                  <Calendar className={`h-4 w-4 ${theme.textSecondary}`} />
                </button>
                <button className={`px-3 py-2 ${theme.tertiary} ${theme.hover} rounded-lg transition-colors`}>
                  <Mail className={`h-4 w-4 ${theme.textSecondary}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApprovalsPage = () => (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Applications</option>
              <option>Pending Review</option>
              <option>Urgent Review</option>
              <option>Recently Submitted</option>
            </select>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Companies</option>
              <option>TechCorp</option>
              <option>DataFlow Inc</option>
              <option>InnovateLabs</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <span className={`text-sm ${theme.textSecondary}`}>{pendingApprovals.length} applications need your review</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-6">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300`}>
            <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
              <div className="flex items-center mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500 mr-4 flex-shrink-0">
                  <FileText className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme.textPrimary}`}>{approval.student.name}</h3>
                  <p className="text-orange-400 text-sm">{approval.student.rollNumber}</p>
                  <p className={`${theme.textSecondary} text-xs`}>CGPA: {approval.student.cgpa}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  approval.status === 'Urgent Review' 
                    ? 'bg-red-500/20 text-red-400 border-red-500' 
                    : 'bg-orange-500/20 text-orange-400 border-orange-500'
                }`}>
                  {approval.status}
                </span>
                <p className={`${theme.textSecondary} text-sm mt-1`}>Applied: {approval.appliedDate}</p>
              </div>
            </div>

            {/* Internship Details */}
            <div className={`${theme.tertiary} rounded-xl p-6 border ${theme.cardBorder} mb-6`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className={`${theme.textPrimary} font-semibold mb-2 text-lg`}>{approval.internship.title}</h4>
                  <p className="text-orange-400 font-medium text-base">{approval.internship.company}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <span className={`${theme.textSecondary} flex items-center`}>
                      📍 {approval.internship.location}
                    </span>
                    <span className={`${theme.textSecondary} flex items-center`}>
                      ⏰ {approval.internship.duration}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">{approval.internship.stipend}</p>
                  <p className={`${theme.textSecondary} text-sm`}>Monthly Stipend</p>
                </div>
              </div>
            </div>

            {/* Documents Status */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                <span className={theme.textPrimary}>Resume: {approval.resume}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                <span className={theme.textPrimary}>Cover Letter: {approval.coverLetter}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center justify-center">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button className={`px-4 py-2 ${theme.tertiary} ${theme.hover} ${theme.textPrimary} rounded-xl transition-colors flex items-center justify-center`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Statistics */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-8`}>Approval Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>8</p>
            <p className={`${theme.textSecondary} text-sm`}>Pending Reviews</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>45</p>
            <p className={`${theme.textSecondary} text-sm`}>Approved This Month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500 mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>6</p>
            <p className={`${theme.textSecondary} text-sm`}>Rejected This Month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>88%</p>
            <p className={`${theme.textSecondary} text-sm`}>Approval Rate</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MeetingsPage = () => (
    <div className="space-y-8">
      {/* Schedule New Meeting */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Meeting Schedule</h3>
            <p className={theme.textSecondary}>Manage your mentorship sessions</p>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Today's Meetings */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-8`}>Today's Schedule</h3>
        <div className="space-y-6">
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className={`${theme.tertiary} rounded-xl p-6 border ${theme.cardBorder} hover:border-violet-500 transition-colors`}>
              <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                <div className="flex items-center mb-4 lg:mb-0">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500 mr-4 flex-shrink-0">
                    <Calendar className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h4 className={`${theme.textPrimary} font-semibold text-lg`}>{meeting.student}</h4>
                    <p className="text-violet-400 text-sm font-medium">{meeting.type}</p>
                    <p className={`${theme.textSecondary} text-xs`}>{meeting.agenda}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`${theme.textPrimary} font-medium text-lg`}>{meeting.time}</p>
                  <p className={`${theme.textSecondary} text-sm`}>{meeting.duration}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs mt-2 font-medium ${
                    meeting.mode === 'Video Call' 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                  }`}>
                    {meeting.mode}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors font-medium">
                  Join Meeting
                </button>
                <button className={`px-4 py-2 ${theme.tertiary} ${theme.hover} ${theme.textPrimary} rounded-lg text-sm transition-colors`}>
                  Reschedule
                </button>
                <button className={`px-4 py-2 ${theme.tertiary} ${theme.hover} ${theme.textPrimary} rounded-lg text-sm transition-colors`}>
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-8`}>This Week's Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500 mx-auto mb-4">
              <Calendar className="h-8 w-8 text-violet-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>{mentorStats.meetingsThisWeek}</p>
            <p className={`${theme.textSecondary} text-sm`}>Scheduled Meetings</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>4</p>
            <p className={`${theme.textSecondary} text-sm`}>Completed Sessions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>12hrs</p>
            <p className={`${theme.textSecondary} text-sm`}>Total Time Invested</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressTracking = () => (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm font-medium`}>Success Stories</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-1`}>18</p>
              <p className="text-emerald-400 text-sm mt-1">Students placed</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500">
              <Award className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm font-medium`}>Improvement Rate</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-1`}>92%</p>
              <p className="text-cyan-400 text-sm mt-1">CGPA improvements</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm font-medium`}>Skill Development</p>
              <p className={`text-3xl font-bold ${theme.textPrimary} mt-1`}>156</p>
              <p className="text-violet-400 text-sm mt-1">Skills enhanced</p>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500">
              <Target className="h-8 w-8 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Student Progress Timeline */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-8`}>Student Progress Timeline</h3>
        <div className="space-y-8">
          {mentees.slice(0, 3).map((mentee, index) => (
            <div key={mentee.id} className="relative">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mr-6 flex-shrink-0">
                  <User className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <h4 className={`${theme.textPrimary} font-semibold text-lg`}>{mentee.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0 ${
                      mentee.performance === 'Outstanding' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
                      mentee.performance === 'Excellent' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' :
                      'bg-orange-500/20 text-orange-400 border border-orange-500'
                    }`}>
                      {mentee.performance}
                    </span>
                  </div>
                  <div className={`${theme.tertiary} rounded-xl p-6 border ${theme.cardBorder}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <p className={`${theme.textSecondary} text-sm font-medium mb-3`}>Current Goals:</p>
                        <ul className="space-y-2">
                          {mentee.goals.slice(0, 2).map((goal, goalIndex) => (
                            <li key={goalIndex} className={`${theme.textPrimary} text-sm flex items-start`}>
                              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span>{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className={`${theme.textSecondary} text-sm font-medium mb-3`}>Progress:</p>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className={theme.textPrimary}>Goal Completion</span>
                            <span className="text-cyan-400 font-medium">{Math.floor(Math.random() * 40) + 60}%</span>
                          </div>
                          <div className={`w-full ${theme.divider} rounded-full h-3`}>
                            <div 
                              className="bg-cyan-400 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className={`${theme.textSecondary} text-sm font-medium mb-3`}>Next Milestone:</p>
                        <p className={`${theme.textPrimary} text-sm font-medium`}>Technical Interview Prep</p>
                        <p className="text-cyan-400 text-xs mt-1">Due: Next week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {index < 2 && (
                <div className={`absolute left-6 top-12 w-px h-8 ${theme.divider}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const FeedbackPage = () => (
    <div className="space-y-8">
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-8 text-center`}>
        <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500">
          <MessageSquare className="h-8 w-8 text-yellow-400" />
        </div>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Feedback System</h3>
        <p className={theme.textSecondary}>Feature under development</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'mentees':
        return <MenteesManagement />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'meetings':
        return <MeetingsPage />;
      case 'progress':
        return <ProgressTracking />;
      case 'feedback':
        return <FeedbackPage />;
      default:
        return <FeedbackPage />;
    }
  };

  return (
    <div className={`flex min-h-screen ${theme.bg}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;
