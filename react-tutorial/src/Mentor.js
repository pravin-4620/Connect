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
  Settings,
  LogOut,
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
  Zap
} from 'lucide-react';


const MentorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New application from Sarah Chen needs approval', type: 'urgent', time: '5 min ago' },
    { id: 2, message: 'John completed his mock interview', type: 'success', time: '2 hours ago' },
    { id: 3, message: 'Reminder: Weekly mentorship meeting tomorrow', type: 'info', time: '1 day ago' }
  ]);

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
    <div className="bg-gray-900 text-white w-64 min-h-screen border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500 mr-3">
            <UserCheck className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Mentor Panel</h1>
            <p className="text-xs text-gray-400">Student Guidance</p>
          </div>
        </div>
      </div>

      <nav className="p-6">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-emerald-400' },
            { id: 'mentees', label: 'My Mentees', icon: Users, color: 'text-cyan-400' },
            { id: 'approvals', label: 'Approvals', icon: CheckCircle2, color: 'text-orange-400', badge: pendingApprovals.length },
            { id: 'meetings', label: 'Meetings', icon: Calendar, color: 'text-violet-400' },
            { id: 'progress', label: 'Progress Tracking', icon: TrendingUp, color: 'text-pink-400' },
            { id: 'resources', label: 'Resources', icon: BookOpen, color: 'text-blue-400' },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-yellow-400' },
            { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-300 relative ${
                activeTab === item.id 
                  ? 'bg-gray-800 border border-gray-700 shadow-lg' 
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${activeTab === item.id ? item.color : 'text-gray-500'}`} />
              <span className={activeTab === item.id ? 'text-white font-medium' : 'text-gray-400'}>
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

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Prof. Michael Chen</p>
              <p className="text-xs text-gray-400">Senior Mentor</p>
            </div>
          </div>
          <LogOut className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white capitalize">
            {activeTab === 'dashboard' ? 'Mentorship Dashboard' : activeTab.replace('-', ' ')}
          </h2>
          <p className="text-gray-400">Guide students to success</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>
          
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-400 cursor-pointer hover:text-emerald-400 transition-colors" />
            <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Mentees</p>
              <p className="text-3xl font-bold text-white">{mentorStats.totalMentees}</p>
              <p className="text-emerald-400 text-sm mt-1">Active guidance</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-white">{mentorStats.pendingApprovals}</p>
              <p className="text-orange-400 text-sm mt-1">Needs attention</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-3xl font-bold text-white">87%</p>
              <p className="text-violet-400 text-sm mt-1">Placement success</p>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500">
              <Target className="h-8 w-8 text-violet-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Mentor Rating</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold text-white mr-2">{mentorStats.averageRating}</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Preview */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Urgent Approvals</h3>
            <button
              onClick={() => setActiveTab('approvals')}
              className="text-orange-400 hover:text-orange-300 font-medium flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {pendingApprovals.slice(0, 3).map((approval) => (
              <div key={approval.id} className="flex items-center p-3 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-orange-500 transition-colors">
                <div className="p-2 bg-orange-500/20 rounded-lg mr-3 border border-orange-500">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{approval.student.name}</p>
                  <p className="text-gray-400 text-xs">{approval.internship.title} at {approval.internship.company}</p>
                </div>
                <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs transition-colors">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Today's Meetings</h3>
            <button
              onClick={() => setActiveTab('meetings')}
              className="text-violet-400 hover:text-violet-300 font-medium flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingMeetings.slice(0, 3).map((meeting) => (
              <div key={meeting.id} className="flex items-center p-3 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-violet-500 transition-colors">
                <div className="p-2 bg-violet-500/20 rounded-lg mr-3 border border-violet-500">
                  <Calendar className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{meeting.student}</p>
                  <p className="text-gray-400 text-xs">{meeting.time} • {meeting.type}</p>
                </div>
                <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs transition-colors">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Mentorship Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-3">
              <Users className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{mentorStats.successfulPlacements}</p>
            <p className="text-gray-400 text-sm">Students Placed</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mx-auto mb-3">
              <Clock className="h-8 w-8 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{mentorStats.responseTime}</p>
            <p className="text-gray-400 text-sm">Avg Response Time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500 mx-auto mb-3">
              <Calendar className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{mentorStats.completedSessions}</p>
            <p className="text-gray-400 text-sm">Total Sessions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{mentorStats.meetingsThisWeek}</p>
            <p className="text-gray-400 text-sm">This Week</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MenteesManagement = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentees..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <select className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-white">
              <option>All Years</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
            <select className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-white">
              <option>All Performance</option>
              <option>Outstanding</option>
              <option>Excellent</option>
              <option>Good</option>
              <option>Needs Attention</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Mentees Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentees.map((mentee) => (
          <div key={mentee.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mr-4">
                  <User className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{mentee.name}</h3>
                  <p className="text-cyan-400 text-sm">{mentee.rollNumber}</p>
                  <p className="text-gray-400 text-xs">{mentee.department} • Year {mentee.year}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                mentee.performance === 'Outstanding' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' :
                mentee.performance === 'Excellent' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500' :
                mentee.performance === 'Good' ? 'bg-orange-500/20 text-orange-400 border-orange-500' :
                'bg-red-500/20 text-red-400 border-red-500'
              }`}>
                {mentee.performance}
              </span>
            </div>

            {/* Academic Info */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-xs">CGPA</p>
                <p className={`text-xl font-bold ${
                  mentee.cgpa >= 9 ? 'text-emerald-400' :
                  mentee.cgpa >= 8 ? 'text-cyan-400' : 'text-orange-400'
                }`}>
                  {mentee.cgpa}
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-xs">Applications</p>
                <p className="text-xl font-bold text-white">{mentee.applications}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {mentee.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs border border-cyan-500">
                    {skill}
                  </span>
                ))}
                {mentee.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                    +{mentee.skills.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Placement Status */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-400 text-sm">Placement Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  mentee.placement.status === 'Placed' ? 'bg-emerald-500/20 text-emerald-400' :
                  mentee.placement.status === 'Interview Scheduled' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {mentee.placement.status}
                </span>
              </div>
              <p className="text-white text-sm font-medium">{mentee.placement.company}</p>
              <p className="text-gray-400 text-xs">{mentee.placement.stage}</p>
            </div>

            {/* Meeting Info */}
            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Meeting:</span>
                <span className="text-gray-300">{mentee.lastMeeting}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Next Meeting:</span>
                <span className={mentee.nextMeeting === 'Not Scheduled' ? 'text-red-400' : 'text-emerald-400'}>
                  {mentee.nextMeeting}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium">
                View Profile
              </button>
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <MessageSquare className="h-4 w-4 text-gray-300" />
              </button>
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Calendar className="h-4 w-4 text-gray-300" />
              </button>
              <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <Mail className="h-4 w-4 text-gray-300" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApprovalsPage = () => (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-white">
              <option>All Applications</option>
              <option>Pending Review</option>
              <option>Urgent Review</option>
              <option>Recently Submitted</option>
            </select>
            <select className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-white">
              <option>All Companies</option>
              <option>TechCorp</option>
              <option>DataFlow Inc</option>
              <option>InnovateLabs</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <span className="text-sm">{pendingApprovals.length} applications need your review</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500 mr-4">
                  <FileText className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{approval.student.name}</h3>
                  <p className="text-orange-400 text-sm">{approval.student.rollNumber}</p>
                  <p className="text-gray-400 text-xs">CGPA: {approval.student.cgpa}</p>
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
                <p className="text-gray-400 text-sm mt-1">Applied: {approval.appliedDate}</p>
              </div>
            </div>

            {/* Internship Details */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">{approval.internship.title}</h4>
                  <p className="text-orange-400 font-medium">{approval.internship.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>📍 {approval.internship.location}</span>
                    <span>⏰ {approval.internship.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">{approval.internship.stipend}</p>
                  <p className="text-gray-400 text-sm">Monthly Stipend</p>
                </div>
              </div>
            </div>

            {/* Documents Status */}
            <div className="flex items-center gap-6 mb-4 text-sm">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                <span className="text-gray-300">Resume: {approval.resume}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                <span className="text-gray-300">Cover Letter: {approval.coverLetter}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Changes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Statistics */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Approval Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-3">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-gray-400 text-sm">Pending Reviews</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">45</p>
            <p className="text-gray-400 text-sm">Approved This Month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500 mx-auto mb-3">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-white">6</p>
            <p className="text-gray-400 text-sm">Rejected This Month</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">88%</p>
            <p className="text-gray-400 text-sm">Approval Rate</p>
          </div>
        </div>
      </div>
    </div>
  );

  const MeetingsPage = () => (
    <div className="space-y-6">
      {/* Schedule New Meeting */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Meeting Schedule</h3>
            <p className="text-gray-400">Manage your mentorship sessions</p>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Today's Meetings */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Today's Schedule</h3>
        <div className="space-y-4">
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-violet-500 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500 mr-4">
                    <Calendar className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{meeting.student}</h4>
                    <p className="text-violet-400 text-sm">{meeting.type}</p>
                    <p className="text-gray-400 text-xs">{meeting.agenda}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-medium">{meeting.time}</p>
                  <p className="text-gray-400 text-sm">{meeting.duration}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                    meeting.mode === 'Video Call' 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {meeting.mode}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors">
                  Join Meeting
                </button>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                  Reschedule
                </button>
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">This Week's Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500 mx-auto mb-3">
              <Calendar className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{mentorStats.meetingsThisWeek}</p>
            <p className="text-gray-400 text-sm">Scheduled Meetings</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-gray-400 text-sm">Completed Sessions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-3">
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">12hrs</p>
            <p className="text-gray-400 text-sm">Total Time Invested</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressTracking = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Stories</p>
              <p className="text-3xl font-bold text-white">18</p>
              <p className="text-emerald-400 text-sm">Students placed</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500">
              <Award className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Improvement Rate</p>
              <p className="text-3xl font-bold text-white">92%</p>
              <p className="text-cyan-400 text-sm">CGPA improvements</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Skill Development</p>
              <p className="text-3xl font-bold text-white">156</p>
              <p className="text-violet-400 text-sm">Skills enhanced</p>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500">
              <Target className="h-8 w-8 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Student Progress Timeline */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Student Progress Timeline</h3>
        <div className="space-y-6">
          {mentees.slice(0, 3).map((mentee, index) => (
            <div key={mentee.id} className="relative">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mr-4">
                  <User className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-semibold">{mentee.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      mentee.performance === 'Outstanding' ? 'bg-emerald-500/20 text-emerald-400' :
                      mentee.performance === 'Excellent' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {mentee.performance}
                    </span>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Current Goals:</p>
                        <ul className="mt-1 space-y-1">
                          {mentee.goals.slice(0, 2).map((goal, goalIndex) => (
                            <li key={goalIndex} className="text-white text-sm flex items-center">
                              <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></div>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Progress:</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white">Goal Completion</span>
                            <span className="text-cyan-400">{Math.floor(Math.random() * 40) + 60}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-cyan-400 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Next Milestone:</p>
                        <p className="text-white text-sm mt-1">Technical Interview Prep</p>
                        <p className="text-cyan-400 text-xs">Due: Next week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {index < 2 && (
                <div className="absolute left-5 top-10 w-px h-6 bg-gray-600"></div>
              )}
            </div>
          ))}
        </div>
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
      default:
        return (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;