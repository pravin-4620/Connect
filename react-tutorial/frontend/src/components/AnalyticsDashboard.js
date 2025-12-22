import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const AnalyticsDashboard = ({ onClose }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    dashboard: null,
    placements: null,
    students: null,
    trends: null,
    interviews: null,
    assessments: null
  });

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [dashboardRes, placementsRes, studentsRes, trendsRes, interviewsRes] = await Promise.all([
        fetch('http://localhost:5001/api/analytics/dashboard', { headers }),
        fetch('http://localhost:5001/api/analytics/placements', { headers }),
        fetch('http://localhost:5001/api/analytics/students', { headers }),
        fetch('http://localhost:5001/api/analytics/trends', { headers }),
        fetch('http://localhost:5001/api/analytics/interviews', { headers })
      ]);

      const dashboard = dashboardRes.ok ? await dashboardRes.json() : null;
      const placements = placementsRes.ok ? await placementsRes.json() : null;
      const students = studentsRes.ok ? await studentsRes.json() : null;
      const trends = trendsRes.ok ? await trendsRes.json() : null;
      const interviews = interviewsRes.ok ? await interviewsRes.json() : null;

      setData({ dashboard, placements, students, trends, interviews });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value?.toLocaleString('en-IN') || 0}`;
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`p-6 rounded-none ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-none ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'placements', label: 'Placements', icon: '💼' },
    { id: 'students', label: 'Students', icon: '👨‍🎓' },
    { id: 'interviews', label: 'Interviews', icon: '🎯' },
    { id: 'trends', label: 'Trends', icon: '📈' }
  ];

  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className={`mt-4 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Analytics Dashboard</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Placement insights & statistics</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-none transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-none font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && data.dashboard && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={data.dashboard.students?.total || 0}
                subtitle={`${data.dashboard.students?.placementRate || 0}% placed`}
                color="bg-purple-100"
                icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              />
              <StatCard
                title="Total Placements"
                value={data.dashboard.placements?.total || 0}
                subtitle={`${data.dashboard.placements?.activeDrives || 0} active drives`}
                color="bg-cyan-100"
                icon={<svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              />
              <StatCard
                title="Companies"
                value={data.dashboard.companies?.total || 0}
                subtitle={`${data.dashboard.companies?.active || 0} active`}
                color="bg-green-100"
                icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              />
              <StatCard
                title="Upcoming Interviews"
                value={data.dashboard.interviews?.upcoming || 0}
                subtitle={`${data.dashboard.interviews?.total || 0} total`}
                color="bg-amber-100"
                icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placement Status Pie */}
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Placement Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Placed', value: data.dashboard.students?.placed || 0 },
                        { name: 'Not Placed', value: (data.dashboard.students?.total || 0) - (data.dashboard.students?.placed || 0) }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Department Distribution */}
              {data.students?.byDepartment && (
                <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Students by Department</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.students.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                      <XAxis dataKey="_id" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                      <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placements Tab */}
        {activeTab === 'placements' && data.placements && (
          <div className="space-y-6">
            {/* Placement Stats */}
            {data.placements.overallStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Placements"
                  value={data.placements.overallStats.totalPlacements || 0}
                  color="bg-purple-100"
                  icon={<svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>}
                />
                <StatCard
                  title="Average Package"
                  value={formatCurrency(data.placements.overallStats.avgPackage)}
                  color="bg-green-100"
                  icon={<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>}
                />
                <StatCard
                  title="Highest Package"
                  value={formatCurrency(data.placements.overallStats.maxPackage)}
                  color="bg-cyan-100"
                  icon={<svg className="w-6 h-6 text-cyan-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>}
                />
                <StatCard
                  title="Lowest Package"
                  value={formatCurrency(data.placements.overallStats.minPackage)}
                  color="bg-amber-100"
                  icon={<svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd"/></svg>}
                />
              </div>
            )}

            {/* Monthly Placements */}
            {data.placements.monthlyPlacements?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Monthly Placements</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data.placements.monthlyPlacements.map(m => ({
                    name: `${getMonthName(m._id.month)} ${m._id.year}`,
                    placements: m.count,
                    avgPackage: m.avgPackage
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="placements" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Companies */}
            {data.placements.topCompanies?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Recruiting Companies</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.placements.topCompanies} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis type="number" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis dataKey="_id" type="category" width={120} tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="placements" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Department Placements */}
            {data.placements.departmentPlacements?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Placements by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.placements.departmentPlacements}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="_id"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.placements.departmentPlacements.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && data.students && (
          <div className="space-y-6">
            {/* CGPA Distribution */}
            {data.students.cgpaDistribution?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>CGPA Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.students.cgpaDistribution.map(d => ({
                    range: d._id === 0 ? '0-5' : d._id === 5 ? '5-6' : d._id === 6 ? '6-7' : d._id === 7 ? '7-8' : d._id === 8 ? '8-9' : '9-10',
                    count: d.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="range" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Skills Distribution */}
            {data.students.skillsDistribution?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Top Skills</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.students.skillsDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis type="number" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis dataKey="_id" type="category" width={100} tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Batch Distribution */}
            {data.students.byBatch?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Students by Batch</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.students.byBatch}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="_id" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="total" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && data.interviews && (
          <div className="space-y-6">
            {/* Interview Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Status Distribution */}
              {data.interviews.statusDistribution?.length > 0 && (
                <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Interview Status</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.interviews.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {data.interviews.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Results Distribution */}
              {data.interviews.resultDistribution?.length > 0 && (
                <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Interview Results</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.interviews.resultDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {data.interviews.resultDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry._id === 'Selected' ? '#10B981' : entry._id === 'Rejected' ? '#EF4444' : COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Interview Types */}
              {data.interviews.byType?.length > 0 && (
                <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Interview Types</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.interviews.byType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="_id"
                      >
                        {data.interviews.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Company Success Rate */}
            {data.interviews.companySuccessRate?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Company Interview Success Rate</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.interviews.companySuccessRate}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="_id" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total Interviews" fill="#8B5CF6" />
                    <Bar dataKey="selected" name="Selected" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && data.trends && (
          <div className="space-y-6">
            {/* Yearly Trends */}
            {data.trends.yearlyTrends?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Yearly Placement Trends</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data.trends.yearlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="_id" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis yAxisId="left" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="placements" name="Placements" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6' }} />
                    <Line yAxisId="right" type="monotone" dataKey="avgPackage" name="Avg Package" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Company Participation */}
            {data.trends.companyTrends?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Company Participation Trends</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data.trends.companyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="_id" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="drives" name="Placement Drives" fill="#06B6D4" />
                    <Bar dataKey="uniqueCompanies" name="Unique Companies" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Conversion Rate */}
            {data.trends.conversionTrends?.length > 0 && (
              <div className={`p-6 rounded-none ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Application Conversion Rate</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data.trends.conversionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="_id" tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <YAxis tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="conversionRate" name="Conversion Rate (%)" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
