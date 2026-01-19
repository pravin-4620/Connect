import express from 'express';
import { upload } from '../middleware/upload.js';
import {
    getDashboard,
    updateProfile,
    getProfile, // Import getProfile
    getPlacements,
    applyForPlacement,
    getEvents,
    registerForEvent,
    getAssignments,
    submitAssignment,
    getStudyMaterials,
    getSkillsTests,
    attemptTest,
    analyzeResume,
    getEmails,
    applyForGatePass,
    getGatePasses,
    getSettings,
    updateSettings,
    uploadEventCertificate,
    getAttendance
} from '../controllers/student.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { checkMaintenanceMode } from '../middleware/maintenance.js';

const router = express.Router();


// All routes require authentication and STUDENT role
router.use(authenticate);
router.use(requireRole('STUDENT'));
router.use(checkMaintenanceMode);

// Dashboard
router.get('/dashboard', getDashboard);

// Profile
router.get('/profile', getProfile); // Add GET route
router.put('/profile', updateProfile);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Placements
router.get('/placements', getPlacements);
router.post('/placements/:placementId/apply', applyForPlacement);

// Events
router.get('/events', getEvents);
router.post('/events/:eventId/register', registerForEvent);
router.post('/events/:eventId/certificate', uploadEventCertificate);

// Attendance
router.get('/attendance', getAttendance);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments/:assignmentId/submit', upload.single('file'), submitAssignment);

// Study Materials
router.get('/study-materials', getStudyMaterials);

// Skills Tests
router.get('/skills-tests', getSkillsTests);
router.post('/skills-tests/:testId/attempt', attemptTest);

// Resume Analysis
router.post('/resume/analyze', upload.single('resume'), analyzeResume);

// Emails
router.get('/emails', getEmails);

// Gate Pass
router.post('/gate-pass', applyForGatePass);
router.get('/gate-passes', getGatePasses);

export default router;
