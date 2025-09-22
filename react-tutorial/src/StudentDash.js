import React, { useState } from 'react';
import { 
  Briefcase,
  User,
  FileText,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Bell,
  Settings,
  LogOut,
  Home,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building2,
  DollarSign,
  Star,
  Target,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  Upload,
  Edit,
  Send,
  Zap,
  GraduationCap,
  Users,
  ChevronRight,
  ExternalLink,
  PlayCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Application approved by mentor for TechCorp internship', type: 'success', time: '2 hours ago' },
    { id: 2, message: 'Interview scheduled for tomorrow at 2:00 PM', type: 'urgent', time: '4 hours ago' },
    { id: 3, message: 'New internship match found: Data Science at AI Labs', type: 'info', time: '1 day ago' }
  ]);

  // Sample student data
  const [studentProfile] = useState({
    name: 'Alex Johnson',
    rollNumber: '21CSE089',
    email: 'alex.johnson@college.edu',
    phone: '+91 9876543210',
    department: 'Computer Science Engineering',
    year: 4,
    cgpa: 8.4,
    skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'MongoDB', 'Java'],
    resumeUploaded: true,
    profileComplete: 85,
    mentor: 'Prof. Sarah Wilson'
  });

  const [studentStats] = useState({
    applications: 8,
    interviews: 3,
    offers: 1,
    rejections: 2,
    pending: 3,
    profileViews: 45,
    skillsEndorsed: 12,
    projectsCompleted: 6
  });

  const [applications] = useState([
    {
      id: 1,
      internship: {
        title: 'Software Development Intern',
        company: 'TechCorp',
        logo: '🏢',
        location: 'Mumbai',
        type: 'Hybrid',
        stipend: '₹25,000'
      },
      appliedDate: '2024-09-18',
      status: 'Interview Scheduled',
      mentorApproval: 'Approved',
      interviewDate: '2024-09-25 2:00 PM',
      stage: 'Technical Round',
      progress: 75
    },
    {
      id: 2,
      internship: {
        title: 'Data Science Intern',
        company: 'DataFlow Inc',
        logo: '📊',
        location: 'Bangalore',
        type: 'Remote',
        stipend: '₹30,000'
      },
      appliedDate: '2024-09-15',
      status: 'Under Review',
      mentorApproval: 'Approved',
      stage: 'Application Review',
      progress: 50
    },
    {
      id: 3,
      internship: {
        title: 'Frontend Developer',
        company: 'WebTech Solutions',
        logo: '💻',
        location: 'Pune',
        type: 'On-site',
        stipend: '₹22,000'
      },
      appliedDate: '2024-09-20',
      status: 'Rejected',
      mentorApproval: 'Approved',
      stage: 'Application Closed',
      progress: 100,
      feedback: 'Great profile, but looking for more React experience'
    }
  ]);

  const [availableInternships] = useState([
    {
      id: 1,
      title: 'Machine Learning Engineer Intern',
      company: 'AI Labs',
      logo: '🤖',
      location: 'Hyderabad',
      type: 'Hybrid',
      duration: '6 months',
      stipend: '₹35,000',
      deadline: '2024-10-15',
      requirements: ['Python', 'TensorFlow', 'Machine Learning'],
      matchScore: 92,
      applicants: 45,
      isNew: true,
      description: 'Work on cutting-edge AI projects and contribute to real-world ML solutions.'
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      logo: '🚀',
      location: 'Remote',
      type: 'Remote',
      duration: '4 months',
      stipend: '₹28,000',
      deadline: '2024-10-20',
      requirements: ['React', 'Node.js', 'MongoDB'],
      matchScore: 88,
      applicants: 32,
      isNew: false,
      description: 'Join our dynamic team to build scalable web applications from scratch.'
    },
    {
      id: 3,
      title: 'Cloud Infrastructure Intern',
      company: 'CloudTech Pro',
      logo: '☁️',
      location: 'Chennai',
      type: 'On-site',
      duration: '5 months',
      stipend: '₹26,000',
      deadline: '2024-10-25',
      requirements: ['AWS', 'Docker', 'Kubernetes'],
      matchScore: 65,
      applicants: 28,
      isNew: false,
      description: 'Learn cloud architecture and DevOps practices in a professional environment.'
    }
  ]);

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: 'Technical Interview - TechCorp',
      type: 'Interview',
      date: '2024-09-25',
      time: '2:00 PM',
      mode: 'Video Call',
      preparation: 'Data Structures & Algorithms'
    },
    {
      id: 2,
      title: 'Resume Review with Mentor',
      type: 'Meeting',
      date: '2024-09-24',
      time: '10:00 AM',
      mode: 'In-person',
      preparation: 'Updated resume draft'
    },
    {
      id: 3,
      title: 'Career Fair - Virtual',
      type: 'Event',
      date: '2024-09-28',
      time: '9:00 AM',
      mode: 'Online',
      preparation: 'Portfolio showcase'
    }
  ]);

  const Sidebar = () => (
    <div className="bg-gray-900 text-white w-64 min-h-screen border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center">
          <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500 mr-3">
            <GraduationCap className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Student Portal</h1>
            <p className="text-xs text-gray-400">Career Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="p-6">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-cyan-400' },
            { id: 'internships', label: 'Find Internships', icon: Briefcase, color: 'text-violet-400' },
            { id: 'applications', label: 'My Applications', icon: FileText, color: 'text-orange-400', badge: studentStats.pending },
            { id: 'interviews', label: 'Interviews', icon: Calendar, color: 'text-emerald-400' },
            { id: 'profile', label: 'Profile', icon: User, color: 'text-pink-400' },
            { id: 'resources', label: 'Resources', icon: BookOpen, color: 'text-blue-400' },
            { id: 'mentorship', label: 'Mentorship', icon: Users, color: 'text-yellow-400' },
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
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500">
              <User className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{studentProfile.name}</p>
              <p className="text-xs text-gray-400">{studentProfile.rollNumber}</p>
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
            {activeTab === 'dashboard' ? 'Student Dashboard' : activeTab.replace('-', ' ')}
          </h2>
          <p className="text-gray-400">Track your career journey</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search internships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 w-64"
            />
          </div>
          
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-400 cursor-pointer hover:text-cyan-400 transition-colors" />
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome back, {studentProfile.name}!</h3>
            <p className="text-cyan-300">Ready to take the next step in your career journey?</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-400 text-sm">Profile Completion</p>
            <div className="flex items-center mt-1">
              <div className="w-20 h-2 bg-gray-700 rounded-full mr-2">
                <div 
                  className="h-2 bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${studentProfile.profileComplete}%` }}
                ></div>
              </div>
              <span className="text-white font-bold">{studentProfile.profileComplete}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Applications</p>
              <p className="text-3xl font-bold text-white">{studentStats.applications}</p>
              <p className="text-cyan-400 text-sm mt-1">{studentStats.pending} pending</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500">
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Interviews</p>
              <p className="text-3xl font-bold text-white">{studentStats.interviews}</p>
              <p className="text-emerald-400 text-sm mt-1">Scheduled</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500">
              <Calendar className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Offers</p>
              <p className="text-3xl font-bold text-white">{studentStats.offers}</p>
              <p className="text-violet-400 text-sm mt-1">Success rate: 12.5%</p>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500">
              <Award className="h-8 w-8 text-violet-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Profile Views</p>
              <p className="text-3xl font-bold text-white">{studentStats.profileViews}</p>
              <p className="text-orange-400 text-sm mt-1">This month</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500">
              <Eye className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveTab('internships')}
              className="p-4 bg-gradient-to-r from-violet-500/20 to-violet-600/20 border border-violet-500 rounded-xl hover:from-violet-500/30 hover:to-violet-600/30 transition-all duration-300 group"
            >
              <Briefcase className="h-8 w-8 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Find Internships</p>
              <p className="text-gray-400 text-xs">Discover new opportunities</p>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="p-4 bg-gradient-to-r from-pink-500/20 to-pink-600/20 border border-pink-500 rounded-xl hover:from-pink-500/30 hover:to-pink-600/30 transition-all duration-300 group"
            >
              <User className="h-8 w-8 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Update Profile</p>
              <p className="text-gray-400 text-xs">Complete your profile</p>
            </button>

            <button className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500 rounded-xl hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all duration-300 group">
              <BookOpen className="h-8 w-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Practice Tests</p>
              <p className="text-gray-400 text-xs">Improve your skills</p>
            </button>

            <button className="p-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500 rounded-xl hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300 group">
              <MessageSquare className="h-8 w-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white font-medium">Ask Mentor</p>
              <p className="text-gray-400 text-xs">Get guidance</p>
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
            <button
              onClick={() => setActiveTab('interviews')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center p-3 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-emerald-500 transition-colors">
                <div className={`p-2 rounded-lg mr-3 ${
                  event.type === 'Interview' ? 'bg-emerald-500/20 border border-emerald-500' :
                  event.type === 'Meeting' ? 'bg-cyan-500/20 border border-cyan-500' :
                  'bg-violet-500/20 border border-violet-500'
                }`}>
                  {event.type === 'Interview' ? (
                    <Calendar className="h-4 w-4 text-emerald-400" />
                  ) : event.type === 'Meeting' ? (
                    <Users className="h-4 w-4 text-cyan-400" />
                  ) : (
                    <Star className="h-4 w-4 text-violet-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{event.title}</p>
                  <p className="text-gray-400 text-xs">{event.date} • {event.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  event.mode === 'Video Call' ? 'bg-cyan-500/20 text-cyan-400' :
                  event.mode === 'Online' ? 'bg-violet-500/20 text-violet-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {event.mode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Recent Applications</h3>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-orange-400 hover:text-orange-300 font-medium flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        <div className="space-y-3">
          {applications.slice(0, 3).map((app) => (
            <div key={app.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700 hover:border-orange-500 transition-colors">
              <div className="flex items-center">
                <div className="text-2xl mr-4">{app.internship.logo}</div>
                <div>
                  <h4 className="text-white font-medium">{app.internship.title}</h4>
                  <p className="text-orange-400 text-sm">{app.internship.company}</p>
                  <p className="text-gray-400 text-xs">Applied: {app.appliedDate}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  app.status === 'Interview Scheduled' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' :
                  app.status === 'Under Review' ? 'bg-orange-500/20 text-orange-400 border-orange-500' :
                  'bg-red-500/20 text-red-400 border-red-500'
                }`}>
                  {app.status}
                </span>
                <div className="w-24 h-2 bg-gray-700 rounded-full mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      app.status === 'Interview Scheduled' ? 'bg-emerald-400' :
                      app.status === 'Under Review' ? 'bg-orange-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const InternshipsPage = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search internships..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <select className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-white">
              <option>All Locations</option>
              <option>Remote</option>
              <option>Mumbai</option>
              <option>Bangalore</option>
              <option>Hyderabad</option>
            </select>
            <select className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-white">
              <option>All Types</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">{availableInternships.length} internships found</p>
          <select className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm">
            <option>Sort by: Best Match</option>
            <option>Sort by: Newest</option>
            <option>Sort by: Deadline</option>
            <option>Sort by: Stipend</option>
          </select>
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableInternships.map((internship) => (
          <div key={internship.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300 relative">
            {internship.isNew && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">
                NEW
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{internship.logo}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{internship.title}</h3>
                  <p className="text-violet-400 font-medium">{internship.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {internship.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {internship.duration}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  internship.matchScore >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                  internship.matchScore >= 80 ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  <Target className="h-3 w-3 mr-1" />
                  {internship.matchScore}% Match
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mb-4">
              <p className="text-gray-300 text-sm leading-relaxed">{internship.description}</p>
            </div>

            {/* Requirements */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {internship.requirements.map((req, index) => {
                  const hasSkill = studentProfile.skills.includes(req);
                  return (
                    <span 
                      key={index} 
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        hasSkill 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' 
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {req} {hasSkill && '✓'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-xs">Stipend</p>
                <p className="text-emerald-400 font-bold">{internship.stipend}</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-xs">Applicants</p>
                <p className="text-white font-bold">{internship.applicants}</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-xs">Deadline</p>
                <p className="text-orange-400 font-bold text-xs">{internship.deadline}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-medium">
                Apply Now
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors">
                <Star className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Zap className="h-5 w-5 text-yellow-400 mr-2" />
          AI Recommendations
        </h3>
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-300 mb-3">Based on your profile and interests, we recommend focusing on:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-cyan-400 font-medium mb-2">Skills to Improve:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Docker & Kubernetes (High demand)</li>
                <li>• System Design (Interview prep)</li>
                <li>• AWS Cloud Services</li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-medium mb-2">Perfect Matches:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Full Stack Developer roles</li>
                <li>• React/Node.js positions</li>
                <li>• Startup environments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ApplicationsPage = () => (
    <div className="space-y-6">
      {/* Application Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mx-auto mb-2">
            <FileText className="h-6 w-6 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{studentStats.applications}</p>
          <p className="text-gray-400 text-sm">Total Applied</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500 mx-auto mb-2">
            <Clock className="h-6 w-6 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{studentStats.pending}</p>
          <p className="text-gray-400 text-sm">Under Review</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 mx-auto mb-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{studentStats.interviews}</p>
          <p className="text-gray-400 text-sm">Interviews</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500 mx-auto mb-2">
            <Award className="h-6 w-6 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white">{studentStats.offers}</p>
          <p className="text-gray-400 text-sm">Offers Received</p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{app.internship.logo}</div>
                <div>
                  <h3 className="text-xl font-bold text-white">{app.internship.title}</h3>
                  <p className="text-orange-400 font-medium">{app.internship.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {app.internship.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {app.internship.stipend}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.internship.type === 'Remote' ? 'bg-emerald-500/20 text-emerald-400' :
                      app.internship.type === 'Hybrid' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {app.internship.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  app.status === 'Interview Scheduled' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' :
                  app.status === 'Under Review' ? 'bg-orange-500/20 text-orange-400 border-orange-500' :
                  'bg-red-500/20 text-red-400 border-red-500'
                }`}>
                  {app.status}
                </span>
                <p className="text-gray-400 text-sm mt-2">Applied: {app.appliedDate}</p>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">Application Progress</p>
                <p className="text-white text-sm font-medium">{app.stage}</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    app.status === 'Interview Scheduled' ? 'bg-emerald-400' :
                    app.status === 'Under Review' ? 'bg-orange-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: `${app.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Application Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-sm">Mentor Status</p>
                <div className="flex items-center mt-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mr-2" />
                  <span className="text-emerald-400 font-medium">{app.mentorApproval}</span>
                </div>
              </div>
              {app.interviewDate && (
                <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                  <p className="text-gray-400 text-sm">Interview</p>
                  <p className="text-white font-medium">{app.interviewDate}</p>
                </div>
              )}
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700">
                <p className="text-gray-400 text-sm">Next Step</p>
                <p className="text-cyan-400 font-medium">{app.stage}</p>
              </div>
            </div>

            {/* Feedback (if rejected) */}
            {app.feedback && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 font-medium text-sm mb-1">Feedback:</p>
                <p className="text-gray-300 text-sm">{app.feedback}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors text-sm">
                View Details
              </button>
              {app.status === 'Interview Scheduled' && (
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors text-sm">
                  Interview Prep
                </button>
              )}
              {app.status === 'Under Review' && (
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors text-sm">
                  Check Status
                </button>
              )}
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors text-sm">
                Download Application
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const InterviewsPage = () => (
    <div className="space-y-6">
      {/* Upcoming Interviews */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Upcoming Interviews</h3>
        <div className="space-y-4">
          {upcomingEvents.filter(event => event.type === 'Interview').map((interview) => (
            <div key={interview.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-emerald-500 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 mr-4">
                    <Calendar className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{interview.title}</h4>
                    <p className="text-emerald-400">Technical Round</p>
                    <p className="text-gray-400 text-sm">Focus: {interview.preparation}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-bold">{interview.date}</p>
                  <p className="text-emerald-400">{interview.time}</p>
                  <span className="inline-block px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs mt-1">
                    {interview.mode}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Join Interview
                </button>
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                  Preparation Guide
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Reschedule
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Preparation */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Interview Preparation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mb-4">
              <BookOpen className="h-6 w-6 text-cyan-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Technical Questions</h4>
            <p className="text-gray-400 text-sm mb-3">Practice coding problems and system design</p>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              Start Practice →
            </button>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-emerald-500 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 mb-4">
              <Users className="h-6 w-6 text-emerald-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Mock Interviews</h4>
            <p className="text-gray-400 text-sm mb-3">Schedule practice sessions with mentors</p>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
              Book Session →
            </button>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-violet-500 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500 mb-4">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">Company Research</h4>
            <p className="text-gray-400 text-sm mb-3">Learn about company culture and values</p>
            <button className="text-violet-400 hover:text-violet-300 text-sm font-medium">
              Research →
            </button>
          </div>
        </div>
      </div>

      {/* Interview History */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Interview History</h3>
        <div className="space-y-3">
          {[
            { company: 'StartupXYZ', date: '2024-09-15', result: 'Selected for next round', type: 'success' },
            { company: 'WebTech', date: '2024-09-10', result: 'Not selected', type: 'failed' },
            { company: 'DataCorp', date: '2024-09-05', result: 'Completed - Waiting for results', type: 'pending' }
          ].map((history, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  history.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                  history.type === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {history.type === 'success' ? '✓' : history.type === 'failed' ? '✗' : '⏳'}
                </div>
                <div>
                  <p className="text-white font-medium">{history.company}</p>
                  <p className="text-gray-400 text-sm">{history.date}</p>
                </div>
              </div>
              <p className={`text-sm ${
                history.type === 'success' ? 'text-emerald-400' :
                history.type === 'failed' ? 'text-red-400' :
                'text-orange-400'
              }`}>
                {history.result}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mr-6">
              <User className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{studentProfile.name}</h2>
              <p className="text-cyan-400 font-medium">{studentProfile.rollNumber}</p>
              <p className="text-gray-400">{studentProfile.department}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-white font-bold mr-2">CGPA: {studentProfile.cgpa}</span>
                <span className="text-gray-400">• Year {studentProfile.year}</span>
              </div>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Profile Completion */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <p className="text-white font-medium">Profile Completion</p>
            <span className="text-cyan-400 font-bold">{studentProfile.profileComplete}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cyan-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${studentProfile.profileComplete}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Complete your profile to get better internship matches!</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-gray-900/50 rounded-xl border border-gray-700">
            <Mail className="h-5 w-5 text-cyan-400 mr-3" />
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white">{studentProfile.email}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-900/50 rounded-xl border border-gray-700">
            <Phone className="h-5 w-5 text-emerald-400 mr-3" />
            <div>
              <p className="text-gray-400 text-sm">Phone</p>
              <p className="text-white">{studentProfile.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Skills & Technologies</h3>
          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
            <Plus className="h-4 w-4 inline mr-1" />
            Add Skill
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {studentProfile.skills.map((skill, index) => (
            <span key={index} className="px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500 rounded-full text-sm font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Resume & Documents */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Resume & Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-emerald-400 mr-2" />
                <span className="text-white font-medium">Resume</span>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Last updated: Sept 15, 2024</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
                <Download className="h-4 w-4 inline mr-1" />
                Download
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                <Upload className="h-4 w-4 inline mr-1" />
                Update
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-violet-400 mr-2" />
                <span className="text-white font-medium">Portfolio</span>
              </div>
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <p className="text-gray-400 text-sm mb-3">Add your portfolio link</p>
            <button className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors">
              <Plus className="h-4 w-4 inline mr-1" />
              Add Link
            </button>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Academic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mx-auto mb-2">
              <GraduationCap className="h-6 w-6 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{studentProfile.cgpa}</p>
            <p className="text-gray-400 text-sm">Current CGPA</p>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 mx-auto mb-2">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{studentProfile.year}</p>
            <p className="text-gray-400 text-sm">Current Year</p>
          </div>
          <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500 mx-auto mb-2">
              <Award className="h-6 w-6 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{studentStats.projectsCompleted}</p>
            <p className="text-gray-400 text-sm">Projects Done</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'internships':
        return <InternshipsPage />;
      case 'applications':
        return <ApplicationsPage />;
      case 'interviews':
        return <InterviewsPage />;
      case 'profile':
        return <ProfilePage />;
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

export default StudentDashboard;
          