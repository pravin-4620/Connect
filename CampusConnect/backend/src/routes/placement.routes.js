import express from 'express';
import {
    getDashboard,
    createPlacementDrive,
    updatePlacementDrive,
    getPlacementDrives,
    getStudents,
    scheduleInterview,
    updateInterview,
    getInterviews,
    createSkillsTest,
    getSkillsTests,
    getAnalytics,
    createAnnouncement,
    getAnnouncements,
    updateApplicationStatus,
    getEmails,
    getSettings,
    updateSettings,
    updateProfile,
    deletePlacementDrive,
    deleteAnnouncement,
    deleteInterview
} from '../controllers/placement.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { checkMaintenanceMode } from '../middleware/maintenance.js';

const router = express.Router();

// All routes require authentication and PLACEMENT_OFFICER role
router.use(authenticate);
router.use(requireRole('PLACEMENT_OFFICER'));
router.use(checkMaintenanceMode);

// Dashboard
router.get('/dashboard', getDashboard);

// Placement Drives
router.get('/drives', getPlacementDrives);
router.post('/drives', createPlacementDrive);
router.put('/drives/:placementId', updatePlacementDrive);
router.delete('/drives/:placementId', deletePlacementDrive);

// Applications
router.put('/applications/:applicationId/status', updateApplicationStatus);

// Students
router.get('/students', getStudents);

// Interviews
router.get('/interviews', getInterviews);
router.post('/interviews', scheduleInterview);
router.put('/interviews/:interviewId', updateInterview);
router.delete('/interviews/:interviewId', deleteInterview);

// Skills Tests
router.get('/skills-tests', getSkillsTests);
router.post('/skills-tests', createSkillsTest);

// Analytics
router.get('/analytics', getAnalytics);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:announcementId', deleteAnnouncement);

// Mails
router.get('/emails', getEmails);

// Profile & Settings
router.put('/profile', updateProfile);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
