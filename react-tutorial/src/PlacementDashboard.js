import React, { useState } from 'react';
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
  PieChart
} from 'lucide-react';

const PlacementDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample Data
  const stats = [
    { label: 'Total Students', value: '450', change: '+12', icon: Users, color: 'gray' },
    { label: 'Active Drives', value: '38', change: '+5', icon: Briefcase, color: 'gray' },
    { label: 'Placement Rate', value: '87%', change: '+3%', icon: TrendingUp, color: 'gray' },
    { label: 'Partner Companies', value: '64', change: '+8', icon: Building2, color: 'gray' }
  ];

  const companies = [
    {
      id: 1,
      name: 'Google India',
      logo: '🔍',
      industry: 'Technology',
      location: 'Bangalore',
      employeeCount: '5000+',
      website: 'google.co.in',
      contact: 'hr@google.com',
      phone: '+91 80 6749 6000',
      status: 'Active',
      offersCount: 5,
      hiringRoles: 'SWE, Product Manager, Data Analyst'
    },
    {
      id: 2,
      name: 'Microsoft',
      logo: '🪟',
      industry: 'Technology',
      location: 'Hyderabad',
      employeeCount: '8000+',
      website: 'microsoft.com/india',
      contact: 'careers@microsoft.com',
      phone: '+91 40 6737 2000',
      status: 'Active',
      offersCount: 8,
      hiringRoles: 'Cloud Engineer, SDE, Business Analyst'
    },
    {
      id: 3,
      name: 'Amazon',
      logo: '📦',
      industry: 'E-commerce & Cloud',
      location: 'Mumbai',
      employeeCount: '10000+',
      website: 'amazon.in',
      contact: 'recruiting@amazon.in',
      phone: '+91 22 6178 6000',
      status: 'Active',
      offersCount: 12,
      hiringRoles: 'SDE, Operations Manager, Supply Chain'
    },
    {
      id: 4,
      name: 'TCS',
      logo: '💼',
      industry: 'IT Services',
      location: 'Pan India',
      employeeCount: '50000+',
      website: 'tcs.com',
      contact: 'recruitment@tcs.com',
      phone: '+91 22 6778 9999',
      status: 'Active',
      offersCount: 50,
      hiringRoles: 'Software Engineer, Consultant, Analyst'
    },
    {
      id: 5,
      name: 'Infosys',
      logo: '🏢',
      industry: 'IT Services',
      location: 'Bangalore',
      employeeCount: '40000+',
      website: 'infosys.com',
      contact: 'careers@infosys.com',
      phone: '+91 80 2852 0261',
      status: 'Active',
      offersCount: 45,
      hiringRoles: 'Developer, System Engineer, Tester'
    }
  ];

  const placementDrives = [
    {
      id: 1,
      company: 'Google India',
      logo: '🔍',
      date: 'Nov 15, 2025',
      time: '10:00 AM',
      type: 'On-Campus',
      mode: 'Hybrid',
      roles: ['Software Engineer', 'Product Manager'],
      package: '₹18-25 LPA',
      eligibility: 'B.Tech (CS/IT), CGPA ≥ 8.0',
      deadline: 'Nov 10, 2025',
      registered: 85,
      shortlisted: 45,
      status: 'Upcoming'
    },
    {
      id: 2,
      company: 'Microsoft',
      logo: '🪟',
      date: 'Nov 20, 2025',
      time: '2:00 PM',
      type: 'Virtual',
      mode: 'Online',
      roles: ['SDE', 'Cloud Engineer'],
      package: '₹16-22 LPA',
      eligibility: 'B.Tech (All branches), CGPA ≥ 7.5',
      deadline: 'Nov 15, 2025',
      registered: 120,
      shortlisted: 60,
      status: 'Upcoming'
    },
    {
      id: 3,
      company: 'Amazon',
      logo: '�',
      date: 'Nov 25, 2025',
      time: '11:00 AM',
      type: 'On-Campus',
      mode: 'In-Person',
      roles: ['SDE Intern', 'Operations Manager'],
      package: '₹15-20 LPA',
      eligibility: 'B.Tech (All), CGPA ≥ 7.0',
      deadline: 'Nov 20, 2025',
      registered: 95,
      shortlisted: 50,
      status: 'Upcoming'
    },
    {
      id: 4,
      company: 'TCS',
      logo: '💼',
      date: 'Oct 15, 2025',
      time: '9:00 AM',
      type: 'On-Campus',
      mode: 'In-Person',
      roles: ['Software Engineer', 'Consultant'],
      package: '₹3.5-7 LPA',
      eligibility: 'All branches, CGPA ≥ 6.0',
      deadline: 'Oct 10, 2025',
      registered: 250,
      shortlisted: 180,
      status: 'Completed'
    }
  ];

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
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
              <Building2 className="h-6 w-6 text-white" />
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
              { id: 'companies', label: 'Companies', icon: Building2 },
              { id: 'drives', label: 'Placement Drives', icon: Calendar },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'analytics', label: 'Reports & Analytics', icon: PieChart },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
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
                src="https://randomuser.me/api/portraits/men/65.jpg"
                alt="Profile"
                className="h-10 w-10 border border-gray-300"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">Dr. Rajesh Kumar</p>
                <p className="text-xs text-gray-600">Placement Officer</p>
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
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Placement Officer Portal</h1>
                <p className="text-gray-600 text-xs md:text-sm mt-1 hidden sm:block">Welcome back, Dr. Rajesh Kumar</p>
              </div>
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

              {/* Quick Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-900">Recent Placement Drives</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {placementDrives.slice(0, 3).map((drive) => (
                      <div key={drive.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-2xl">{drive.logo}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{drive.company}</p>
                            <p className="text-xs text-gray-600">{drive.date} • {drive.time}</p>
                          </div>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 border border-gray-200">
                            {drive.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button onClick={() => setActiveTab('drives')} className="text-sm text-gray-900 font-medium hover:underline">
                      View All Drives →
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-base font-semibold text-gray-900">Top Companies</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {companies.slice(0, 3).map((company) => (
                      <div key={company.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{company.logo}</div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                            <p className="text-xs text-gray-600">{company.industry} • {company.location}</p>
                          </div>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 border border-gray-200">
                            {company.offersCount} roles
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <button onClick={() => setActiveTab('companies')} className="text-sm text-gray-900 font-medium hover:underline">
                      View All Companies →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Companies Tab - TO BE ADDED */}
          {activeTab === 'companies' && (
            <div className="text-gray-600">Companies tab content coming soon...</div>
          )}

          {/* Drives Tab - TO BE ADDED */}
          {activeTab === 'drives' && (
            <div className="text-gray-600">Drives tab content coming soon...</div>
          )}

          {/* Students Tab - TO BE ADDED */}
          {activeTab === 'students' && (
            <div className="text-gray-600">Students tab content coming soon...</div>
          )}

          {/* Applications Tab - TO BE ADDED */}
          {activeTab === 'applications' && (
            <div className="text-gray-600">Applications tab content coming soon...</div>
          )}

          {/* Analytics Tab - TO BE ADDED */}
          {activeTab === 'analytics' && (
            <div className="text-gray-600">Analytics tab content coming soon...</div>
          )}

          {/* Announcements Tab - TO BE ADDED */}
          {activeTab === 'announcements' && (
            <div className="text-gray-600">Announcements tab content coming soon...</div>
          )}

          {/* Mails Tab - TO BE ADDED */}
          {activeTab === 'mails' && (
            <div className="text-gray-600">Mails tab content coming soon...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacementDashboard;
