import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getGmailAuthUrl, handleGmailCallback } from '../services/gmail.service.js';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

/**
 * Login for student, mentor, and placement officer
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Email and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        if (!user) {
            return error(res, 'Invalid credentials', 401);
        }

        // Check if blocked
        if (user.isBlocked) {
            return error(res, 'Account blocked. Contact admin.', 403);
        }

        // Check maintenance mode
        const maintenance = await prisma.systemSettings.findUnique({ where: { key: 'maintenance_mode' } });
        // Allow ADMIN, SUB_ADMIN, CHIEF_MENTOR to bypass (though ADMIN usually uses adminLogin)
        if (maintenance?.value === 'true' && !['ADMIN', 'SUB_ADMIN', 'CHIEF_MENTOR'].includes(user.role)) {
            return error(res, 'Under maintenance', 503);
        }

        // Check if admin trying to login via regular login
        if (user.role === 'ADMIN') {
            return error(res, 'Please use admin login', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return error(res, 'Invalid credentials', 401);
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove password from response
        const { passwordHash, ...userWithoutPassword } = user;

        return success(res, {
            token,
            user: userWithoutPassword,
            isFirstLogin: user.isFirstLogin
        }, 'Login successful');

    } catch (err) {
        console.error('Login error:', err);
        return error(res, 'Login failed', 500, err);
    }
};

/**
 * Admin login (separate endpoint)
 */
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Email and password are required', 400);
        }

        // Find admin user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user || !['ADMIN', 'SUB_ADMIN', 'CHIEF_MENTOR'].includes(user.role)) {
            return error(res, 'Invalid admin credentials', 401);
        }

        if (user.isBlocked) {
            return error(res, 'Account blocked. Contact admin.', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return error(res, 'Invalid admin credentials', 401);
        }

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove password from response
        const { passwordHash, ...userWithoutPassword } = user;

        return success(res, {
            token,
            user: userWithoutPassword
        }, 'Admin login successful');

    } catch (err) {
        console.error('Admin login error:', err);
        return error(res, 'Admin login failed', 500, err);
    }
};

/**
 * Logout (client-side token removal, optional server-side tracking)
 */
export const logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is primarily client-side
        return success(res, null, 'Logout successful');
    } catch (err) {
        console.error('Logout error:', err);
        return error(res, 'Logout failed', 500);
    }
};

/**
 * Change password (required on first login)
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        if (!currentPassword || !newPassword) {
            return error(res, 'Current and new passwords are required', 400);
        }

        if (newPassword.length < 6) {
            return error(res, 'New password must be at least 6 characters', 400);
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isPasswordValid) {
            return error(res, 'Current password is incorrect', 401);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and set isFirstLogin to false
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: hashedPassword,
                isFirstLogin: false
            }
        });

        return success(res, null, 'Password changed successfully');

    } catch (err) {
        console.error('Change password error:', err);
        return error(res, 'Failed to change password', 500);
    }
};

/**
 * Initiate Gmail OAuth flow
 */
export const gmailConnect = async (req, res) => {
    try {
        const authUrl = getGmailAuthUrl(req.userId);
        return success(res, { authUrl }, 'Auth URL generated');
    } catch (err) {
        console.error('Gmail connect error:', err);
        return error(res, 'Failed to initiate Gmail connection', 500);
    }
};

/**
 * Handle Gmail OAuth callback
 */
export const gmailCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).send('Missing authorization code or state');
        }

        const userId = state; // We passed userId as state
        await handleGmailCallback(code, userId);

        // Redirect to frontend success page
        res.redirect(`${process.env.FRONTEND_URL}/gmail-connected`);
    } catch (err) {
        console.error('Gmail callback error:', err);
        res.redirect(`${process.env.FRONTEND_URL}/gmail-error`);
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        const { passwordHash, ...userWithoutPassword } = user;

        return success(res, { user: userWithoutPassword }, 'Profile fetched');
    } catch (err) {
        console.error('Get profile error:', err);
        return error(res, 'Failed to fetch profile', 500);
    }
};

/**
 * Update current user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, phone, profilePicture } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                phone,
                profilePicture
            }
        });

        const { passwordHash, ...userWithoutPassword } = updatedUser;

        return success(res, { user: userWithoutPassword }, 'Profile updated successfully');
    } catch (err) {
        console.error('Update profile error:', err);
        return error(res, 'Failed to update profile', 500);
    }
};
