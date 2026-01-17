import express from 'express';
import {
    createUser,
    getUsers,
    getUserById,
    createMapping,
    updateMapping,
    getStudentMappings,
    getMentors,
    getPlacementOfficers,
    updateUser,
    bulkAssignMentors,
    getSettings,
    updateSettings,
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
    exportUserData,
    getSystemLogs,
    deleteUser,
    getStatistics
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// User Management
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);
router.get('/users-export', exportUserData);

// Student Mappings
router.get('/mappings', getStudentMappings);
router.post('/mappings', createMapping);
router.put('/mappings/:mappingId', updateMapping);
router.post('/mappings/bulk-mentors', bulkAssignMentors);

// Get Mentors and Placement Officers
router.get('/mentors', getMentors);
router.get('/placement-officers', getPlacementOfficers);

// Statistics
router.get('/statistics', getStatistics);
router.get('/logs', getSystemLogs);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

export default router;
