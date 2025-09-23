import React, { useState } from 'react';
import {
  Briefcase,
  User,
  FileText,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
  Bell,
  LogOut,
  Home,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  DollarSign,
  Star,
  Target,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  Upload,
  Edit,
  Zap,
  GraduationCap,
  Users,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  Sun,
  Moon
} from 'lucide-react';

const StudentDashboard = ({ onLogout = () => {} }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications] = useState([
    { id: 1, message: 'Application approved by mentor for TechCorp internship', type: 'success', time: '2 hours ago' },
    { id: 2, message: 'Interview scheduled for tomorrow at 2:00 PM', type: 'urgent', time: '4 hours ago' },
    { id: 3, message: 'New internship match found: Data Science at AI Labs', type: 'info', time: '1 day ago' }
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
    inputFocus: darkMode ? 'focus:border-cyan-500 focus:ring-cyan-500' : 'focus:border-cyan-500 focus:ring-cyan-500',
    hover: darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100',
    divider: darkMode ? 'bg-gray-700' : 'bg-gray-200',
    tertiary: darkMode ? 'bg-gray-900/50' : 'bg-gray-100'
  };

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
    <div className={`${theme.sidebarBg} ${theme.textPrimary} w-64 min-h-screen border-r ${theme.sidebarBorder} shadow-lg flex flex-col`}>
      <div className={`p-6 border-b ${theme.sidebarBorder} flex-shrink-0`}>
        <div className="flex items-center">
          <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500 mr-3">
            <GraduationCap className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${theme.textPrimary}`}>Student Portal</h1>
            <p className={`text-xs ${theme.textSecondary}`}>Career Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-cyan-400' },
            { id: 'internships', label: 'Find Internships', icon: Briefcase, color: 'text-violet-400' },
            { id: 'applications', label: 'My Applications', icon: FileText, color: 'text-orange-400', badge: studentStats.pending },
            { id: 'interviews', label: 'Interviews', icon: Calendar, color: 'text-emerald-400' },
            { id: 'profile', label: 'Profile', icon: User, color: 'text-pink-400' },
            { id: 'resources', label: 'Resources', icon: BookOpen, color: 'text-blue-400' },
            { id: 'mentorship', label: 'Mentorship', icon: Users, color: 'text-yellow-400' }
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
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 flex-shrink-0">
              <User className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className={`text-sm font-medium ${theme.textPrimary} truncate`}>{studentProfile.name}</p>
              <p className={`text-xs ${theme.textSecondary} truncate`}>{studentProfile.rollNumber}</p>
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
            {activeTab === 'dashboard' ? 'Student Dashboard' : activeTab.replace('-', ' ')}
          </h2>
          <p className={theme.textSecondary}>Track your career journey</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
            <input
              type="text"
              placeholder="Search internships..."
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
            <Bell className={`h-6 w-6 ${theme.textSecondary} cursor-pointer hover:text-cyan-400 transition-colors`} />
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </div>
        </div>
      </div>
    </header>
  );

  // Dashboard content
  const DashboardContent = () => (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500 rounded-2xl p-6 ${darkMode ? '' : 'bg-gradient-to-r from-cyan-50 to-blue-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Welcome back, {studentProfile.name}!</h3>
            <p className="text-cyan-600">Ready to take the next step in your career journey?</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-500 text-sm">Profile Completion</p>
            <div className="flex items-center mt-1">
              <div className={`w-20 h-2 ${theme.divider} rounded-full mr-2`}>
                <div
                  className="h-2 bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${studentProfile.profileComplete}%` }}
                ></div>
              </div>
              <span className={`${theme.textPrimary} font-bold`}>{studentProfile.profileComplete}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Applications', value: studentStats.applications, subtext: `${studentStats.pending} pending`, icon: FileText, color: 'cyan' },
          { label: 'Interviews', value: studentStats.interviews, subtext: 'Scheduled', icon: Calendar, color: 'emerald' },
          { label: 'Offers', value: studentStats.offers, subtext: 'Success rate: 12.5%', icon: Award, color: 'violet' },
          { label: 'Profile Views', value: studentStats.profileViews, subtext: 'This month', icon: Eye, color: 'orange' }
        ].map((stat, index) => (
          <div key={index} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-${stat.color}-500 hover:shadow-${stat.color}-500/25 hover:shadow-lg transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${theme.textSecondary} text-sm`}>{stat.label}</p>
                <p className={`text-3xl font-bold ${theme.textPrimary}`}>{stat.value}</p>
                <p className={`text-${stat.color}-400 text-sm mt-1`}>{stat.subtext}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-500/20 rounded-xl border border-${stat.color}-500`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Find Internships content
  const InternshipsContent = () => (
    <div className="space-y-6">
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Search internships..."
                className={`w-full pl-10 pr-4 py-2 ${theme.input} border rounded-xl ${theme.textPrimary} placeholder-gray-400 ${theme.inputFocus} outline-none`}
              />
            </div>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Locations</option>
              <option>Remote</option>
              <option>Mumbai</option>
              <option>Bangalore</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
        <p className={theme.textSecondary}>{availableInternships.length} internships found</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableInternships.map((internship) => (
          <div key={internship.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-violet-500 transition-all duration-300 relative`}>
            {internship.isNew && (
              <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">
                NEW
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{internship.logo}</div>
                <div>
                  <h3 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>{internship.title}</h3>
                  <p className="text-violet-400 font-medium">{internship.company}</p>
                  <div className={`flex items-center gap-3 mt-2 text-sm ${theme.textSecondary}`}>
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
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                internship.matchScore >= 90 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
                internship.matchScore >= 80 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' :
                'bg-orange-500/20 text-orange-400 border border-orange-500'
              }`}>
                <Target className="h-3 w-3 mr-1" />
                {internship.matchScore}% Match
              </div>
            </div>
            
            <p className={`${theme.textPrimary} text-sm leading-relaxed mb-4`}>{internship.description}</p>
            
            <div className="mb-4">
              <p className={`${theme.textSecondary} text-sm mb-2`}>Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {internship.requirements.map((req, index) => {
                  const hasSkill = studentProfile.skills.includes(req);
                  return (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        hasSkill
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                          : `${theme.tertiary} ${theme.textSecondary}`
                      }`}
                    >
                      {req} {hasSkill && '✓'}
                    </span>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className={`${theme.tertiary} rounded-xl p-3 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-xs`}>Stipend</p>
                <p className="text-emerald-400 font-bold">{internship.stipend}</p>
              </div>
              <div className={`${theme.tertiary} rounded-xl p-3 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-xs`}>Applicants</p>
                <p className={`${theme.textPrimary} font-bold`}>{internship.applicants}</p>
              </div>
              <div className={`${theme.tertiary} rounded-xl p-3 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-xs`}>Deadline</p>
                <p className="text-orange-400 font-bold text-xs">{internship.deadline}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-medium">
                Apply Now
              </button>
              <button className={`px-4 py-2 ${theme.tertiary} ${theme.hover} rounded-xl transition-colors`}>
                <Eye className={`h-4 w-4 ${theme.textSecondary}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Applications content
  const ApplicationsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Applied', value: studentStats.applications, icon: FileText, color: 'cyan' },
          { label: 'Under Review', value: studentStats.pending, icon: Clock, color: 'orange' },
          { label: 'Interviews', value: studentStats.interviews, icon: CheckCircle2, color: 'emerald' },
          { label: 'Offers Received', value: studentStats.offers, icon: Award, color: 'violet' }
        ].map((stat, index) => (
          <div key={index} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-4 text-center`}>
            <div className={`w-12 h-12 bg-${stat.color}-500/20 rounded-xl flex items-center justify-center border border-${stat.color}-500 mx-auto mb-2`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>{stat.value}</p>
            <p className={`${theme.textSecondary} text-sm`}>{stat.label}</p>
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-orange-500 transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="text-3xl mr-4">{app.internship.logo}</div>
                <div>
                  <h3 className={`text-xl font-bold ${theme.textPrimary}`}>{app.internship.title}</h3>
                  <p className="text-orange-400 font-medium">{app.internship.company}</p>
                  <div className={`flex items-center gap-4 mt-2 text-sm ${theme.textSecondary}`}>
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {app.internship.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {app.internship.stipend}
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
                <p className={`${theme.textSecondary} text-sm mt-2`}>Applied: {app.appliedDate}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className={`${theme.textSecondary} text-sm`}>Application Progress</p>
                <p className={`${theme.textPrimary} text-sm font-medium`}>{app.stage}</p>
              </div>
              <div className={`w-full ${theme.divider} rounded-full h-2`}>
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
            
            {app.feedback && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-red-400 font-medium text-sm mb-1">Feedback:</p>
                <p className={`${theme.textPrimary} text-sm`}>{app.feedback}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors text-sm">
                View Details
              </button>
              {app.status === 'Interview Scheduled' && (
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors text-sm">
                  Interview Prep
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Profile content
  const ProfileContent = () => (
    <div className="space-y-6">
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mr-6">
              <User className="h-10 w-10 text-cyan-400" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>{studentProfile.name}</h2>
              <p className="text-cyan-400 font-medium">{studentProfile.rollNumber}</p>
              <p className={theme.textSecondary}>{studentProfile.department}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className={`${theme.textPrimary} font-bold mr-2`}>CGPA: {studentProfile.cgpa}</span>
                <span className={theme.textSecondary}>• Year {studentProfile.year}</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>
        
        <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
          <div className="flex justify-between items-center mb-2">
            <p className={`${theme.textPrimary} font-medium`}>Profile Completion</p>
            <span className="text-cyan-400 font-bold">{studentProfile.profileComplete}%</span>
          </div>
          <div className={`w-full ${theme.divider} rounded-full h-2`}>
            <div
              className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${studentProfile.profileComplete}%` }}
            ></div>
          </div>
          <p className={`${theme.textSecondary} text-sm mt-2`}>Complete your profile to get better internship matches!</p>
        </div>
      </div>

      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-4`}>Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex items-center p-3 ${theme.tertiary} rounded-xl border ${theme.cardBorder}`}>
            <Mail className="h-5 w-5 text-cyan-400 mr-3" />
            <div>
              <p className={`${theme.textSecondary} text-sm`}>Email</p>
              <p className={theme.textPrimary}>{studentProfile.email}</p>
            </div>
          </div>
          <div className={`flex items-center p-3 ${theme.tertiary} rounded-xl border ${theme.cardBorder}`}>
            <Phone className="h-5 w-5 text-emerald-400 mr-3" />
            <div>
              <p className={`${theme.textSecondary} text-sm`}>Phone</p>
              <p className={theme.textPrimary}>{studentProfile.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Skills & Technologies</h3>
          <button className={`px-3 py-1 ${theme.tertiary} ${theme.hover} rounded-lg text-sm transition-colors`}>
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
    </div>
  );

  // Resources content
  const ResourcesContent = () => (
    <div className="space-y-6">
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Study Materials</h3>
        <div className="space-y-4">
          {[
            { title: 'Data Structures & Algorithms', type: 'PDF', size: '2.5 MB', downloads: 1243, icon: '📚' },
            { title: 'System Design Interview Questions', type: 'PDF', size: '1.8 MB', downloads: 892, icon: '🏗️' },
            { title: 'JavaScript Interview Questions', type: 'PDF', size: '1.2 MB', downloads: 756, icon: '⚡' },
            { title: 'Database Design Principles', type: 'PDF', size: '3.1 MB', downloads: 634, icon: '🗄️' }
          ].map((material, index) => (
            <div key={index} className={`flex items-center justify-between p-4 ${theme.tertiary} rounded-xl border ${theme.cardBorder} hover:border-orange-500 transition-colors`}>
              <div className="flex items-center">
                <div className="text-2xl mr-4">{material.icon}</div>
                <div>
                  <h4 className={`${theme.textPrimary} font-medium`}>{material.title}</h4>
                  <p className={`${theme.textSecondary} text-sm`}>{material.type} • {material.size} • {material.downloads} downloads</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                <Download className="h-4 w-4 inline mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Useful Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'LeetCode', description: 'Practice coding problems', url: 'leetcode.com', color: 'text-yellow-400' },
            { name: 'HackerRank', description: 'Coding challenges and competitions', url: 'hackerrank.com', color: 'text-green-400' },
            { name: 'GeeksforGeeks', description: 'Programming tutorials and articles', url: 'geeksforgeeks.org', color: 'text-blue-400' },
            { name: 'GitHub', description: 'Host your coding projects', url: 'github.com', color: 'text-purple-400' }
          ].map((link, index) => (
            <div key={index} className={`flex items-center justify-between p-3 ${theme.tertiary} rounded-xl border ${theme.cardBorder}`}>
              <div>
                <h4 className={`${theme.textPrimary} font-medium`}>{link.name}</h4>
                <p className={`${theme.textSecondary} text-sm`}>{link.description}</p>
                <p className={`text-xs ${link.color}`}>{link.url}</p>
              </div>
              <ExternalLink className={`h-5 w-5 ${theme.textSecondary} hover:${theme.textPrimary} cursor-pointer transition-colors`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Interviews content
  const InterviewsContent = () => (
    <div className="space-y-6">
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Upcoming Interviews</h3>
        <div className="space-y-4">
          {upcomingEvents.filter(event => event.type === 'Interview').map((interview) => (
            <div key={interview.id} className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder} hover:border-emerald-500 transition-colors`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 mr-4">
                    <Calendar className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className={`${theme.textPrimary} font-bold text-lg`}>{interview.title}</h4>
                    <p className="text-emerald-400">Technical Round</p>
                    <p className={`${theme.textSecondary} text-sm`}>Focus: {interview.preparation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`${theme.textPrimary} font-bold`}>{interview.date}</p>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Mentorship content
  const MentorshipContent = () => (
    <div className="space-y-6">
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Your Mentor</h3>
        <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mr-4">
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h4 className={`text-xl font-bold ${theme.textPrimary}`}>Prof. Sarah Wilson</h4>
                <p className="text-emerald-400 font-medium">Senior Faculty, Computer Science</p>
                <p className={`${theme.textSecondary} text-sm`}>Mentoring since: Jan 2024</p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className={`ml-2 ${theme.textSecondary} text-sm`}>5.0 (127 reviews)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-2 mb-2">
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Message
                </button>
              </div>
              <p className="text-emerald-400 text-sm">Available Today</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Recent Activities</h3>
        <div className="space-y-4">
          {[
            {
              type: 'Meeting',
              title: 'Resume Review Session',
              date: '2024-09-20',
              time: '2:00 PM',
              status: 'Completed',
              feedback: 'Great improvements on technical skills section. Focus on quantifying achievements.'
            },
            {
              type: 'Review',
              title: 'TechCorp Application Approved',
              date: '2024-09-18',
              time: '10:30 AM',
              status: 'Approved',
              feedback: 'Strong application. Good match for your skillset. Recommended for interview.'
            }
          ].map((activity, index) => (
            <div key={index} className={`p-4 ${theme.tertiary} rounded-xl border ${theme.cardBorder}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    activity.type === 'Meeting' ? 'bg-cyan-500/20 border border-cyan-500' :
                    'bg-emerald-500/20 border border-emerald-500'
                  }`}>
                    {activity.type === 'Meeting' ? (
                      <Calendar className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`${theme.textPrimary} font-medium`}>{activity.title}</h4>
                    <p className={`${theme.textSecondary} text-sm`}>{activity.date} • {activity.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' :
                  'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                }`}>
                  {activity.status}
                </span>
              </div>
              <p className={`${theme.textPrimary} text-sm`}>{activity.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'internships':
        return <InternshipsContent />;
      case 'applications':
        return <ApplicationsContent />;
      case 'interviews':
        return <InterviewsContent />;
      case 'profile':
        return <ProfileContent />;
      case 'resources':
        return <ResourcesContent />;
      case 'mentorship':
        return <MentorshipContent />;
      default:
        return <DashboardContent />;
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

export default StudentDashboard;
