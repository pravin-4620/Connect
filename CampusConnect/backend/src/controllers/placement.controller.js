import { PrismaClient } from '@prisma/client';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Get placement officer dashboard stats
 */
export const getDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId },
            include: {
                user: true,
                students: {
                    where: { year: { gte: 3 } },
                    include: { user: true }
                }
            }
        });

        if (!placementOfficer) {
            return error(res, 'Placement officer profile not found', 404);
        }

        // Get active placement drives
        const isHead = req.userRole === 'PLACEMENT_HEAD';

        // Get active placement drives
        const driveWhere = {
            applicationDeadline: { gte: new Date() }
        };
        if (!isHead) driveWhere.placementOfficerId = placementOfficer.id;

        const activeDrives = await prisma.placement.count({
            where: driveWhere
        });

        // Get total placements (approved applications)
        const placementWhere = {
            status: 'APPROVED'
        };
        if (!isHead) placementWhere.placement = { placementOfficerId: placementOfficer.id };

        const totalPlacements = await prisma.placementApplication.count({
            where: placementWhere
        });

        // Get upcoming interviews
        const interviewWhere = {
            scheduledAt: { gte: new Date() },
            status: 'SCHEDULED'
        };
        if (!isHead) interviewWhere.placementOfficerId = placementOfficer.id;

        const upcomingInterviews = await prisma.interview.count({
            where: interviewWhere
        });

        // Get average package
        const packageWhere = {};
        if (!isHead) packageWhere.placementOfficerId = placementOfficer.id;

        const placements = await prisma.placement.findMany({
            where: packageWhere
        });

        const avgPackage = placements.length > 0
            ? placements.reduce((sum, p) => sum + p.package, 0) / placements.length
            : 0;

        return success(res, {
            placementOfficer: {
                ...placementOfficer,
                user: {
                    ...placementOfficer.user,
                    passwordHash: undefined
                }
            },
            stats: {
                totalStudents: placementOfficer.students.length,
                activeDrives,
                totalPlacements,
                upcomingInterviews,
                averagePackage: avgPackage.toFixed(2)
            }
        }, 'Dashboard stats fetched');
    } catch (err) {
        console.error('Get placement dashboard error:', err);
        return error(res, 'Failed to fetch dashboard data', 500);
    }
};

/**
 * Create placement drive
 */
export const createPlacementDrive = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            companyName,
            jobRole,
            package: packageAmount,
            description,
            driveDate,
            applicationDeadline,
            eligibilityCriteria
        } = req.body;

        if (!companyName || !jobRole || !packageAmount || !description || !driveDate || !applicationDeadline) {
            return error(res, 'All fields are required', 400);
        }

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const placement = await prisma.placement.create({
            data: {
                companyName,
                jobRole,
                package: parseFloat(packageAmount),
                description,
                driveDate: new Date(driveDate),
                applicationDeadline: new Date(applicationDeadline),
                eligibilityCriteria: eligibilityCriteria || {
                    minCGPA: 0,
                    allowedYears: [3, 4],
                    departments: [],
                    skills: []
                },
                placementOfficerId: placementOfficer.id
            }
        });

        return success(res, { placement }, 'Placement drive created successfully');
    } catch (err) {
        console.error('Create placement drive error:', err);
        return error(res, 'Failed to create placement drive', 500);
    }
};

/**
 * Update placement drive
 */
export const updatePlacementDrive = async (req, res) => {
    try {
        const userId = req.userId;
        const { placementId } = req.params;
        const updateData = req.body;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        // Verify placement belongs to officer
        const placement = await prisma.placement.findUnique({
            where: { id: placementId }
        });

        if (!placement) {
            return error(res, 'Placement not found', 404);
        }

        if (placement.placementOfficerId !== placementOfficer.id) {
            return error(res, 'You can only update your own placement drives', 403);
        }

        const updated = await prisma.placement.update({
            where: { id: placementId },
            data: {
                companyName: updateData.companyName || placement.companyName,
                jobRole: updateData.jobRole || placement.jobRole,
                package: updateData.package ? parseFloat(updateData.package) : placement.package,
                description: updateData.description || placement.description,
                driveDate: updateData.driveDate ? new Date(updateData.driveDate) : placement.driveDate,
                applicationDeadline: updateData.applicationDeadline ? new Date(updateData.applicationDeadline) : placement.applicationDeadline,
                eligibilityCriteria: updateData.eligibilityCriteria || placement.eligibilityCriteria
            }
        });

        return success(res, { placement: updated }, 'Placement drive updated successfully');
    } catch (err) {
        console.error('Update placement drive error:', err);
        return error(res, 'Failed to update placement drive', 500);
    }
};

/**
 * Get all placement drives
 */
