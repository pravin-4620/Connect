import React, { useState } from 'react';
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
  User,
  X,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const MentorDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample data
  const stats = [
    { label: 'Assigned Students', value: '24', change: '+2', icon: Users, color: 'gray' },
    { label: 'Pending Approvals', value: '8', change: '+3', icon: CheckCircle2, color: 'gray' },
    { label: 'Upcoming Meetings', value: '12', change: '+4', icon: Calendar, color: 'gray' },
    { label: 'Active Placements', value: '5', change: '+1', icon: Briefcase, color: 'gray' }
  ];

  const students = [
    {
      name: 'Alex Johnson',
      rollNo: '21CSE089',
      email: 'alex.j@college.edu',
      phone: '+1 234-567-8901',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      department: 'Computer Science',
      year: '3rd Year',
      gpa: 8.4,
      applications: 8,
      skills: 'React, Node.js, Python, Machine Learning',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexj'
    },
    {
      name: 'Sarah Williams',
      rollNo: '21CSE045',
      email: 'sarah.w@college.edu',
      phone: '+1 234-567-8902',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      department: 'Computer Science',
      year: '3rd Year',
      gpa: 8.7,
      applications: 6,
      skills: 'Java, Spring Boot, AWS, Docker',
      linkedin: 'linkedin.com/in/sarahw',
      github: 'github.com/sarahwilliams'
    },
    {
      name: 'Michael Brown',
      rollNo: '21CSE103',
      email: 'michael.b@college.edu',
      phone: '+1 234-567-8903',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      department: 'Computer Science',
      year: '3rd Year',
      gpa: 7.8,
      applications: 3,
      skills: 'C++, Data Structures, Algorithms',
      linkedin: 'linkedin.com/in/michaelbrown',
      github: 'github.com/michaelb'
    },
    {
      name: 'Emily Davis',
      rollNo: '21CSE067',
      email: 'emily.d@college.edu',
      phone: '+1 234-567-8904',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      department: 'Computer Science',
      year: '3rd Year',
      gpa: 9.1,
      applications: 10,
      skills: 'Python, TensorFlow, Data Science, AI',
      linkedin: 'linkedin.com/in/emilydavis',
      github: 'github.com/emilyd'
    }
  ];

  const approvalRequests = [
    {
      id: 1,
      student: 'Alex Johnson',
      studentAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      type: 'placement',
      company: 'Google',
      position: 'Software Engineer Intern',
      reason: 'I am passionate about working on large-scale distributed systems and Google\'s infrastructure aligns with my career goals.',
      appliedDate: 'Oct 18, 2025',
      status: 'pending'
    },
    {
      id: 2,
      student: 'Sarah Williams',
      studentAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      type: 'event',
      title: 'Tech Fest 2025',
      eventType: 'Competition',
      reason: 'I want to participate in the hackathon to showcase my full-stack development skills and network with industry professionals.',
      appliedDate: 'Oct 19, 2025',
      status: 'pending'
    },
    {
      id: 3,
      student: 'Emily Davis',
      studentAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      type: 'placement',
      company: 'Microsoft',
      position: 'Data Science Intern',
      reason: 'Microsoft\'s AI research division is doing cutting-edge work in ML, and I want to contribute to their projects.',
      appliedDate: 'Oct 20, 2025',
      status: 'pending'
    },
    {
      id: 4,
      student: 'Michael Brown',
      studentAvatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      type: 'event',
      title: 'AI Workshop',
      eventType: 'Workshop',
      reason: 'I need to strengthen my understanding of neural networks and deep learning frameworks.',
      appliedDate: 'Oct 20, 2025',
      status: 'pending'
    }
  ];

  const placements = [
    {
      company: 'Google',
      logo: '🔍',
      role: 'Software Engineer Intern',
      package: '$8,000/month',
      type: 'Internship',
      deadline: 'Nov 15, 2025',
      status: 'Open'
    },
    {
      company: 'Microsoft',
      logo: '🪟',
      role: 'Product Manager Intern',
      package: '$7,500/month',
      type: 'Internship',
      deadline: 'Nov 20, 2025',
      status: 'Open'
    },
    {
      company: 'Amazon',
      logo: '📦',
      role: 'SDE Intern',
      package: '$7,800/month',
      type: 'Internship',
      deadline: 'Nov 10, 2025',
      status: 'Open'
    },
    {
      company: 'Meta',
      logo: '👁️',
      role: 'Frontend Engineer',
      package: '$140,000/year',
      type: 'Full-time',
      deadline: 'Dec 1, 2025',
      status: 'Open'
    },
    {
      company: 'Tesla',
      logo: '⚡',
      role: 'Software Engineer',
      package: '$130,000/year',
      type: 'Full-time',
      deadline: 'Nov 25, 2025',
      status: 'Closing Soon'
    }
  ];

  const collegeEvents = [
    {
      title: 'Tech Fest 2025',
      type: 'Competition',
      description: 'Annual technology festival with hackathons, coding competitions, and tech talks.',
      date: 'Nov 15-17, 2025',
      venue: 'Main Auditorium'
    },
    {
      title: 'AI & ML Workshop',
      type: 'Workshop',
      description: 'Hands-on workshop on artificial intelligence and machine learning fundamentals.',
      date: 'Nov 5, 2025',
      venue: 'Lab 301'
    },
    {
      title: 'Career Fair 2025',
      type: 'Career',
      description: 'Meet recruiters from top companies and explore career opportunities.',
      date: 'Nov 20, 2025',
      venue: 'Sports Complex'
    },
    {
      title: 'Coding Bootcamp',
      type: 'Workshop',
      description: 'Intensive coding bootcamp covering data structures and algorithms.',
      date: 'Nov 8-10, 2025',
      venue: 'Computer Lab'
    },
    {
      title: 'Industry Seminar',
      type: 'Seminar',
      description: 'Learn about latest industry trends from experienced professionals.',
      date: 'Nov 12, 2025',
      venue: 'Seminar Hall'
    },
    {
      title: 'Hackathon 2025',
      type: 'Competition',
      description: '24-hour hackathon to build innovative solutions for real-world problems.',
      date: 'Nov 22-23, 2025',
      venue: 'Innovation Center'
    }
  ];

  const mails = [
    {
      from: 'Alex Johnson',
      subject: 'Regarding placement application review',
      time: '10 mins ago',
      unread: true,
      important: true
    },
    {
      from: 'Placement Cell',
      subject: 'New placement opportunity - Google',
      time: '2 hours ago',
      unread: true,
      important: false
    },
    {
      from: 'Sarah Williams',
      subject: 'Request for career guidance meeting',
      time: '1 day ago',
      unread: false,
      important: false
    },
    {
      from: 'Department Head',
      subject: 'Mentor meeting scheduled for next week',
      time: '2 days ago',
      unread: false,
      important: true
    },
    {
      from: 'Michael Brown',
      subject: 'Thank you for the mock interview session',
      time: '3 days ago',
      unread: false,
      important: false
    }
  ];

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = (request) => {
    showToast(`Approved request from ${request.student}`);
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  const handleReject = (request) => {
    showToast(`Rejected request from ${request.student}`);
    setShowApprovalModal(false);
    setSelectedRequest(null);
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 shadow px-4 md:px-6 py-2 md:py-3 flex items-center space-x-2 md:space-x-3">
          <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
          <span className="text-xs md:text-sm text-gray-900">{toast}</span>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl max-w-2xl w-full p-4 md:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Review Approval Request</h2>
              <button onClick={() => setShowApprovalModal(false)}>
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="mb-4 md:mb-6">
              <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                <img src={selectedRequest.studentAvatar} alt={selectedRequest.student} className="h-10 w-10 md:h-12 md:w-12 border border-gray-300" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{selectedRequest.student}</p>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {selectedRequest.type === 'placement' ? `${selectedRequest.position} at ${selectedRequest.company}` : selectedRequest.title}
                  </p>
                </div>
              </div>
              
              <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                  {selectedRequest.type === 'placement' ? 'Placement Application' : 'Event Registration'}
                </p>
                <p className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                  {selectedRequest.type === 'placement' ? selectedRequest.company : selectedRequest.title}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mb-2"><strong>Applied:</strong> {selectedRequest.appliedDate}</p>
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Student's Reason
                </label>
                <div className="p-3 md:p-4 bg-gray-50 border border-gray-200">
                  <p className="text-xs md:text-sm text-gray-700">{selectedRequest.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:gap-0">
              <button
                onClick={() => handleReject(selectedRequest)}
                className="flex-1 px-3 md:px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-xs md:text-sm flex items-center justify-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleApprove(selectedRequest)}
                className="flex-1 px-3 md:px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs md:text-sm flex items-center justify-center space-x-2"
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
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-50 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-900 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-base">CampusConnect</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
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
              { id: 'mails', label: 'Mails', icon: Mail }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
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
                src="https://randomuser.me/api/portraits/women/47.jpg"
                alt="Profile"
                className="h-10 w-10 border border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">Prof. Sarah Wilson</p>
                <p className="text-xs text-gray-600">CS Department</p>
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
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden hover:bg-gray-100 p-2 rounded -ml-2"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Mentor Portal</h1>
                <p className="text-gray-600 text-xs md:text-sm mt-1 hidden sm:block">Welcome back, Prof. Sarah Wilson</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="relative p-2 hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
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
                      className="bg-white p-4 md:p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className="p-2 bg-gray-100">
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1">
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-900">Recent Approval Requests</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {approvalRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openApprovalModal(request)}>
                        <div className="flex items-center space-x-3 mb-2">
                          <img src={request.studentAvatar} alt={request.student} className="h-10 w-10 border border-gray-300" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{request.student}</p>
                            <p className="text-xs text-gray-600">
                              {request.type === 'placement' ? `${request.company} - ${request.position}` : request.title}
                            </p>
                          </div>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 border border-gray-200">
                            {request.appliedDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button onClick={() => setActiveTab('approvals')} className="text-sm text-gray-900 font-medium hover:underline">
                      View All Requests →
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-900">My Students</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {students.slice(0, 3).map((student, idx) => (
                      <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <img src={student.avatar} alt={student.name} className="h-10 w-10 border border-gray-300" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                            <p className="text-xs text-gray-600">{student.rollNo} • GPA: {student.gpa}</p>
                          </div>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 border border-gray-200">
                            {student.applications} apps
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button onClick={() => setActiveTab('students')} className="text-sm text-gray-900 font-medium hover:underline">
                      View All Students →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">Approval Requests</h2>
                  </div>
                  <span className="text-sm text-gray-600">{approvalRequests.length} pending</span>
                </div>

                <div className="space-y-4">
                  {approvalRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-300 p-6 hover:border-gray-900 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <img src={request.studentAvatar} alt={request.student} className="h-12 w-12 border border-gray-300" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{request.student}</h3>
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                {request.type === 'placement' ? 'Placement' : 'Event'}
                              </span>
                            </div>
                            <p className="text-base font-medium text-gray-900 mb-2">
                              {request.type === 'placement' ? `${request.company} - ${request.position}` : request.title}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Applied: {request.appliedDate}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => openApprovalModal(request)}
                          className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all text-sm"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Students Info Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">My Students</h2>
                  </div>
                  <span className="text-sm text-gray-600">{students.length} students</span>
                </div>

                <div className="space-y-4">
                  {students.map((student, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 p-6 hover:border-gray-900 transition-all"
                    >
                      <div className="flex items-start space-x-4">
                        <img src={student.avatar} alt={student.name} className="h-16 w-16 border border-gray-300" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                              <p className="text-sm text-gray-600">{student.rollNo} • {student.department}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">GPA: {student.gpa}</p>
                              <p className="text-xs text-gray-600">{student.year}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                            <div>
                              <p className="text-gray-600"><strong>Email:</strong> {student.email}</p>
                              <p className="text-gray-600"><strong>Phone:</strong> {student.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600"><strong>Applications:</strong> {student.applications}</p>
                              <p className="text-gray-600"><strong>Skills:</strong> {student.skills}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <a href={`https://${student.linkedin}`} className="hover:text-gray-900">LinkedIn →</a>
                            <a href={`https://${student.github}`} className="hover:text-gray-900">GitHub →</a>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm">
                              Schedule Meeting
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm">
                              Send Message
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Placements Tab */}
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
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mails Tab */}
          {activeTab === 'mails' && (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm">
                    Compose
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {mails.map((mail, idx) => (
                  <div
                    key={idx}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      mail.unread ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className={`font-medium ${mail.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {mail.from}
                          </p>
                          {mail.important && (
                            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 border border-gray-200">
                              Important
                            </span>
                          )}
                          {mail.unread && (
                            <span className="bg-gray-900 text-white text-xs font-medium px-2 py-1">
                              New
                            </span>
                          )}
                        </div>
                        <h3 className={`text-sm mb-1 ${mail.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {mail.subject}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{mail.time}</span>
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
