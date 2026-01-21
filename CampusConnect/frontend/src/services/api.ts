/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { toast } from 'sonner';

// Get base URL from env, or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Only redirect/toast if not on login page (avoids loops and wrong password toasts)
                    if (!window.location.pathname.includes('/login')) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        toast.error('Session expired', { description: 'Please login again' });
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    toast.error('Access Denied', { description: 'You do not have permission to perform this action' });
                    break;
                case 404:
                    // 404s are often handled by components (e.g. empty lists), so we might skip global toast
                    // or toast a subtle warning
                    if (import.meta.env.MODE === 'development') {
                        toast.error('Resource Not Found', { description: `URL: ${error.config.url}` });
                    }
                    break;
                case 500:
                    toast.error('Server Error', { description: 'Please try again later' });
                    break;
                case 503:
                    // Maintenance Mode - Force Logout
                    toast.error('System Maintenance', { description: 'The system is currently under maintenance.' });
                    if (!window.location.pathname.includes('/login')) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1500); // Small delay to read toast
                    }
                    break;
                default:
                    // For validation errors (400) or others, we might want to show them
                    if (error.response.status !== 400) { // Let components handle 400 validations usually
                        toast.error('Error', { description: message });
                    }
            }
        } else if (error.request) {
            toast.error('Network Error', { description: 'Please check your internet connection' });
        } else {
            toast.error('Error', { description: message });
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    adminLogin: (credentials: any) => api.post('/auth/admin-login', credentials),
    logout: () => api.post('/auth/logout'),
    changePassword: (data: any) => api.post('/auth/change-password', data),
    getGmailAuthUrl: () => api.get('/auth/gmail-connect'),
    updateProfile: (data: any) => api.put('/auth/profile', data),
    handleGmailCallback: (code: string) => api.get(`/auth/gmail-callback?code=${code}`),
    getProfile: () => api.get('/auth/profile'),
};