export const getPlacementDrives = async (req, res) => {
    try {
        const userId = req.userId;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const where = {};
        if (req.userRole !== 'PLACEMENT_HEAD') {
            where.placementOfficerId = placementOfficer.id;
        }

        const placements = await prisma.placement.findMany({
            where,
            include: {
                applications: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            },
            orderBy: { driveDate: 'desc' }
        });

        return success(res, { placements }, 'Placement drives fetched');
    } catch (err) {
        console.error('Get placement drives error:', err);
        return error(res, 'Failed to fetch placement drives', 500);
    }
};

/**
 * Get eligible students (year 3-4)
 */
export const getStudents = async (req, res) => {
    try {
        const userId = req.userId;
        const { search, year, department, minCGPA } = req.query;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const where = {
            year: { gte: 3 }
        };

        if (year) {
            where.year = parseInt(year);
        }

        if (department) {
            where.department = department;
        }

        if (minCGPA) {
            where.cgpa = { gte: parseFloat(minCGPA) };
        }

        if (search) {
            where.OR = [
                { rollNumber: { contains: search, mode: 'insensitive' } },
                {
                    user: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                }
            ];
        }

        const students = await prisma.student.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true
                    }
                },
                placementApplications: {
                    include: {
                        placement: true
                    }
                },
                testAttempts: {
                    include: {
                        test: true
                    }
                },
                interviews: true
            },
            orderBy: { cgpa: 'desc' }
        });

        return success(res, { students }, 'Students fetched');
    } catch (err) {
        console.error('Get students error:', err);
        return error(res, 'Failed to fetch students', 500);
    }
};

/**
 * Schedule interview
 */
export const scheduleInterview = async (req, res) => {
    try {
        const userId = req.userId;
        const { studentId, scheduledAt, type, feedback } = req.body;

        if (!studentId || !scheduledAt || !type) {
            return error(res, 'Student ID, scheduled time, and type are required', 400);
        }

        if (!['MOCK', 'COMPANY'].includes(type)) {
            return error(res, 'Type must be MOCK or COMPANY', 400);
        }

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        // Verify student is year 3-4
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return error(res, 'Student not found', 404);
        }

        if (student.year < 3) {
            return error(res, 'Can only schedule interviews for year 3-4 students', 403);
        }

        const interview = await prisma.interview.create({
            data: {
                studentId,
                placementOfficerId: placementOfficer.id,
                scheduledAt: new Date(scheduledAt),
                type,
                feedback,
                status: 'SCHEDULED'
            },
            include: {
                student: {
                    include: { user: true }
                }
            }
        });

        return success(res, { interview }, 'Interview scheduled successfully');
    } catch (err) {
        console.error('Schedule interview error:', err);
        return error(res, 'Failed to schedule interview', 500);
    }
};

/**
 * Update interview
 */
export const updateInterview = async (req, res) => {
    try {
        const userId = req.userId;
        const { interviewId } = req.params;
        const { scheduledAt, feedback, status } = req.body;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const interview = await prisma.interview.findUnique({
            where: { id: interviewId }
        });

        if (!interview) {
            return error(res, 'Interview not found', 404);
        }

        if (interview.placementOfficerId !== placementOfficer.id) {
            return error(res, 'You can only update your own interviews', 403);
        }

        const updated = await prisma.interview.update({
            where: { id: interviewId },
            data: {
                scheduledAt: scheduledAt ? new Date(scheduledAt) : interview.scheduledAt,
                feedback: feedback !== undefined ? feedback : interview.feedback,
                status: status || interview.status
            },
            include: {
                student: {
                    include: { user: true }
                }
            }
        });

        return success(res, { interview: updated }, 'Interview updated successfully');
    } catch (err) {
        console.error('Update interview error:', err);
        return error(res, 'Failed to update interview', 500);
    }
};

/**
 * Get all interviews
 */
export const getInterviews = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const where = {};
        if (req.userRole !== 'PLACEMENT_HEAD') {
            where.placementOfficerId = placementOfficer.id;
        }

        if (status) {
            where.status = status;
        }

        const interviews = await prisma.interview.findMany({
            where,
            include: {
                student: {
                    include: { user: true }
                }
            },
            orderBy: { scheduledAt: 'desc' }
        });

        return success(res, { interviews }, 'Interviews fetched');
    } catch (err) {
        console.error('Get interviews error:', err);
        return error(res, 'Failed to fetch interviews', 500);
    }
};

/**
 * Create skills test
 */
