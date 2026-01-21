import { PrismaClient } from '@prisma/client';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Submit a bug report
 */
export const submitBugReport = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, priority, screenshot } = req.body;

        if (!title || !description) {
            return error(res, 'Title and description are required', 400);
        }

        const bugReport = await prisma.bugReport.create({
            data: {
                userId,
                title,
                description,
                priority: priority || 'MEDIUM',
                screenshot
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });

        return success(res, { bugReport }, 'Bug report submitted successfully');
    } catch (err) {
        console.error('Submit bug report error:', err);
        return error(res, 'Failed to submit bug report', 500);
    }
};

/**
 * Get user's bug reports
 */
export const getUserBugReports = async (req, res) => {
    try {
        const userId = req.userId;

        const bugReports = await prisma.bugReport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return success(res, { bugReports }, 'Bug reports fetched');
    } catch (err) {
        console.error('Get user bug reports error:', err);
        return error(res, 'Failed to fetch bug reports', 500);
    }
};
