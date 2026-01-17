import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { syncEmails } from '../services/gmail.service.js';

const prisma = new PrismaClient();

/**
 * Sync emails for all connected users
 * Runs every 15 minutes
 */
const syncAllEmails = async () => {
    try {
        console.log('📧 Starting email sync job...');

        // Get all users with Gmail connected
        const users = await prisma.user.findMany({
            where: { gmailConnected: true },
            select: { id: true, email: true }
        });

        console.log(`Found ${users.length} users with Gmail connected`);

        for (const user of users) {
            try {
                await syncEmails(user.id);
                console.log(`✅ Synced emails for ${user.email}`);
            } catch (error) {
                console.error(`❌ Failed to sync emails for ${user.email}:`, error.message);
                // Continue with next user
            }
        }

        console.log('📧 Email sync job completed');
    } catch (error) {
        console.error('Email sync job error:', error);
    }
};

/**
 * Update student year at the start of academic year
 * Runs on August 1st every year at midnight
 */
const updateStudentYears = async () => {
    try {
        console.log('📅 Starting student year update job...');

        // Increment year for all students except year 4
        const result = await prisma.student.updateMany({
            where: {
                year: { lt: 4 }
            },
            data: {
                year: { increment: 1 }
            }
        });

        console.log(`✅ Updated year for ${result.count} students`);

        // Auto-assign placement officers to students who moved to year 3
        await autoAssignPlacementOfficers();

        console.log('📅 Student year update job completed');
    } catch (error) {
        console.error('Student year update job error:', error);
    }
};

/**
 * Auto-assign placement officers to year 3 students
 */
const autoAssignPlacementOfficers = async () => {
    try {
        // Get students in year 3 without placement officer
        const students = await prisma.student.findMany({
            where: {
                year: 3,
                placementOfficerId: null
            },
            include: {
                user: true
            }
        });

        if (students.length === 0) {
            console.log('No students need placement officer assignment');
            return;
        }

        // Get all placement officers
        const placementOfficers = await prisma.placementOfficer.findMany({
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        if (placementOfficers.length === 0) {
            console.log('No placement officers available for assignment');
            return;
        }

        // Assign students to placement officers (round-robin)
        let officerIndex = 0;

        for (const student of students) {
            const officer = placementOfficers[officerIndex];

            await prisma.student.update({
                where: { id: student.id },
                data: { placementOfficerId: officer.id }
            });

            console.log(`Assigned student ${student.user.email} to placement officer ${officer.id}`);

            // Move to next officer (round-robin)
            officerIndex = (officerIndex + 1) % placementOfficers.length;
        }

        console.log(`✅ Auto-assigned ${students.length} students to placement officers`);
    } catch (error) {
        console.error('Auto-assign placement officers error:', error);
    }
};

/**
 * Send email reminders for upcoming events and deadlines
 * Runs daily at 9 AM
 */
const sendReminders = async () => {
    try {
        console.log('🔔 Starting reminders job...');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Find upcoming events
        const upcomingEvents = await prisma.event.findMany({
            where: {
                eventDate: {
                    gte: tomorrow,
                    lt: dayAfterTomorrow
                },
                status: 'UPCOMING'
            },
            include: {
                registrations: {
                    where: { status: 'APPROVED' },
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        console.log(`Found ${upcomingEvents.length} upcoming events`);

        // Find assignments due tomorrow
        const dueAssignments = await prisma.assignment.findMany({
            where: {
                dueDate: {
                    gte: tomorrow,
                    lt: dayAfterTomorrow
                }
            },
            include: {
                mentor: {
                    include: {
                        students: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        console.log(`Found ${dueAssignments.length} assignments due tomorrow`);

        // Find placement application deadlines
        const placementDeadlines = await prisma.placement.findMany({
            where: {
                applicationDeadline: {
                    gte: tomorrow,
                    lt: dayAfterTomorrow
                }
            }
        });

        console.log(`Found ${placementDeadlines.length} placement deadlines tomorrow`);

        // In a real application, you would send emails/notifications here
        // For now, we'll just log the reminders

        console.log('🔔 Reminders job completed');
    } catch (error) {
        console.error('Reminders job error:', error);
    }
};

/**
 * Clean up old analytics logs (keep last 6 months)
 * Runs weekly on Sunday at midnight
 */
const cleanupAnalytics = async () => {
    try {
        console.log('🧹 Starting analytics cleanup job...');

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const result = await prisma.analyticsLog.deleteMany({
            where: {
                loggedAt: { lt: sixMonthsAgo }
            }
        });

        console.log(`✅ Deleted ${result.count} old analytics logs`);
        console.log('🧹 Analytics cleanup job completed');
    } catch (error) {
        console.error('Analytics cleanup job error:', error);
    }
};

/**
 * Start all cron jobs
 */
export const startEmailSyncJob = () => {
    console.log('⏰ Initializing cron jobs...');

    // Email sync - every 15 minutes
    cron.schedule('*/15 * * * *', syncAllEmails);
    console.log('✅ Email sync job scheduled (every 15 minutes)');

    // Student year update - August 1st at midnight
    cron.schedule('0 0 1 8 *', updateStudentYears);
    console.log('✅ Student year update job scheduled (August 1st)');

    // Reminders - daily at 9 AM
    cron.schedule('0 9 * * *', sendReminders);
    console.log('✅ Reminders job scheduled (daily at 9 AM)');

    // Analytics cleanup - weekly on Sunday at midnight
    cron.schedule('0 0 * * 0', cleanupAnalytics);
    console.log('✅ Analytics cleanup job scheduled (weekly on Sunday)');

    console.log('⏰ All cron jobs initialized successfully');
};
