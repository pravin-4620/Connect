import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { submitBugReport, getUserBugReports } from '../controllers/bugReport.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Submit bug report
router.post('/', submitBugReport);

// Get user's bug reports
router.get('/my-reports', getUserBugReports);

export default router;