export const createSkillsTest = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, durationMinutes, totalMarks, questions } = req.body;

        if (!title || !description || !durationMinutes || !totalMarks || !questions) {
            return error(res, 'All fields are required', 400);
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return error(res, 'Questions must be a non-empty array', 400);
        }

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const test = await prisma.skillsTest.create({
            data: {
                title,
                description,
                durationMinutes: parseInt(durationMinutes),
                totalMarks: parseInt(totalMarks),
                questions,
                createdById: placementOfficer.id
            }
        });

        return success(res, { test }, 'Skills test created successfully');
    } catch (err) {
        console.error('Create skills test error:', err);
        return error(res, 'Failed to create skills test', 500);
    }
};

/**
 * Get all skills tests
 */
export const getSkillsTests = async (req, res) => {
    try {
        const userId = req.userId;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const tests = await prisma.skillsTest.findMany({
            where: { createdById: placementOfficer.id },
            include: {
                attempts: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return success(res, { tests }, 'Tests fetched');
    } catch (err) {
        console.error('Get skills tests error:', err);
        return error(res, 'Failed to fetch skills tests', 500);
    }
};

/**
 * Get analytics and reports
 */
export const getAnalytics = async (req, res) => {
    try {
        const userId = req.userId;
        const { startDate, endDate, department } = req.query;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        // Build where clause for placements
        const placementWhere = {};
        if (req.userRole !== 'PLACEMENT_HEAD') {
            placementWhere.placementOfficerId = placementOfficer.id;
        }

        if (startDate && endDate) {
            placementWhere.driveDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Get all placements
        const placements = await prisma.placement.findMany({
            where: placementWhere,
            include: {
                applications: {
                    where: { status: 'APPROVED' },
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        // Calculate statistics
        const totalDrives = placements.length;
        const totalApplications = placements.reduce((sum, p) => sum + p.applications.length, 0);

        // Package distribution
        const packageRanges = {
            '0-5': 0,
            '5-10': 0,
            '10-15': 0,
            '15-20': 0,
            '20+': 0
        };

        placements.forEach(p => {
            if (p.package < 5) packageRanges['0-5']++;
            else if (p.package < 10) packageRanges['5-10']++;
            else if (p.package < 15) packageRanges['10-15']++;
            else if (p.package < 20) packageRanges['15-20']++;
            else packageRanges['20+']++;
        });

        // Department-wise placements
        const departmentStats = {};
        placements.forEach(p => {
            p.applications.forEach(app => {
                const dept = app.student.department;
                if (!departmentStats[dept]) {
                    departmentStats[dept] = 0;
                }
                departmentStats[dept]++;
            });
        });

        // Top companies
        const companyStats = {};
        placements.forEach(p => {
            if (!companyStats[p.companyName]) {
                companyStats[p.companyName] = {
                    count: 0,
                    avgPackage: 0,
                    packages: []
                };
            }
            companyStats[p.companyName].count += p.applications.length;
            companyStats[p.companyName].packages.push(p.package);
        });

        // Calculate average package for each company
        Object.keys(companyStats).forEach(company => {
            const packages = companyStats[company].packages;
            companyStats[company].avgPackage = packages.reduce((sum, p) => sum + p, 0) / packages.length;
        });

        // Student placement status
        const studentWhere = { year: { gte: 3 } };
        if (department) {
            studentWhere.department = department;
        }

        const totalStudents = await prisma.student.count({ where: studentWhere });
        const placedStudents = await prisma.student.count({
            where: {
                ...studentWhere,
                placementApplications: {
                    some: { status: 'APPROVED' }
                }
            }
        });

        return success(res, {
            summary: {
                totalDrives,
                totalApplications,
                totalStudents,
                placedStudents,
                placementPercentage: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : 0
            },
            packageDistribution: packageRanges,
            departmentStats,
            topCompanies: Object.entries(companyStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 10)
                .map(([company, stats]) => ({
                    company,
                    placements: stats.count,
                    avgPackage: stats.avgPackage.toFixed(2)
                })),
            recentPlacements: placements.slice(0, 10)
        }, 'Analytics fetched');
    } catch (err) {
        console.error('Get analytics error:', err);
        return error(res, 'Failed to fetch analytics', 500);
    }
};

/**
 * Create announcement
 */
export const createAnnouncement = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, content, targetRole, priority } = req.body;

        if (!title || !content) {
            return error(res, 'Title and content are required', 400);
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                targetRole: targetRole || null,
                priority: priority || 'MEDIUM',
                createdById: userId
            }
        });

        return success(res, { announcement }, 'Announcement created successfully');
    } catch (err) {
        console.error('Create announcement error:', err);
        return error(res, 'Failed to create announcement', 500);
    }
};

/**
 * Get announcements
 */
export const getAnnouncements = async (req, res) => {
    try {
        const userId = req.userId;

        const announcements = await prisma.announcement.findMany({
            where: {
                createdById: userId
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return success(res, { announcements }, 'Announcements fetched');
    } catch (err) {
        console.error('Get announcements error:', err);
        return error(res, 'Failed to fetch announcements', 500);
    }
};

/**
 * Update placement application status
 */
export const updateApplicationStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { applicationId } = req.params;
        const { status } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return error(res, 'Invalid status', 400);
        }

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const application = await prisma.placementApplication.findUnique({
            where: { id: applicationId },
            include: { placement: true }
        });

        if (!application) {
            return error(res, 'Application not found', 404);
        }

        if (application.placement.placementOfficerId !== placementOfficer.id) {
            return error(res, 'You can only update applications for your placement drives', 403);
        }

        const updated = await prisma.placementApplication.update({
            where: { id: applicationId },
            data: { status },
            include: {
                student: {
                    include: { user: true }
                },
                placement: true
            }
        });

        return success(res, { application: updated }, `Application ${status.toLowerCase()}`);
    } catch (err) {
        console.error('Update application status error:', err);
        return error(res, 'Failed to update application status', 500);
    }
};

/**
 * Get emails (Gmail integration)
 */
export const getEmails = async (req, res) => {
    try {
        const userId = req.userId;

        const emails = await prisma.email.findMany({
            where: { userId },
            orderBy: { receivedAt: 'desc' }
        });

        return success(res, { emails }, 'Emails fetched');
    } catch (err) {
        console.error('Get emails error:', err);
        return error(res, 'Failed to fetch emails', 500);
    }
};

/**
 * Get placement officer settings
 */
export const getSettings = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        // Default settings if null
        const defaultSettings = {
            emailNotifications: true,
            pushNotifications: true,
            theme: 'system'
        };

        return success(res, { settings: user.preferences || defaultSettings }, 'Settings fetched');
    } catch (err) {
        console.error('Get settings error:', err);
        return error(res, 'Failed to fetch settings', 500);
    }
};

/**
 * Update placement officer settings
 */
export const updateSettings = async (req, res) => {
    try {
        const userId = req.userId;
        const { settings } = req.body;

        await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: settings
            }
        });

        return success(res, null, 'Settings updated successfully');
    } catch (err) {
        console.error('Update settings error:', err);
        return error(res, 'Failed to update settings', 500);
    }
};

