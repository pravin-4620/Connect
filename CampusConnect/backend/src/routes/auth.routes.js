import express from 'express';
import {
    login,
    adminLogin,
    logout,
    changePassword,
    gmailConnect,
    gmailCallback,
    getProfile,
    updateProfile
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/gmail-callback', gmailCallback);

// Protected routes
router.use(authenticate);
router.post('/logout', logout);
router.post('/change-password', changePassword);
router.get('/gmail-connect', gmailConnect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
