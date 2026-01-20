import express from 'express';
import multer from 'multer';
import {
    getDashboard,
    getStudents,
    getStudentById,
    createEvent,
    updateEvent,
    deleteEvent,
    getApprovals,
    updateApproval,
    uploadMaterial,
    getStudyMaterials,
    createAssignment,
    gradeSubmission,
    getAssignments,
    getEvents,
    updateProfile,
    getSettings,
    updateSettings,
    getEmails,
    updateAttendance,
    markDailyAttendance,
    getAttendanceRecords,
    getBatchAttendance,
    markBulkAttendance
} from '../controllers/mentor.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { checkMaintenanceMode } from '../middleware/maintenance.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// All routes require authentication and MENTOR or CHIEF_MENTOR role
router.use(authenticate);
router.use(requireRole(['MENTOR', 'CHIEF_MENTOR']));
router.use(checkMaintenanceMode);

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.put('/profile', updateProfile);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Emails
router.get('/emails', getEmails);

// Students
router.get('/students', getStudents);
router.get('/students/:studentId', getStudentById);
router.put('/students/:studentId/attendance', updateAttendance);
router.post('/students/:studentId/attendance/daily', markDailyAttendance);
router.get('/students/:studentId/attendance/records', getAttendanceRecords);
router.get('/attendance/batch', getBatchAttendance);
router.post('/attendance/bulk', markBulkAttendance);

// Events
router.get('/events', getEvents);
router.post('/events', createEvent);
router.put('/events/:eventId', updateEvent);
router.delete('/events/:eventId', deleteEvent);

// Approvals
router.get('/approvals', getApprovals);
router.put('/approvals/:approvalId', updateApproval);

// Study Materials (MENTOR only)
router.get('/study-materials', requireRole('MENTOR'), getStudyMaterials);
router.post('/study-materials', requireRole('MENTOR'), upload.single('file'), uploadMaterial);

// Assignments (MENTOR only)
router.get('/assignments', requireRole('MENTOR'), getAssignments);
router.post('/assignments', requireRole('MENTOR'), createAssignment);
router.put('/assignments/:submissionId/grade', requireRole('MENTOR'), gradeSubmission);

export default router;
