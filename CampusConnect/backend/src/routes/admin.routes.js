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
    getStatistics,
    toggleBlockUser,
    exportUsersExcel,
    getAdminChats,
    archiveAnnouncement
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and ADMIN or SUB_ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN', 'SUB_ADMIN']));

// User Management
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.put('/users/:userId/block', toggleBlockUser);
router.delete('/users/:userId', requireRole('ADMIN'), deleteUser); // Restricted
router.get('/users-export', exportUserData);
router.get('/users-export-excel', exportUsersExcel);

// Student Mappings
// ...
// Settings
router.get('/settings', getSettings);
router.put('/settings', requireRole('ADMIN'), updateSettings); // Restricted

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.put('/announcements/:id/archive', archiveAnnouncement); // Added
router.delete('/announcements/:id', deleteAnnouncement);

export default router;
