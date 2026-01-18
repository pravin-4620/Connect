import { PrismaClient } from '@prisma/client';
import { error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Check if system is in maintenance mode.
 * Allows access only if user is ADMIN.
 * Must be placed AFTER authenticate middleware.
 */
export const checkMaintenanceMode = async (req, res, next) => {
    try {
        // Skip for ADMINs
        if (req.user && req.user.role === 'ADMIN') {
            return next();
        }

        // Check settings
        const setting = await prisma.systemSettings.findUnique({
            where: { key: 'maintenanceMode' }
        });

        if (setting && (setting.value === 'true' || setting.jsonValue === true)) {
            return error(res, 'System is currently under maintenance. Please try again later.', 503);
        }

        next();
    } catch (err) {
        console.error('Maintenance check error:', err);
        // Fail open or closed? Closed is safer for maintenance.
        // But if DB error, maybe just log and continue?
        // Let's continue to avoid blocking due to simple DB glitch, unless critical.
        next();
    }
};
