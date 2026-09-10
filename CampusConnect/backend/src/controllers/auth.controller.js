import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { getGmailAuthUrl, handleGmailCallback } from '../services/gmail.service.js';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();
const frontendRedirectUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

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
            // Increment failed login attempts
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updateData = { failedLoginAttempts: attempts };
            let msg = 'Invalid credentials';

            if (attempts >= 10) {
                updateData.isBlocked = true;
                msg = 'Account blocked due to multiple failed login attempts. Contact admin.';
            }

            await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });

            if (attempts >= 10) return error(res, msg, 403);
            return error(res, msg, 401);
        }

        // Reset failed login attempts on success
        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0 }
        });

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

        if (!user) {
            return error(res, 'Invalid credentials', 401);
        }

        // Check if blocked
        if (user.isBlocked) {
            return error(res, 'Account blocked. Contact admin.', 403);
        }

        // Check if user is admin or sub-admin
        if (!['ADMIN', 'SUB_ADMIN'].includes(user.role)) {
            return error(res, 'Access denied. Admin privileges required.', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            // Increment failed login attempts
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updateData = { failedLoginAttempts: attempts };
            let msg = 'Invalid credentials';

            if (attempts >= 10) {
                updateData.isBlocked = true;
                msg = 'Account blocked due to multiple failed login attempts. Contact admin.';
            }

            await prisma.user.update({
                where: { id: user.id },
                data: updateData
            });

            if (attempts >= 10) return error(res, msg, 403);
            return error(res, msg, 401);
        }

        // Reset failed login attempts on success
        await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0 }
        });

        // Generate token
        const token = generateToken(user.id, user.role);

        // Remove password from response
        const { passwordHash, ...userWithoutPassword } = user;

        return success(res, {
            token,
            user: userWithoutPassword,
            isFirstLogin: user.isFirstLogin
        }, 'Admin login successful');

    } catch (err) {
        console.error('Admin login error:', err);
        return error(res, 'Admin login failed', 500, err);
    }
};

/**
 * Change password
 */
export const changePassword = async (req, res) => {
    try {
        const { userId } = req;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return error(res, 'Current password and new password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return error(res, 'User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isPasswordValid) {
            return error(res, 'Current password is incorrect', 401);
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password and set isFirstLogin to false
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
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
 * Get current user profile
 */
export const getProfile = async (req, res) => {
    try {
        const { userId } = req;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        if (!user) {
            return error(res, 'User not found', 404);
        }

        const { passwordHash, ...userWithoutPassword } = user;

        return success(res, { user: userWithoutPassword }, 'Profile fetched successfully');

    } catch (err) {
        console.error('Get profile error:', err);
        return error(res, 'Failed to fetch profile', 500);
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { userId } = req;
        const { firstName, lastName, phone, profilePicture } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phone) updateData.phone = phone;
        if (profilePicture) updateData.profilePicture = profilePicture;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        const { passwordHash, ...userWithoutPassword } = updatedUser;

        return success(res, { user: userWithoutPassword }, 'Profile updated successfully');
    } catch (err) {
        console.error('Update profile error:', err);
        return error(res, 'Failed to update profile', 500);
    }
};

/**
 * Check maintenance status (public endpoint)
 */
export const checkMaintenanceStatus = async (req, res) => {
    try {
        const maintenance = await prisma.systemSettings.findUnique({
            where: { key: 'maintenance_mode' }
        });

        return success(res, {
            maintenanceMode: maintenance?.value === 'true'
        }, 'Maintenance status fetched');
    } catch (err) {
        console.error('Check maintenance error:', err);
        return error(res, 'Failed to check maintenance status', 500);
    }
};

/**
 * Gmail connect - get auth URL
 */
export const gmailConnect = async (req, res) => {
    try {
        const { userId } = req;
        const nonce = randomBytes(32).toString('hex');
        const authUrl = await getGmailAuthUrl(userId, nonce);
        res.cookie('gmail_oauth', nonce, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 600000, path: '/api/auth/gmail-callback' });
        return success(res, { authUrl }, 'Gmail auth URL generated');
    } catch (err) {
        console.error('Gmail connect error:', err);
        return error(res, 'Failed to generate Gmail auth URL', 500);
    }
};

/**
 * Gmail callback - handle OAuth callback
 */
export const gmailCallback = async (req, res) => {
    const callbackError = (message) => `${frontendRedirectUrl()}/gmail-error?reason=${encodeURIComponent(message)}`;
    try {
        const { code, state } = req.query;

        if (req.query.error) {
            return res.redirect(callbackError(`Google authorization was cancelled: ${req.query.error}`));
        }

        if (!code || !state) {
            return res.redirect(callbackError('Google did not return an authorization code.'));
        }

        const nonce = req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('gmail_oauth='))?.slice('gmail_oauth='.length);
        await handleGmailCallback(code, state, nonce);
        res.clearCookie('gmail_oauth', { path: '/api/auth/gmail-callback' });

        // Redirect to frontend with success
        res.redirect(`${frontendRedirectUrl()}/gmail-connected`);
    } catch (err) {
        console.error('Gmail callback error:', err);
        const message = err.message === 'Invalid OAuth callback' || err.message === 'Expired or invalid OAuth state'
            ? `${err.message}. Refresh the app and start Connect Gmail again.`
            : err.message === 'Google did not provide offline access; reconnect Gmail'
                ? 'Google did not grant offline access. Select the Google account again and approve Gmail access.'
                : 'Gmail connection failed on the server. Check the Render logs for the full error.';
        res.redirect(callbackError(message));
    }
};

/**
 * Logout (placeholder - actual logout is handled on frontend)
 */
export const logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is primarily handled client-side
        // This endpoint can be used for logging or cleanup if needed
        return success(res, null, 'Logged out successfully');
    } catch (err) {
        console.error('Logout error:', err);
        return error(res, 'Logout failed', 500);
    }
};
