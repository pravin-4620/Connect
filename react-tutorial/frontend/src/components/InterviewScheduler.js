import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const InterviewScheduler = ({ onClose, student = null, placement = null }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student: student?._id || '',
    placement: placement?._id || '',
    company: placement?.company || '',
    role: placement?.position || '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    interviewType: 'Technical',
    mode: 'Virtual',
    venue: '',
    meetingLink: '',
    interviewers: '',
    round: 1,
    instructions: ''
  });

  const interviewTypes = ['Technical', 'HR', 'Managerial', 'Group Discussion', 'Aptitude', 'Final'];
  const modes = ['Virtual', 'In-Person', 'Phone'];

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/interviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const fetchStudents = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
    if (!student) fetchStudents();
  }, [student, fetchStudents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        interviewers: formData.interviewers ? formData.interviewers.split(',').map(i => i.trim()) : []
      };

      const response = await fetch('http://localhost:5001/api/interviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert('Interview scheduled successfully!');
        setFormData({
          student: '',
          placement: '',
          company: '',
          role: '',
          scheduledDate: '',
          scheduledTime: '',
          duration: 60,
          interviewType: 'Technical',
          mode: 'Virtual',
          venue: '',
          meetingLink: '',
          interviewers: '',
          round: 1,
          instructions: ''
        });
        fetchInterviews();
        setActiveTab('list');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to schedule interview');
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const updateInterviewStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/interviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchInterviews();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const recordResult = async (id, result, feedback) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/interviews/${id}/result`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ result, feedback: { comments: feedback } })
      });

      if (response.ok) {
        alert('Result recorded successfully!');
        fetchInterviews();
      }
    } catch (error) {
      console.error('Error recording result:', error);
    }
  };

  const sendReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/interviews/send-reminders', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Completed': return 'bg-purple-100 text-purple-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      case 'Rescheduled': return 'bg-yellow-100 text-yellow-700';
      case 'No Show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Selected': return 'bg-green-500 text-white';
      case 'Rejected': return 'bg-red-500 text-white';
      case 'On Hold': return 'bg-yellow-500 text-white';
      case 'Next Round': return 'bg-blue-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
      <div className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-none shadow-2xl flex flex-col ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-none ${isDark ? 'bg-gray-700' : 'bg-gray-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Interview Scheduler</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Schedule and manage interviews</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={sendReminders}
              className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${isDark 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Send Reminders
            </button>
            <button onClick={onClose} className={`p-2 rounded-none transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'schedule' 
              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Schedule New
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'list' 
              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All Interviews ({interviews.length})
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${activeTab === 'today' 
              ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Today's Schedule
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Selection */}
                {!student && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Student *
                    </label>
                    <select
                      name="student"
                      value={formData.student}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 rounded-none border ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-800'}`}
                    >
                      <option value="">Select Student</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} - {s.department}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Company */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter company name"
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Software Engineer"
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date *
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                {/* Time */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time *
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration (minutes)
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                {/* Interview Type */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Interview Type
                  </label>
                  <select
                    name="interviewType"
                    value={formData.interviewType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    {interviewTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Mode */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mode
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    {modes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                {/* Round */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Round
                  </label>
                  <select
                    name="round"
                    value={formData.round}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'}`}
                  >
                    {[1, 2, 3, 4, 5].map(r => (
                      <option key={r} value={r}>Round {r}</option>
                    ))}
                  </select>
                </div>

                {/* Venue (for In-Person) */}
                {formData.mode === 'In-Person' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="Enter venue address"
                      className={`w-full px-3 py-2 rounded-none border ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                    />
                  </div>
                )}

                {/* Meeting Link (for Virtual) */}
                {formData.mode === 'Virtual' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://meet.google.com/..."
                      className={`w-full px-3 py-2 rounded-none border ${isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                    />
                  </div>
                )}

                {/* Interviewers */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Interviewers (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="interviewers"
                    value={formData.interviewers}
                    onChange={handleInputChange}
                    placeholder="John Doe, Jane Smith"
                    className={`w-full px-3 py-2 rounded-none border ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>

                {/* Instructions */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Instructions for Candidate
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special instructions..."
                    className={`w-full px-3 py-2 rounded-none border resize-none ${isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-none font-semibold text-white transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                }`}
              >
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </form>
          )}

          {/* List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {interviews.length > 0 ? (
                interviews.map(interview => (
                  <div
                    key={interview._id}
                    className={`p-4 rounded-none border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {interview.student?.name || 'Unknown Student'}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(interview.status)}`}>
                            {interview.status}
                          </span>
                          {interview.result && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getResultColor(interview.result)}`}>
                              {interview.result}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {interview.company} - {interview.role}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            📅 {new Date(interview.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            🕐 {interview.scheduledTime}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            ⏱️ {interview.duration} mins
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            🎯 {interview.interviewType}
                          </span>
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                            Round {interview.round}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => updateInterviewStatus(interview._id, 'Cancelled')}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-none hover:bg-red-200"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {interview.status === 'Completed' && !interview.result && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => recordResult(interview._id, 'Selected', '')}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Selected
                            </button>
                            <button
                              onClick={() => recordResult(interview._id, 'Rejected', '')}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Rejected
                            </button>
                            <button
                              onClick={() => recordResult(interview._id, 'Next Round', '')}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Next Round
                            </button>
                          </div>
                        )}
                        {(interview.status === 'Scheduled' || interview.status === 'Confirmed') && (
                          <button
                            onClick={() => updateInterviewStatus(interview._id, 'Completed')}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-none hover:bg-purple-200"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">No interviews scheduled</p>
                  <p className="text-sm mt-1">Schedule your first interview</p>
                </div>
              )}
            </div>
          )}

          {/* Today Tab */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              {interviews.filter(i => {
                const today = new Date().toDateString();
                return new Date(i.scheduledDate).toDateString() === today;
              }).length > 0 ? (
                interviews
                  .filter(i => new Date(i.scheduledDate).toDateString() === new Date().toDateString())
                  .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                  .map(interview => (
                    <div
                      key={interview._id}
                      className={`p-4 rounded-none border ${isDark ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {interview.scheduledTime}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {interview.duration} mins
                          </p>
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {interview.student?.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {interview.company} - {interview.role}
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {interview.interviewType} • {interview.mode} • Round {interview.round}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p className="text-lg font-medium">No interviews scheduled for today</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;
