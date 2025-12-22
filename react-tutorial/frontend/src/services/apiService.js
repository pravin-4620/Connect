// API Service - Handles all backend communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests with auth
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ==================== AUTHENTICATION ====================

// Register new user
export const register = async (userData) => {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  // Save token and user info
  if (data.success) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

// Login user
export const login = async (email, password) => {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save token and user info
    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  } catch (error) {
    // Return error in a consistent format
    return {
      success: false,
      message: error.message || 'Invalid email or password'
    };
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  return await apiRequest('/auth/me');
};

// Logout user
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Check if user is logged in
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Get stored user info
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      console.log('No user in localStorage');
      return null;
    }
    const parsedUser = JSON.parse(user);
    console.log('Retrieved user from localStorage:', parsedUser);
    return parsedUser;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  return await apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
};

// Update user info in localStorage (after password change or profile completion)
export const updateStoredUser = (updates) => {
  const user = getStoredUser();
  if (user) {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
  return null;
};

// Update user profile (photo, phone, department)
export const updateUserProfile = async (profileData) => {
  const data = await apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  
  // Update local storage
  if (data.success && data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

// ==================== STUDENTS ====================

// Get all students (mentor/placement/admin only)
export const getStudents = async () => {
  return await apiRequest('/students');
};

// Get single student by ID
export const getStudent = async (id) => {
  return await apiRequest(`/students/${id}`);
};

// Create student profile
export const createStudent = async (studentData) => {
  return await apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
};

// Update student profile
export const updateStudent = async (id, studentData) => {
  return await apiRequest(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
};

// Delete student profile
export const deleteStudent = async (id) => {
  return await apiRequest(`/students/${id}`, {
    method: 'DELETE',
  });
};

// ==================== COMPANIES ====================

// Get all companies
export const getCompanies = async () => {
  return await apiRequest('/companies');
};

// Get single company by ID
export const getCompany = async (id) => {
  return await apiRequest(`/companies/${id}`);
};

// Create company
export const createCompany = async (companyData) => {
  return await apiRequest('/companies', {
    method: 'POST',
    body: JSON.stringify(companyData),
  });
};

// Update company
export const updateCompany = async (id, companyData) => {
  return await apiRequest(`/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(companyData),
  });
};

// Delete company
export const deleteCompany = async (id) => {
  return await apiRequest(`/companies/${id}`, {
    method: 'DELETE',
  });
};

// ==================== JOBS ====================

// Get all jobs (with optional filters)
export const getJobs = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/jobs?${queryParams}` : '/jobs';
  return await apiRequest(endpoint);
};

// Get single job by ID
export const getJob = async (id) => {
  return await apiRequest(`/jobs/${id}`);
};

// Create job posting
export const createJob = async (jobData) => {
  return await apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
};

// Apply to a job
export const applyToJob = async (jobId, studentId) => {
  return await apiRequest(`/jobs/${jobId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ studentId }),
  });
};

// Update job posting
export const updateJob = async (id, jobData) => {
  return await apiRequest(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  });
};

// Delete job posting
export const deleteJob = async (id) => {
  return await apiRequest(`/jobs/${id}`, {
    method: 'DELETE',
  });
};

const apiService = {
  // Auth
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  
  // Students
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  
  // Companies
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  
  // Jobs
  getJobs,
  getJob,
  createJob,
  applyToJob,
  updateJob,
  deleteJob,
  
  // Placements
  getPlacements: async () => await apiRequest('/placements'),
  getPlacement: async (id) => await apiRequest(`/placements/${id}`),
  createPlacement: async (data) => await apiRequest('/placements', { method: 'POST', body: JSON.stringify(data) }),
  updatePlacement: async (id, data) => await apiRequest(`/placements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlacement: async (id) => await apiRequest(`/placements/${id}`, { method: 'DELETE' }),
  applyForPlacement: async (id, reason) => await apiRequest(`/placements/${id}/apply`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getMyApplications: async () => await apiRequest('/placements/applications/my'),
  getAllApplications: async () => await apiRequest('/placements/applications'),
  
  // Events
  getEvents: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/events${params ? '?' + params : ''}`);
  },
  getEvent: async (id) => await apiRequest(`/events/${id}`),
  createEvent: async (data) => await apiRequest('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: async (id, data) => await apiRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: async (id) => await apiRequest(`/events/${id}`, { method: 'DELETE' }),
  registerForEvent: async (id, reason) => await apiRequest(`/events/${id}/register`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getMyEventRegistrations: async () => await apiRequest('/events/registrations/my'),
  unregisterFromEvent: async (id) => await apiRequest(`/events/${id}/unregister`, { method: 'DELETE' }),
  
  // Approvals
  getPendingApprovals: async () => await apiRequest('/approvals'),
  getApproval: async (id) => await apiRequest(`/approvals/${id}`),
  approveRequest: async (id, comments) => await apiRequest(`/approvals/${id}/approve`, { method: 'PUT', body: JSON.stringify({ comments }) }),
  rejectRequest: async (id, comments) => await apiRequest(`/approvals/${id}/reject`, { method: 'PUT', body: JSON.stringify({ comments }) }),
  
  // Mentor Assignments
  assignMentor: async (data) => await apiRequest('/mentor-assignments', { method: 'POST', body: JSON.stringify(data) }),
  getMyStudents: async () => await apiRequest('/mentor-assignments/my-students'),
  getMentorForStudent: async (studentId) => await apiRequest(`/mentor-assignments/${studentId}`),
  updateMentorAssignment: async (id, data) => await apiRequest(`/mentor-assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeMentorAssignment: async (id) => await apiRequest(`/mentor-assignments/${id}`, { method: 'DELETE' }),
  getMentors: async () => await apiRequest('/mentor-assignments/mentors'),
  
  // Placement Drives
  getDrives: async (status) => {
    const params = status ? `?status=${status}` : '';
    return await apiRequest(`/companies/drives${params}`);
  },
  getDrive: async (id) => await apiRequest(`/companies/drives/${id}`),
  createDrive: async (data) => await apiRequest('/companies/drives', { method: 'POST', body: JSON.stringify(data) }),
  updateDrive: async (id, data) => await apiRequest(`/companies/drives/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDrive: async (id) => await apiRequest(`/companies/drives/${id}`, { method: 'DELETE' }),
  
  // Assignments
  getAssignments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/assignments${params ? '?' + params : ''}`);
  },
  getAssignment: async (id) => await apiRequest(`/assignments/${id}`),
  createAssignment: async (data) => await apiRequest('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateAssignment: async (id, data) => await apiRequest(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAssignment: async (id) => await apiRequest(`/assignments/${id}`, { method: 'DELETE' }),
  
  // Study Resources
  getResources: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await apiRequest(`/assignments/resources${params ? '?' + params : ''}`);
  },
  getResource: async (id) => await apiRequest(`/assignments/resources/${id}`),
  uploadResource: async (data) => await apiRequest('/assignments/resources', { method: 'POST', body: JSON.stringify(data) }),
  approveResource: async (id) => await apiRequest(`/assignments/resources/${id}/approve`, { method: 'PUT' }),
  rateResource: async (id, rating) => await apiRequest(`/assignments/resources/${id}/rate`, { method: 'PUT', body: JSON.stringify({ rating }) }),
  deleteResource: async (id) => await apiRequest(`/assignments/resources/${id}`, { method: 'DELETE' }),

  // File Uploads
  uploadProfilePhoto: async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload photo');
    }
    
    // Update local storage with new photo
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && data.data) {
      user.photo = data.data.photoUrl;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return data;
  },

  uploadResume: async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload resume');
    }
    return data;
  },

  submitAssignment: async (assignmentId, file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('assignment', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/assignment/${assignmentId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit assignment');
    }
    return data;
  },

  uploadStudyResource: async (file, metadata) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('resource', file);
    formData.append('title', metadata.title);
    formData.append('subject', metadata.subject);
    formData.append('description', metadata.description || '');
    formData.append('resourceType', metadata.resourceType || 'Notes');
    
    const response = await fetch(`${API_BASE_URL}/upload/resource`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload resource');
    }
    return data;
  },

  removeProfilePhoto: async () => {
    return await apiRequest('/upload/profile-photo', { method: 'DELETE' });
  },

  // Get student profile
  getMyProfile: async () => await apiRequest('/students/me'),
  updateMyProfile: async (data) => await apiRequest('/students/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Messaging API
  getContacts: async () => await apiRequest('/messages/contacts'),
  getConversation: async (userId, page = 1) => await apiRequest(`/messages/conversation/${userId}?page=${page}`),
  sendMessage: async (receiverId, content, messageType = 'text') => {
    return await apiRequest('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, messageType })
    });
  },
  markMessagesAsRead: async (conversationId) => {
    return await apiRequest(`/messages/read/${conversationId}`, { method: 'PUT' });
  },
  getUnreadCount: async () => await apiRequest('/messages/unread-count'),
  deleteMessage: async (messageId) => await apiRequest(`/messages/${messageId}`, { method: 'DELETE' }),
};

export default apiService;
