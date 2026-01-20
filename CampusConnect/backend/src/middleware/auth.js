import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Authenticate user via JWT token
 */
export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user with related data based on role
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check Blocked Status
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account blocked. Contact admin.' });
        }

        // Check Maintenance Mode
        const maintenance = await prisma.systemSettings.findUnique({ where: { key: 'maintenance_mode' } });
        if (maintenance?.value === 'true' && !['ADMIN', 'SUB_ADMIN', 'CHIEF_MENTOR'].includes(user.role)) {
            return res.status(503).json({ message: 'System under maintenance' });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * Check if user has required role(s)
 * @param {Array<string>|string} allowedRoles - Single role or array of roles
 */
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // Check role
        if (!req.userRole || !roles.includes(req.userRole)) {
            console.log(`⛔ Access Denied: User ${req.userId} with role ${req.userRole} tried to access route demanding ${roles}`);
            return res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredRole: roles,
                yourRole: req.userRole
            });
        }

        // console.log(`✅ Access Granted: User ${req.userId} (${req.userRole}) -> ${req.originalUrl}`); // Optional verbose log
        next();
    };
};

/**
 * Check year restriction for students chatting with placement officers
 * Students in year 1-2 cannot chat with placement officers
 */
export const checkYearRestriction = async (req, res, next) => {
    try {
        if (req.userRole !== 'STUDENT') {
            return next();
        }

        const student = await prisma.student.findUnique({
            where: { userId: req.userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Check if trying to access placement officer features
        const { receiverId } = req.body;

        if (receiverId) {
            const receiver = await prisma.user.findUnique({
                where: { id: receiverId }
            });

            if ((receiver?.role === 'PLACEMENT_OFFICER' || receiver?.role === 'PLACEMENT_HEAD') && student.year < 3) {
                return res.status(403).json({
                    message: 'Students in year 1-2 cannot communicate with placement officers',
                    currentYear: student.year,
                    requiredYear: 3
                });
            }
        }

        next();
    } catch (error) {
        console.error('Year restriction check error:', error);
        return res.status(500).json({ message: 'Error checking access permissions' });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId }
            });

            if (user) {
                req.user = user;
                req.userId = user.id;
                req.userRole = user.role;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
