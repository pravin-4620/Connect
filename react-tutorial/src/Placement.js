import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Bell,
  Settings,
  LogOut,
  Home,
  FileText,
  Target,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

const PlacementDashboard = ({ onLogout = () => {} }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New application from John Doe for SDE role', type: 'info', time: '2 min ago' },
    { id: 2, message: 'TechCorp wants to schedule campus interview', type: 'urgent', time: '1 hour ago' },
    { id: 3, message: 'Weekly placement report is ready', type: 'success', time: '3 hours ago' }
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
    inputFocus: darkMode ? 'focus:border-orange-500 focus:ring-orange-500' : 'focus:border-orange-500 focus:ring-orange-500',
    hover: darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100',
    divider: darkMode ? 'bg-gray-700' : 'bg-gray-200',
    tertiary: darkMode ? 'bg-gray-900/50' : 'bg-gray-100'
  };

  // Sample data
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 1248,
    placedStudents: 892,
    activeInternships: 45,
    partnerCompanies: 156,
    placementRate: 71.5,
    averagePackage: '₹6.8 LPA',
    monthlyPlacements: 127,
    pendingApplications: 234
  });

  const [studentStats] = useState({
    pending: 23,
    approved: 156,
    interviews: 45,
    placed: 89
  });

  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'Rahul Kumar',
      rollNumber: '21CSE001',
      email: 'rahul.kumar@college.edu',
      department: 'Computer Science',
      cgpa: 8.5,
      skills: ['React', 'Node.js', 'Python'],
      applications: 5,
      status: 'Active',
      lastActive: '2 hours ago',
      placement: { company: 'TechCorp', package: '₹8.5 LPA', status: 'Placed' }
    },
    {
      id: 2,
      name: 'Priya Sharma',
      rollNumber: '21IT045',
      email: 'priya.sharma@college.edu',
      department: 'Information Technology',
      cgpa: 9.1,
      skills: ['Java', 'Spring Boot', 'MySQL'],
      applications: 3,
      status: 'Interview',
      lastActive: '1 day ago',
      placement: { company: 'DataFlow Inc', package: 'Pending', status: 'In Process' }
    },
    {
      id: 3,
      name: 'Amit Patel',
      rollNumber: '21ECE023',
      email: 'amit.patel@college.edu',
      department: 'Electronics',
      cgpa: 7.8,
      skills: ['IoT', 'Arduino', 'C++'],
      applications: 7,
      status: 'Applied',
      lastActive: '3 hours ago',
      placement: { company: null, package: null, status: 'Seeking' }
    }
  ]);

  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'TechCorp',
      industry: 'Software',
      activeJobs: 8,
      totalHired: 45,
      rating: 4.5,
      contact: 'hr@techcorp.com',
      lastActive: '2 days ago',
      status: 'Active'
    },
    {
      id: 2,
      name: 'DataFlow Inc',
      industry: 'Analytics',
      activeJobs: 12,
      totalHired: 32,
      rating: 4.2,
      contact: 'careers@dataflow.com',
      lastActive: '1 week ago',
      status: 'Active'
    },
    {
      id: 3,
      name: 'InnovateLabs',
      industry: 'Research',
      activeJobs: 6,
      totalHired: 28,
      rating: 4.7,
      contact: 'jobs@innovatelabs.com',
      lastActive: '4 days ago',
      status: 'Active'
    }
  ]);

  const [internships, setInternships] = useState([
    {
      id: 1,
      title: 'Software Development Intern',
      company: 'TechCorp',
      location: 'Mumbai',
      type: 'Hybrid',
      duration: '6 months',
      stipend: '₹25,000',
      applications: 45,
      deadline: '2025-10-15',
      status: 'Active',
      requirements: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Data Science Intern',
      company: 'DataFlow Inc',
      location: 'Bangalore',
      type: 'Remote',
      duration: '4 months',
      stipend: '₹30,000',
      applications: 32,
      deadline: '2025-10-20',
      status: 'Active',
      requirements: ['Python', 'Machine Learning', 'SQL']
    }
  ]);

  const Sidebar = () => (
    <div className={`${theme.sidebarBg} ${theme.textPrimary} w-64 min-h-screen border-r ${theme.sidebarBorder} shadow-lg flex flex-col`}>
      <div className={`p-6 border-b ${theme.sidebarBorder} flex-shrink-0`}>
        <div className="flex items-center">
          <div className="p-2 bg-orange-500/20 rounded-xl border border-orange-500 mr-3">
            <Building2 className="h-8 w-8 text-orange-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${theme.textPrimary}`}>Placement Cell</h1>
            <p className={`text-xs ${theme.textSecondary}`}>Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-orange-400' },
            { id: 'students', label: 'Students', icon: Users, color: 'text-cyan-400', badge: studentStats.pending },
            { id: 'companies', label: 'Companies', icon: Building2, color: 'text-emerald-400' },
            { id: 'internships', label: 'Internships', icon: Briefcase, color: 'text-violet-400' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-pink-400' }
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
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500 flex-shrink-0">
              <User className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className={`text-sm font-medium ${theme.textPrimary} truncate`}>Dr. Sarah Wilson</p>
              <p className={`text-xs ${theme.textSecondary} truncate`}>Placement Officer</p>
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
            {activeTab === 'dashboard' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
          </h2>
          <p className={theme.textSecondary}>Placement Cell Management System</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
            <input
              type="text"
              placeholder="Search anything..."
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
            <Bell className={`h-6 w-6 ${theme.textSecondary} cursor-pointer hover:text-orange-400 transition-colors`} />
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-cyan-500 hover:shadow-cyan-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm`}>Total Students</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>{dashboardStats.totalStudents.toLocaleString()}</p>
              <p className="text-cyan-400 text-sm mt-1">↗ +12% from last month</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500">
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm`}>Placed Students</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>{dashboardStats.placedStudents.toLocaleString()}</p>
              <p className="text-emerald-400 text-sm mt-1">{dashboardStats.placementRate}% placement rate</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500">
              <Target className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm`}>Active Internships</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>{dashboardStats.activeInternships}</p>
              <p className="text-violet-400 text-sm mt-1">Across {dashboardStats.partnerCompanies} companies</p>
            </div>
            <div className="p-3 bg-violet-500/20 rounded-xl border border-violet-500">
              <Briefcase className="h-8 w-8 text-violet-400" />
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-orange-500 hover:shadow-orange-500/25 hover:shadow-lg transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${theme.textSecondary} text-sm`}>Avg Package</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>{dashboardStats.averagePackage}</p>
              <p className="text-orange-400 text-sm mt-1">↗ +15% from last year</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500">
              <Award className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
          <h3 className={`text-xl font-bold ${theme.textPrimary} mb-4`}>Recent Activity</h3>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-start p-3 ${theme.tertiary} rounded-xl border ${theme.cardBorder}`}>
                <div className={`p-2 rounded-lg mr-3 ${
                  notification.type === 'urgent' ? 'bg-red-500/20 border border-red-500' :
                  notification.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500' :
                  'bg-cyan-500/20 border border-cyan-500'
                }`}>
                  {notification.type === 'urgent' ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : notification.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Bell className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`${theme.textPrimary} text-sm`}>{notification.message}</p>
                  <p className={`${theme.textSecondary} text-xs mt-1`}>{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
          <h3 className={`text-xl font-bold ${theme.textPrimary} mb-4`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500 rounded-xl hover:from-cyan-500/30 hover:to-cyan-600/30 transition-all duration-300 group">
              <Plus className="h-8 w-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className={`${theme.textPrimary} font-medium`}>Add Student</p>
              <p className={`${theme.textSecondary} text-xs`}>Register new student</p>
            </button>

            <button className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500 rounded-xl hover:from-emerald-500/30 hover:to-emerald-600/30 transition-all duration-300 group">
              <Building2 className="h-8 w-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className={`${theme.textPrimary} font-medium`}>New Company</p>
              <p className={`${theme.textSecondary} text-xs`}>Add partner company</p>
            </button>

            <button className="p-4 bg-gradient-to-r from-violet-500/20 to-violet-600/20 border border-violet-500 rounded-xl hover:from-violet-500/30 hover:to-violet-600/30 transition-all duration-300 group">
              <Briefcase className="h-8 w-8 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className={`${theme.textPrimary} font-medium`}>Post Internship</p>
              <p className={`${theme.textSecondary} text-xs`}>Create opportunity</p>
            </button>

            <button className="p-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500 rounded-xl hover:from-orange-500/30 hover:to-orange-600/30 transition-all duration-300 group">
              <Download className="h-8 w-8 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className={`${theme.textPrimary} font-medium`}>Generate Report</p>
              <p className={`${theme.textSecondary} text-xs`}>Download analytics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Department Performance Chart */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Department Performance</h3>
          <select className={`${theme.input} border rounded-lg px-3 py-2 ${theme.textPrimary} outline-none`}>
            <option>This Year</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        </div>
        <div className={`h-64 ${theme.tertiary} rounded-xl flex items-center justify-center border ${theme.cardBorder}`}>
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className={theme.textSecondary}>Interactive chart would be rendered here</p>
            <p className={`${theme.textMuted} text-sm`}>Integration with Chart.js or similar library</p>
          </div>
        </div>
      </div>
    </div>
  );

  const StudentsManagement = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Search students..."
                className={`w-full pl-10 pr-4 py-2 ${theme.input} border rounded-xl ${theme.textPrimary} placeholder-gray-400 ${theme.inputFocus} outline-none`}
              />
            </div>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Information Technology</option>
              <option>Electronics</option>
              <option>Mechanical</option>
            </select>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Status</option>
              <option>Active</option>
              <option>Placed</option>
              <option>Interview</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
            <button className={`px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${theme.textPrimary} rounded-xl transition-colors flex items-center`}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl overflow-hidden`}>
        <div className={`p-6 border-b ${theme.cardBorder}`}>
          <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Student Database</h3>
          <p className={theme.textSecondary}>Manage and track all student profiles</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.tertiary}>
              <tr>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>Student</th>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>Department</th>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>CGPA</th>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>Applications</th>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>Status</th>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>Placement</th>
                <th className={`text-left py-4 px-6 ${theme.textSecondary} font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id} className={`border-b ${theme.cardBorder} ${theme.hover} transition-colors`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500 mr-3">
                        <User className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className={`${theme.textPrimary} font-medium`}>{student.name}</p>
                        <p className={`${theme.textSecondary} text-sm`}>{student.rollNumber}</p>
                        <p className={`${theme.textMuted} text-xs`}>{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={theme.textPrimary}>{student.department}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${
                      student.cgpa >= 9 ? 'text-emerald-400' :
                      student.cgpa >= 8 ? 'text-cyan-400' :
                      'text-orange-400'
                    }`}>
                      {student.cgpa}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={theme.textPrimary}>{student.applications}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      student.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' :
                      student.status === 'Interview' ? 'bg-orange-500/20 text-orange-400 border-orange-500' :
                      'bg-cyan-500/20 text-cyan-400 border-cyan-500'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {student.placement.company ? (
                      <div>
                        <p className={`${theme.textPrimary} text-sm font-medium`}>{student.placement.company}</p>
                        <p className="text-emerald-400 text-xs">{student.placement.package}</p>
                      </div>
                    ) : (
                      <span className={`${theme.textMuted} text-sm`}>Not placed</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className={`p-2 ${theme.hover} rounded-lg transition-colors`}>
                        <Eye className={`h-4 w-4 ${theme.textSecondary} hover:text-cyan-400`} />
                      </button>
                      <button className={`p-2 ${theme.hover} rounded-lg transition-colors`}>
                        <Edit className={`h-4 w-4 ${theme.textSecondary} hover:text-emerald-400`} />
                      </button>
                      <button className={`p-2 ${theme.hover} rounded-lg transition-colors`}>
                        <Mail className={`h-4 w-4 ${theme.textSecondary} hover:text-orange-400`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CompaniesManagement = () => (
    <div className="space-y-6">
      {/* Search and Add Company */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-3 h-4 w-4 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Search companies..."
                className={`w-full pl-10 pr-4 py-2 ${theme.input} border rounded-xl ${theme.textPrimary} placeholder-gray-400 ${theme.inputFocus} outline-none`}
              />
            </div>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Industries</option>
              <option>Software</option>
              <option>Analytics</option>
              <option>Research</option>
              <option>Consulting</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500 mr-3">
                  <Building2 className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme.textPrimary} group-hover:text-emerald-400 transition-colors`}>
                    {company.name}
                  </h3>
                  <p className={`${theme.textSecondary} text-sm`}>{company.industry}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                company.status === 'Active' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                  : 'bg-red-500/20 text-red-400 border-red-500'
              }`}>
                {company.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className={`${theme.textSecondary} text-sm`}>Active Jobs:</span>
                <span className={`${theme.textPrimary} font-medium`}>{company.activeJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme.textSecondary} text-sm`}>Total Hired:</span>
                <span className="text-emerald-400 font-medium">{company.totalHired}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme.textSecondary} text-sm`}>Rating:</span>
                <div className="flex items-center">
                  <span className="text-orange-400 font-medium mr-1">⭐</span>
                  <span className={theme.textPrimary}>{company.rating}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${theme.textSecondary} text-sm`}>Last Active:</span>
                <span className={`${theme.textPrimary} text-sm`}>{company.lastActive}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
                View Details
              </button>
              <button className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}>
                <Mail className={`h-4 w-4 ${theme.textSecondary}`} />
              </button>
              <button className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}>
                <Edit className={`h-4 w-4 ${theme.textSecondary}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Company Statistics */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Company Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500 mx-auto mb-3">
              <Building2 className="h-8 w-8 text-emerald-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>156</p>
            <p className={`${theme.textSecondary} text-sm`}>Total Partners</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500 mx-auto mb-3">
              <Briefcase className="h-8 w-8 text-orange-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>45</p>
            <p className={`${theme.textSecondary} text-sm`}>Active Opportunities</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500 mx-auto mb-3">
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>892</p>
            <p className={`${theme.textSecondary} text-sm`}>Students Placed</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500 mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-violet-400" />
            </div>
            <p className={`text-2xl font-bold ${theme.textPrimary}`}>87%</p>
            <p className={`${theme.textSecondary} text-sm`}>Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </div>
  );

  const InternshipsManagement = () => (
    <div className="space-y-6">
      {/* Search and Add Internship */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
              <option>All Companies</option>
              <option>TechCorp</option>
              <option>DataFlow Inc</option>
              <option>InnovateLabs</option>
            </select>
            <select className={`${theme.input} border rounded-xl px-4 py-2 ${theme.textPrimary} outline-none`}>
              <option>All Types</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Post Internship
          </button>
        </div>
      </div>

      {/* Internships List */}
      <div className="space-y-4">
        {internships.map((internship) => (
          <div key={internship.id} className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 hover:border-violet-500 hover:shadow-violet-500/25 hover:shadow-lg transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center border border-violet-500 mr-4">
                  <Briefcase className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${theme.textPrimary} mb-1`}>{internship.title}</h3>
                  <p className="text-violet-400 font-medium mb-2">{internship.company}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg text-xs flex items-center`}>
                      <MapPin className="h-3 w-3 mr-1" />
                      {internship.location}
                    </span>
                    <span className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg text-xs flex items-center`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {internship.duration}
                    </span>
                    <span className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-lg text-xs flex items-center`}>
                      <DollarSign className="h-3 w-3 mr-1" />
                      {internship.stipend}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs ${
                      internship.type === 'Remote' ? 'bg-emerald-500/20 text-emerald-400' :
                      internship.type === 'Hybrid' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {internship.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  internship.status === 'Active' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                    : 'bg-red-500/20 text-red-400 border-red-500'
                }`}>
                  {internship.status}
                </span>
                <p className={`${theme.textSecondary} text-sm mt-2`}>Deadline: {internship.deadline}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-sm mb-1`}>Applications</p>
                <p className={`text-2xl font-bold ${theme.textPrimary}`}>{internship.applications}</p>
              </div>
              <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-sm mb-1`}>Requirements</p>
                <div className="flex flex-wrap gap-1">
                  {internship.requirements.slice(0, 3).map((req, index) => (
                    <span key={index} className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs">
                      {req}
                    </span>
                  ))}
                  {internship.requirements.length > 3 && (
                    <span className={`px-2 py-1 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'} rounded text-xs`}>
                      +{internship.requirements.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <div className={`${theme.tertiary} rounded-xl p-4 border ${theme.cardBorder}`}>
                <p className={`${theme.textSecondary} text-sm mb-1`}>Actions</p>
                <div className="flex gap-2">
                  <button className="p-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors">
                    <Eye className="h-4 w-4 text-white" />
                  </button>
                  <button className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}>
                    <Edit className={`h-4 w-4 ${theme.textSecondary}`} />
                  </button>
                  <button className={`p-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors`}>
                    <Users className={`h-4 w-4 ${theme.textSecondary}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AnalyticsPage = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500 rounded-2xl p-6 ${darkMode ? '' : 'bg-gradient-to-r from-cyan-50 to-cyan-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400 text-sm font-medium">Placement Rate</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>71.5%</p>
              <p className="text-cyan-300 text-sm">↗ +5.2% from last year</p>
            </div>
            <TrendingUp className="h-10 w-10 text-cyan-400" />
          </div>
        </div>
        
        <div className={`bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500 rounded-2xl p-6 ${darkMode ? '' : 'bg-gradient-to-r from-emerald-50 to-emerald-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm font-medium">Avg Package</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>₹6.8L</p>
              <p className="text-emerald-300 text-sm">↗ +12% from last year</p>
            </div>
            <Award className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        
        <div className={`bg-gradient-to-r from-violet-500/20 to-violet-600/20 border border-violet-500 rounded-2xl p-6 ${darkMode ? '' : 'bg-gradient-to-r from-violet-50 to-violet-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-400 text-sm font-medium">Active Companies</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>156</p>
              <p className="text-violet-300 text-sm">↗ +15 new this month</p>
            </div>
            <Building2 className="h-10 w-10 text-violet-400" />
          </div>
        </div>
        
        <div className={`bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500 rounded-2xl p-6 ${darkMode ? '' : 'bg-gradient-to-r from-orange-50 to-orange-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Success Rate</p>
              <p className={`text-3xl font-bold ${theme.textPrimary}`}>89%</p>
              <p className="text-orange-300 text-sm">Interview to offer</p>
            </div>
            <Target className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Monthly Placement Trends</h3>
            <select className={`${theme.input} border rounded-lg px-3 py-2 ${theme.textPrimary} text-sm outline-none`}>
              <option>Last 12 months</option>
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>
          <div className={`h-64 ${theme.tertiary} rounded-xl flex items-center justify-center border ${theme.cardBorder}`}>
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-cyan-400 mx-auto mb-2" />
              <p className={theme.textSecondary}>Line chart showing placement trends</p>
            </div>
          </div>
        </div>
        
        <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Department Performance</h3>
            <button className="text-emerald-400 hover:text-emerald-300 text-sm">View Details</button>
          </div>
          <div className={`h-64 ${theme.tertiary} rounded-xl flex items-center justify-center border ${theme.cardBorder}`}>
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
              <p className={theme.textSecondary}>Donut chart for departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Stats Table */}
      <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6`}>
        <h3 className={`text-xl font-bold ${theme.textPrimary} mb-6`}>Department-wise Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.tertiary}>
              <tr>
                <th className={`text-left py-3 px-4 ${theme.textSecondary}`}>Department</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary}`}>Students</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary}`}>Placed</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary}`}>Rate</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary}`}>Avg Package</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary}`}>Top Companies</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dept: 'Computer Science', students: 320, placed: 254, rate: 79.4, pkg: '₹8.2L', companies: 'Google, Microsoft, Amazon' },
                { dept: 'Information Technology', students: 280, placed: 210, rate: 75.0, pkg: '₹7.5L', companies: 'Infosys, TCS, Wipro' },
                { dept: 'Electronics', students: 240, placed: 156, rate: 65.0, pkg: '₹6.8L', companies: 'Samsung, Intel, Qualcomm' },
                { dept: 'Mechanical', students: 200, placed: 120, rate: 60.0, pkg: '₹5.5L', companies: 'Tata, Mahindra, L&T' }
              ].map((row, index) => (
                <tr key={index} className={`border-b ${theme.cardBorder} ${theme.hover}`}>
                  <td className={`py-3 px-4 ${theme.textPrimary} font-medium`}>{row.dept}</td>
                  <td className={`py-3 px-4 ${theme.textPrimary}`}>{row.students}</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{row.placed}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.rate > 75 ? 'bg-emerald-500/20 text-emerald-400' :
                      row.rate > 65 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {row.rate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-medium">{row.pkg}</td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{row.companies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'students':
        return <StudentsManagement />;
      case 'companies':
        return <CompaniesManagement />;
      case 'internships':
        return <InternshipsManagement />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return (
          <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-8 text-center`}>
            <div className={`w-16 h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Zap className={`h-8 w-8 ${theme.textSecondary}`} />
            </div>
            <h3 className={`text-xl font-bold ${theme.textPrimary} mb-2`}>Coming Soon</h3>
            <p className={theme.textSecondary}>This feature is under development</p>
          </div>
        );
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

export default PlacementDashboard;