export const studentAPI = {
    getDashboard: () => api.get('/student/dashboard'),
    getProfile: () => api.get('/student/profile'),
    updateProfile: (data: any) => api.put('/student/profile', data),
    getPlacements: (params?: any) => api.get('/student/placements', { params }),
    applyForPlacement: (id: string) => api.post(`/student/placements/${id}/apply`),
    getEvents: (params?: any) => api.get('/student/events', { params }), // Expects { filter: 'upcoming'|'registered'|'all' }
    registerForEvent: (id: string) => api.post(`/student/events/${id}/register`),
    getAssignments: (params?: any) => api.get('/student/assignments', { params }),
    submitAssignment: (id: string, formData: FormData) => api.post(`/student/assignments/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getStudyMaterials: (params?: any) => api.get('/student/study-materials', { params }),
    getSkillsTests: () => api.get('/student/skills-tests'),
    attemptTest: (id: string, data: any) => api.post(`/student/skills-tests/${id}/attempt`, data),
    analyzeResume: (formData: FormData) => api.post('/student/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getEmails: (category?: string) => api.get('/student/emails', { params: { category } }),
    getGatePasses: () => api.get('/student/gate-passes'),
    applyForGatePass: (data: any) => api.post('/student/gate-pass', data),
    getSettings: () => api.get('/student/settings'),
    updateSettings: (data: any) => api.put('/student/settings', data),
    getAttendance: () => api.get('/student/attendance'),
    submitTest: (testId: string, answers: any[]) => api.post(`/student/skills-tests/${testId}/attempt`, { answers }),
};

export const mentorAPI = {
    getDashboard: () => api.get('/mentor/dashboard'),
    getStudents: (params?: any) => api.get('/mentor/students', { params }),
    getStudentDetail: (id: string) => api.get(`/mentor/students/${id}`),
    getEvents: () => api.get('/mentor/events'), // Get created events
    createEvent: (data: any) => api.post('/mentor/events', data),
    updateEvent: (id: string, data: any) => api.put(`/mentor/events/${id}`, data),
    deleteEvent: (id: string) => api.delete(`/mentor/events/${id}`),
    getApprovals: (params?: any) => api.get('/mentor/approvals', { params }),
    updateApproval: (id: string, data: any) => api.put(`/mentor/approvals/${id}`, data),
    // Additional generic methods implied by prompt
    getAssignments: () => api.get('/mentor/assignments'),
    createAssignment: (data: any) => api.post('/mentor/assignments', data),
    gradeSubmission: (id: string, data: any) => api.put(`/mentor/assignments/${id}/grade`, data),
    getStudyMaterials: () => api.get('/mentor/study-materials'),
    uploadStudyMaterial: (formData: FormData) => api.post('/mentor/study-materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateProfile: (data: any) => api.put('/mentor/profile', data),
    getSettings: () => api.get('/mentor/settings'),
    updateSettings: (data: any) => api.put('/mentor/settings', data),
    getEmails: (category?: string) => api.get('/mentor/emails', { params: { category } }),
    updateAttendance: (studentId: string, attendance: number) => api.put(`/mentor/students/${studentId}/attendance`, { attendance }),
    markDailyAttendance: (studentId: string, status: string, date?: Date) =>
        api.post(`/mentor/students/${studentId}/attendance/daily`, { status, date }),
    getAttendanceRecords: (studentId: string) =>
        api.get(`/mentor/students/${studentId}/attendance/records`),
    getBatchAttendance: (date: string) =>
        api.get('/mentor/attendance/batch', { params: { date } }),
    markBulkAttendance: (data: { date: string, records: { studentId: string, status: string }[] }) =>
        api.post('/mentor/attendance/bulk', data),
};

export const placementAPI = {
    getDashboard: () => api.get('/placement/dashboard'),
    getDrives: () => api.get('/placement/drives'),
    createDrive: (data: any) => api.post('/placement/drives', data),
    updateDrive: (id: string, data: any) => api.put(`/placement/drives/${id}`, data),
    getStudents: (params?: any) => api.get('/placement/students', { params }),
    getInterviews: () => api.get('/placement/interviews'),
    scheduleInterview: (data: any) => api.post('/placement/interviews', data),
    updateInterview: (id: string, data: any) => api.put(`/placement/interviews/${id}`, data),
    createSkillsTest: (data: any) => api.post('/placement/skills-tests', data),
    getAnalytics: (params?: any) => api.get('/placement/analytics', { params }),
    createAnnouncement: (data: any) => api.post('/placement/announcements', data),
    getAnnouncements: () => api.get('/placement/announcements'),
    updateApplicationStatus: (id: string, status: string) => api.put(`/placement/applications/${id}/status`, { status }),
    getEmails: () => api.get('/placement/emails'),
    updateProfile: (data: any) => api.put('/placement/profile', data),
    getSettings: () => api.get('/placement/settings'),
    updateSettings: (data: any) => api.put('/placement/settings', data),
    getSkillsTests: () => api.get('/placement/skills-tests'),
    deleteDrive: (id: string) => api.delete(`/placement/drives/${id}`),
    deleteInterview: (id: string) => api.delete(`/placement/interviews/${id}`),
    deleteAnnouncement: (id: string) => api.delete(`/placement/announcements/${id}`),
};

export const adminAPI = {
    getDashboard: () => api.get('/admin/statistics'),
    getStatistics: () => api.get('/admin/statistics'),
    getUsers: (params?: any) => api.get('/admin/users', { params }),
    createUser: (data: any) => api.post('/admin/users', data),
    updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
    createMapping: (data: any) => api.post('/admin/mappings', data),
    createMentorMapping: (data: any) => api.post('/admin/mappings/mentor', data),
    bulkAssignMentors: (assignments: { studentId: string, mentorId: string }[]) => api.post('/admin/mappings/bulk-mentors', { assignments }),
    getSettings: () => api.get('/admin/settings'),
    updateSettings: (data: any) => api.put('/admin/settings', data),
    getAnnouncements: (params?: any) => api.get('/admin/announcements', { params }),
    createAnnouncement: (data: any) => api.post('/admin/announcements', data),
    deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
    exportUserData: () => api.get('/admin/users-export'),
    exportUsersExcel: () => api.get('/admin/users-export-excel', { responseType: 'blob' }),
    getSystemLogs: () => api.get('/admin/logs'),
    toggleBlockUser: (id: string, isBlocked: boolean) => api.put(`/admin/users/${id}/block`, { isBlocked }),
    resetUserPassword: (id: string) => api.post(`/admin/users/${id}/reset-password`),
    getChats: () => api.get('/admin/chats'),
    archiveAnnouncement: (id: string) => api.put(`/admin/announcements/${id}/archive`),
};

export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getMessages: (conversationId: string) => api.get(`/chat/messages/${conversationId}`),
    sendMessage: (receiverId: string, content: string, attachmentUrl?: string, attachmentType?: string) =>
        api.post('/chat/messages', { receiverId, content, attachmentUrl, attachmentType }),
    getPartners: () => api.get('/chat/partners'),
    getUnreadCount: () => api.get('/chat/unread'),
    markAsRead: (senderId: string) => api.post(`/chat/messages/${senderId}/read`),
    deleteConversation: (partnerId: string) => api.delete(`/chat/conversations/${partnerId}`),
};

export const commonAPI = {
    uploadFile: (formData: FormData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