/**
 * Update placement officer profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, phone, department, designation } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                phone,
                placementOfficer: {
                    update: {
                        department,
                        designation
                    }
                }
            },
            include: {
                placementOfficer: true
            }
        });

        return success(res, { user }, 'Profile updated successfully');
    } catch (err) {
        console.error('Update profile error:', err);
        return error(res, 'Failed to update profile', 500);
    }
};

/**
 * Delete placement drive
 */
export const deletePlacementDrive = async (req, res) => {
    try {
        const userId = req.userId;
        const { placementId } = req.params;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const placement = await prisma.placement.findUnique({
            where: { id: placementId }
        });

        if (!placement) {
            return error(res, 'Placement not found', 404);
        }

        if (placement.placementOfficerId !== placementOfficer.id) {
            return error(res, 'You can only delete your own placement drives', 403);
        }

        await prisma.placement.delete({
            where: { id: placementId }
        });

        return success(res, null, 'Placement drive deleted');
    } catch (err) {
        console.error('Delete placement drive error:', err);
        return error(res, 'Failed to delete placement drive', 500);
    }
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = async (req, res) => {
    try {
        const userId = req.userId;
        const { announcementId } = req.params;

        const announcement = await prisma.announcement.findUnique({
            where: { id: announcementId }
        });

        if (!announcement) {
            return error(res, 'Announcement not found', 404);
        }

        if (announcement.createdById !== userId) {
            return error(res, 'You can only delete your own announcements', 403);
        }

        await prisma.announcement.delete({
            where: { id: announcementId }
        });

        return success(res, null, 'Announcement deleted');
    } catch (err) {
        console.error('Delete announcement error:', err);
        return error(res, 'Failed to delete announcement', 500);
    }
};

/**
 * Delete interview
 */
export const deleteInterview = async (req, res) => {
    try {
        const userId = req.userId;
        const { interviewId } = req.params;

        const placementOfficer = await prisma.placementOfficer.findUnique({
            where: { userId }
        });

        const interview = await prisma.interview.findUnique({
            where: { id: interviewId }
        });

        if (!interview) {
            return error(res, 'Interview not found', 404);
        }

        if (interview.placementOfficerId !== placementOfficer.id) {
            return error(res, 'You can only delete your own interviews', 403);
        }

        await prisma.interview.delete({
            where: { id: interviewId }
        });

        return success(res, null, 'Interview deleted');
    } catch (err) {
        console.error('Delete interview error:', err);
        return error(res, 'Failed to delete interview', 500);
    }
};
