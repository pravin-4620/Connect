import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Generate random password
 */
const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

/**
 * Generate username from email
 */
const generateUsername = (email) => {
    return email.split('@')[0];
};

/**
 * Create new user
 */
export const createUser = async (req, res) => {
    try {
        const {
            email,
            firstName,
            lastName,
            role,
            phone,
            // Student specific
            rollNumber,
            year,
            department,
            // Mentor specific
            specialization,
            experienceYears,
            // Placement Officer specific
            designation
        } = req.body;

        if (!email || !firstName || !lastName || !role) {
            return error(res, 'Email, first name, last name, and role are required', 400);
        }

        if (!['STUDENT', 'MENTOR', 'PLACEMENT_OFFICER', 'SUB_ADMIN', 'CHIEF_MENTOR'].includes(role)) {
            return error(res, 'Invalid role. Available: STUDENT, MENTOR, PLACEMENT_OFFICER, SUB_ADMIN, CHIEF_MENTOR', 400);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return error(res, 'User with this email already exists', 400);
        }

        // Generate password
        const password = generatePassword();
        const passwordHash = await bcrypt.hash(password, 10);

        let user;
        try {
            // Create user
            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    passwordHash,
                    role,
                    firstName,
                    lastName,
                    phone,
                    isFirstLogin: true
                }
            });

            // Create role-specific profile
            if (role === 'STUDENT') {
                if (!rollNumber || !year || !department) {
                    throw new Error('Roll number, year, and department are required for students');
                }

                // Check if roll number already exists
                const existingStudent = await prisma.student.findUnique({
                    where: { rollNumber }
                });

                if (existingStudent) {
                    throw new Error('Student with this roll number already exists');
                }

                await prisma.student.create({
                    data: {
                        userId: user.id,
                        rollNumber,
                        year: parseInt(year),
                        department
                    }
                });
            } else if (role === 'MENTOR' || role === 'CHIEF_MENTOR') {
                if (!department && role === 'MENTOR') {
                    throw new Error('Department is required for mentors');
                }

                await prisma.mentor.create({
                    data: {
                        userId: user.id,
                        department: department || 'General',
                        specialization,
                        experienceYears: experienceYears ? parseInt(experienceYears) : null
                    }
                });
            } else if (role === 'PLACEMENT_OFFICER') {
                await prisma.placementOfficer.create({
                    data: {
                        userId: user.id,
                        department: department || null,
                        designation: designation || null
                    }
                });
            }
        } catch (error) {
            // Rollback user creation if profile creation fails
            if (user) {
                await prisma.user.delete({ where: { id: user.id } });
            }
            throw error; // Re-throw to be caught by outer catch
        }

        return success(res, {
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            credentials: {
                username: email,
                password,
                email: user.email
            }
        }, 'User created successfully');
    } catch (err) {
        console.error('Create user error:', err);
        return error(res, 'Failed to create user', 500);
    }
};

/**
     * Update user
     */
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            email,
            firstName,
            lastName,
            phone,
            // Student specific
            rollNumber,
            year,
            department,
            // Mentor specific
            specialization,
            experienceYears,
            // Placement Officer specific
            designation
        } = req.body;

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

        // Prepare update data
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (phone) updateData.phone = phone;

        // Update User
        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        // Update Role Specific Data
        if (user.role === 'STUDENT' && user.student) {
            const studentUpdate = {};
            if (year) studentUpdate.year = parseInt(year);
            if (department) studentUpdate.department = department;
            // Only update roll number if different (and check uniqueness ideally, but assuming admin knows)
            if (rollNumber && rollNumber !== user.student.rollNumber) {
                // Check uniqueness
                const existing = await prisma.student.findUnique({ where: { rollNumber } });
                if (existing) return error(res, 'Roll number already exists', 400);
                studentUpdate.rollNumber = rollNumber;
            }

            if (Object.keys(studentUpdate).length > 0) {
                await prisma.student.update({
                    where: { id: user.student.id },
                    data: studentUpdate
                });
            }
        } else if (user.role === 'MENTOR' && user.mentor) {
            const mentorUpdate = {};
            if (department) mentorUpdate.department = department;
            if (specialization) mentorUpdate.specialization = specialization;
            if (experienceYears) mentorUpdate.experienceYears = parseInt(experienceYears);

            if (Object.keys(mentorUpdate).length > 0) {
                await prisma.mentor.update({
                    where: { id: user.mentor.id },
                    data: mentorUpdate
                });
            }
        } else if (user.role === 'PLACEMENT_OFFICER' && user.placementOfficer) {
            const officerUpdate = {};
            if (department) officerUpdate.department = department;
            if (designation) officerUpdate.designation = designation;

            if (Object.keys(officerUpdate).length > 0) {
                await prisma.placementOfficer.update({
                    where: { id: user.placementOfficer.id },
                    data: officerUpdate
                });
            }
        }

        // Return updated user
        const updatedUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        return success(res, {
            user: {
                ...updatedUser,
                passwordHash: undefined
            }
        }, 'User updated successfully');

    } catch (err) {
        console.error('Update user error:', err);
        return error(res, 'Failed to update user', 500);
    }
};

/**
 * Get all users with filters
 */
export const getUsers = async (req, res) => {
    try {
        const { role, search, department, year } = req.query;

        const where = {};

        if (role && role !== 'ALL') {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (department) {
            const deptFilter = { equals: department, mode: 'insensitive' };
            where.AND = where.AND || [];
            where.AND.push({
                OR: [
                    { student: { department: deptFilter } },
                    { mentor: { department: deptFilter } },
                    { placementOfficer: { department: deptFilter } }
                ]
            });
        }

        if (year) {
            where.student = {
                year: parseInt(year)
            };
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Remove password hashes
        const usersWithoutPasswords = users.map(user => ({
            ...user,
            passwordHash: undefined
        }));

        return success(res, { users: usersWithoutPasswords }, 'Users fetched');
    } catch (err) {
        console.error('Get users error:', err);
        return error(res, 'Failed to fetch users', 500);
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

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

        return success(res, {
            user: {
                ...user,
                passwordHash: undefined
            }
        }, 'User details fetched');
    } catch (err) {
        console.error('Get user by ID error:', err);
        return error(res, 'Failed to fetch user', 500);
    }
};

/**
 * Create student mapping (assign mentor/placement officer)
 */
export const createMapping = async (req, res) => {
    try {
        const { studentId, mentorId, chiefMentorId, placementOfficerId } = req.body;

        if (!studentId) {
            return error(res, 'Student ID is required', 400);
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return error(res, 'Student not found', 404);
        }

        // Validate placement officer assignment (only for year 3-4)
        if (placementOfficerId && student.year < 3) {
            return error(res, 'Placement officers can only be assigned to year 3-4 students', 400, {
                currentYear: student.year
            });
        }

        // Verify mentor exists
        if (mentorId) {
            const mentor = await prisma.mentor.findUnique({
                where: { id: mentorId }
            });

            if (!mentor) {
                return error(res, 'Mentor not found', 404);
            }
        }

        // Verify chief mentor exists
        if (chiefMentorId) {
            const chiefMentor = await prisma.mentor.findUnique({
                where: { id: chiefMentorId }
            });

            if (!chiefMentor) {
                return error(res, 'Chief Mentor not found', 404);
            }
        }

        // Verify placement officer exists
        if (placementOfficerId) {
            const placementOfficer = await prisma.placementOfficer.findUnique({
                where: { id: placementOfficerId }
            });

            if (!placementOfficer) {
                return error(res, 'Placement officer not found', 404);
            }
        }

        // Update student mapping
        const updated = await prisma.student.update({
            where: { id: studentId },
            data: {
                mentorId: mentorId || student.mentorId,
                chiefMentorId: chiefMentorId || student.chiefMentorId,
                placementOfficerId: placementOfficerId !== undefined ? placementOfficerId : student.placementOfficerId
            },
            include: {
                user: true,
                mentor: {
                    include: { user: true }
                },
                chiefMentor: {
                    include: { user: true }
                },
                placementOfficer: {
                    include: { user: true }
                }
            }
        });

        return success(res, { student: updated }, 'Student mapping updated successfully');
    } catch (err) {
        console.error('Create mapping error:', err);
        return error(res, 'Failed to create mapping', 500);
    }
};

/**
 * Assign Chief Mentor to Mentor
 */
export const createMentorMapping = async (req, res) => {
    try {
        const { mentorId, chiefMentorId } = req.body;

        if (!mentorId) {
            return error(res, 'Mentor ID is required', 400);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { id: mentorId }
        });

        if (!mentor) {
            return error(res, 'Mentor not found', 404);
        }

        if (chiefMentorId) {
            const chief = await prisma.mentor.findUnique({
                where: { id: chiefMentorId }
            });
            if (!chief) {
                return error(res, 'Chief Mentor not found', 404);
            }
        }

        const updated = await prisma.mentor.update({
            where: { id: mentorId },
            data: {
                chiefMentorId: chiefMentorId || null
            },
            include: { user: true, chiefMentor: { include: { user: true } } }
        });

        // Propagate to students
        await prisma.student.updateMany({
            where: { mentorId: mentorId },
            data: { chiefMentorId: chiefMentorId || null }
        });

        return success(res, { mentor: updated }, 'Mentor assigned to Chief Mentor, and students updated');

    } catch (err) {
        console.error('Create mentor mapping error:', err);
        return error(res, 'Failed to update mentor mapping', 500);
    }
};

/**
 * Update student mapping
 */
export const updateMapping = async (req, res) => {
    try {
        const { mappingId } = req.params;
        const { mentorId, placementOfficerId } = req.body;

        const student = await prisma.student.findUnique({
            where: { id: mappingId }
        });

        if (!student) {
            return error(res, 'Student not found', 404);
        }

        // Validate placement officer assignment
        if (placementOfficerId && student.year < 3) {
            return error(res, 'Placement officers can only be assigned to year 3-4 students', 400);
        }

        const updated = await prisma.student.update({
            where: { id: mappingId },
            data: {
                mentorId: mentorId !== undefined ? mentorId : student.mentorId,
                placementOfficerId: placementOfficerId !== undefined ? placementOfficerId : student.placementOfficerId
            },
            include: {
                user: true,
                mentor: {
                    include: { user: true }
                },
                placementOfficer: {
                    include: { user: true }
                }
            }
        });

        return success(res, { student: updated }, 'Mapping updated successfully');
    } catch (err) {
        console.error('Update mapping error:', err);
        return error(res, 'Failed to update mapping', 500);
    }
};

/**
 * Get all students with their mappings
 */
export const getStudentMappings = async (req, res) => {
    try {
        const { year, department, hasMentor, hasPlacementOfficer } = req.query;

        const where = {};

        if (year) {
            where.year = parseInt(year);
        }

        if (department) {
            where.department = department;
        }

        if (hasMentor === 'true') {
            where.mentorId = { not: null };
        } else if (hasMentor === 'false') {
            where.mentorId = null;
        }

        if (hasPlacementOfficer === 'true') {
            where.placementOfficerId = { not: null };
        } else if (hasPlacementOfficer === 'false') {
            where.placementOfficerId = null;
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
                        phone: true
                    }
                },
                mentor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                chiefMentor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                placementOfficer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: { rollNumber: 'asc' }
        });

        return success(res, { students }, 'Student mappings fetched');
    } catch (err) {
        console.error('Get student mappings error:', err);
        return error(res, 'Failed to fetch student mappings', 500);
    }
};

/**
 * Get all mentors
 */
export const getMentors = async (req, res) => {
    try {
        const mentors = await prisma.mentor.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                },
                _count: {
                    select: { students: true }
                },
                chiefMentor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                user: { firstName: 'asc' }
            }
        });

        return success(res, { mentors }, 'Mentors fetched');
    } catch (err) {
        console.error('Get mentors error:', err);
        return error(res, 'Failed to fetch mentors', 500);
    }
};

/**
 * Get all placement officers
 */
export const getPlacementOfficers = async (req, res) => {
    try {
        const placementOfficers = await prisma.placementOfficer.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: {
                user: { firstName: 'asc' }
            }
        });

        return success(res, { placementOfficers }, 'Placement officers fetched');
    } catch (err) {
        console.error('Get placement officers error:', err);
        return error(res, 'Failed to fetch placement officers', 500);
    }
};

/**
 * Get system-wide statistics
 */
/**
 * Get system-wide statistics
 */
export const getStatistics = async (req, res) => {
    try {
        // Count users by role
        const totalStudents = await prisma.student.count();
        const totalMentors = await prisma.mentor.count();
        const totalPlacementOfficers = await prisma.placementOfficer.count();
        const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });

        // Year-wise student distribution
        const studentsByYear = await prisma.student.groupBy({
            by: ['year'],
            _count: true
        });

        // Department-wise distribution
        const studentsByDepartment = await prisma.student.groupBy({
            by: ['department'],
            _count: true
        });

        // Placement statistics
        const totalPlacements = await prisma.placement.count();
        const activePlacements = await prisma.placement.count({
            where: { applicationDeadline: { gte: new Date() } }
        });

        const totalApplications = await prisma.placementApplication.count();
        const approvedApplications = await prisma.placementApplication.count({
            where: { status: 'APPROVED' }
        });

        // Event statistics
        const totalEvents = await prisma.event.count();
        const upcomingEvents = await prisma.event.count({
            where: {
                eventDate: { gte: new Date() },
                status: 'UPCOMING'
            }
        });

        // Assignment statistics
        const totalAssignments = await prisma.assignment.count();
        const totalSubmissions = await prisma.assignmentSubmission.count();

        // Mapping statistics
        const studentsWithMentor = await prisma.student.count({
            where: { mentorId: { not: null } }
        });

        const studentsWithPlacementOfficer = await prisma.student.count({
            where: { placementOfficerId: { not: null } }
        });

        // Recent activity
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true
            }
        });

        const activeUsers24h = await prisma.user.count({
            where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        });

        // SYSTEM HEALTH CHECKS

        // 1. Database Size
        let dbSize = 'Unknown';
        try {
            const sizeResult = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
            dbSize = sizeResult[0]?.size || 'Unknown';
        } catch (e) {
            console.error('DB Size query failed', e);
        }

        // 2. Frontend Status (Vercel)
        let frontendStatus = 'Unknown';
        let frontendLatency = 0;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        if (!process.env.FRONTEND_URL) {
            frontendStatus = 'Dev / Localhost';
        } else {
            try {
                const start = Date.now();
                // Simple ping. Note: client-side CORS might block if done from browser, but this is server-side.
                // We use fetch (Node 18+)
                const ping = await fetch(frontendUrl);
                if (ping.ok || ping.status < 500) {
                    frontendStatus = 'Operational';
                    frontendLatency = Date.now() - start;
                } else {
                    frontendStatus = `Error ${ping.status}`;
                }
            } catch (e) {
                frontendStatus = 'Unreachable';
            }
        }

        // 3. Backend (Render/Local)
        const backendStats = {
            status: 'Operational',
            uptime: Math.floor(process.uptime()), // Seconds
            memoryUsage: Math.floor(process.memoryUsage().rss / 1024 / 1024), // MB
            nodeVersion: process.version,
            platform: process.platform
        };

        return success(res, {
            users: {
                totalStudents,
                totalMentors,
                totalPlacementOfficers,
                totalAdmins,
                total: totalStudents + totalMentors + totalPlacementOfficers + totalAdmins
            },
            students: {
                byYear: studentsByYear,
                byDepartment: studentsByDepartment,
                withMentor: studentsWithMentor,
                withPlacementOfficer: studentsWithPlacementOfficer,
                unmappedMentors: totalStudents - studentsWithMentor,
                unmappedPlacementOfficers: totalStudents - studentsWithPlacementOfficer
            },
            placements: {
                total: totalPlacements,
                active: activePlacements,
                totalApplications,
                approvedApplications,
                placementRate: totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(2) : 0
            },
            events: {
                total: totalEvents,
                upcoming: upcomingEvents
            },
            assignments: {
                total: totalAssignments,
                totalSubmissions,
                submissionRate: totalAssignments > 0 ? ((totalSubmissions / totalAssignments) * 100).toFixed(2) : 0
            },
            technical: {
                activeUsers24h,
                serverUptime: backendStats.uptime,
                nodeVersion: backendStats.nodeVersion,
                platform: backendStats.platform,
                memoryUsage: backendStats.memoryUsage // MB
            },
            systemHealth: {
                database: {
                    provider: 'PostgreSQL',
                    size: dbSize,
                    status: 'Connected'
                },
                backend: {
                    provider: 'Render (Node.js)',
                    ...backendStats
                },
                frontend: {
                    provider: 'Vercel (React)',
                    url: frontendUrl,
                    status: frontendStatus,
                    latency: frontendLatency
                }
            },
            recentUsers
        }, 'Statistics fetched');
    } catch (err) {
        console.error('Get statistics error:', err);
        return error(res, 'Failed to fetch statistics', 500);
    }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return error(res, 'User not found', 404);
        }

        // Prevent deleting admin users
        if (user.role === 'ADMIN') {
            return error(res, 'Cannot delete admin users', 403);
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id: userId }
        });

        return success(res, null, 'User deleted successfully');
    } catch (err) {
        console.error('Delete user error:', err);
        return error(res, 'Failed to delete user', 500);
    }
};

/**
 * Bulk assign mentors to students
 */
export const bulkAssignMentors = async (req, res) => {
    try {
        const { assignments } = req.body; // Array of { studentId, mentorId }

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return error(res, 'Assignments array is required', 400);
        }

        const results = [];

        for (const assignment of assignments) {
            try {
                const updated = await prisma.student.update({
                    where: { id: assignment.studentId },
                    data: { mentorId: assignment.mentorId }
                });
                results.push({ studentId: assignment.studentId, success: true });
            } catch (err) {
                results.push({ studentId: assignment.studentId, success: false, error: err.message });
            }
        }

        return success(res, {
            message: 'Bulk assignment completed',
            results
        }, 'Bulk assignment completed');
    } catch (err) {
        console.error('Bulk assign mentors error:', err);
        return error(res, 'Failed to bulk assign mentors', 500);
    }
};

/**
 * Get system settings
 */
export const getSettings = async (req, res) => {
    try {
        const settings = await prisma.systemSettings.findMany();
        const formatted = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.jsonValue || curr.value;
            return acc;
        }, {});
        return success(res, { settings: formatted }, 'Settings fetched');
    } catch (err) {
        console.error('Get settings error:', err);
        return error(res, 'Failed to fetch settings', 500);
    }
};

/**
 * Update system settings
 */
export const updateSettings = async (req, res) => {
    try {
        const updates = req.body;

        // Map frontend camelCase to backend snake_case keys
        const KEY_MAPPING = {
            'maintenanceMode': 'maintenance_mode',
        };

        let maintenanceUpdated = false;
        let newMaintenanceStatus = false;

        // Helper to update a single setting
        const updateSetting = async (rawKey, rawValue) => {
            const key = KEY_MAPPING[rawKey] || rawKey;
            let value = rawValue;

            // Handle objects (like smtpConfig)
            if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            } else {
                value = String(value);
            }

            await prisma.systemSettings.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });

            if (key === 'maintenance_mode') {
                maintenanceUpdated = true;
                newMaintenanceStatus = value === 'true';
            }
        };

        // Check if it's a single key-value update (legacy/simple) or bulk object
        if (updates.key && updates.value !== undefined && Object.keys(updates).length === 2) {
            await updateSetting(updates.key, updates.value);
        } else {
            // Treat as bulk object key-value pairs
            // If the frontend wrapped it in 'settings', unwrap it (backward compatibility)
            const dataToUpdate = updates.settings || updates;

            for (const [key, value] of Object.entries(dataToUpdate)) {
                await updateSetting(key, value);
            }
        }

        // If maintenance mode is toggled, emit socket event
        if (maintenanceUpdated) {
            const io = req.app.get('io');
            if (io) {
                io.emit('maintenance:status', {
                    maintenanceMode: newMaintenanceStatus
                });
            }
        }

        return success(res, null, 'System settings updated');
    } catch (err) {
        console.error('Update settings error:', err);
        return error(res, 'Failed to update system settings', 500);
    }
};

/**
 * Get all announcements
 */
export const getAnnouncements = async (req, res) => {
    try {
        const { archived } = req.query;
        const isArchived = archived === 'true';

        const announcements = await prisma.announcement.findMany({
            where: { isArchived },
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: { firstName: true, lastName: true, role: true }
                }
            }
        });
        return success(res, { announcements }, 'Announcements fetched');
    } catch (err) {
        console.error('Get announcements error:', err);
        return error(res, 'Failed to fetch announcements', 500);
    }
};

/**
 * Create announcement
 */
export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, targetRole, priority } = req.body;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                targetRole: targetRole === 'ALL' ? null : targetRole,
                priority: priority || 'MEDIUM',
                createdById: req.userId
            }
        });

        return success(res, { announcement }, 'Announcement created');
    } catch (err) {
        console.error('Create announcement error:', err);
        return error(res, 'Failed to create announcement', 500);
    }
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id } });
        return success(res, null, 'Announcement deleted');
    } catch (err) {
        console.error('Delete announcement error:', err);
        return error(res, 'Failed to delete announcement', 500);
    }
};

/**
 * Export all user data
 */
export const exportUserData = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                student: true,
                mentor: true,
                placementOfficer: true
            }
        });

        // Sanitize
        const sanitized = users.map(u => {
            const { passwordHash, ...rest } = u;
            return rest;
        });

        return success(res, { users: sanitized }, 'Data exported');
    } catch (err) {
        console.error('Export data error:', err);
        return error(res, 'Failed to export data', 500);
    }
};

/**
 * Get system logs
 */
export const getSystemLogs = async (req, res) => {
    try {
        // Fetch last 100 analytics logs
        const logs = await prisma.analyticsLog.findMany({
            take: 100,
            orderBy: { loggedAt: 'desc' },
            include: {
                student: {
                    select: {
                        user: { select: { firstName: true, lastName: true } }
                    }
                }
            }
        });
        return success(res, { logs }, 'Logs fetched');
    } catch (err) {
        console.error('Get logs error:', err);
        return error(res, 'Failed to fetch logs', 500);
    }
};

/**
 * Toggle user block status
 */
export const toggleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isBlocked } = req.body;

        if (typeof isBlocked !== 'boolean') return error(res, 'isBlocked status required', 400);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return error(res, 'User not found', 404);
        if (user.role === 'ADMIN') return error(res, 'Cannot block super admin', 403);

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { isBlocked },
            select: { id: true, email: true, isBlocked: true }
        });

        return success(res, { user: updated }, `User ${isBlocked ? 'blocked' : 'unblocked'}`);
    } catch (err) {
        console.error('Block user error:', err);
        return error(res, 'Failed to update block status', 500);
    }
};

/**
 * Archive announcement
 */
export const archiveAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.announcement.update({
            where: { id },
            data: { isArchived: true }
        });
        return success(res, null, 'Announcement archived');
    } catch (err) {
        console.error('Archive announcement error:', err);
        return error(res, 'Failed to archive announcement', 500);
    }
};

/**
 * Export users to Excel
 */
export const exportUsersExcel = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { student: true, mentor: true, placementOfficer: true }
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Users');

        sheet.columns = [
            { header: 'ID', key: 'id', width: 30 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Details', key: 'details', width: 30 },
            { header: 'Last Login', key: 'lastLogin', width: 20 },
        ];

        users.forEach(u => {
            const row = {
                id: u.id,
                role: u.role,
                email: u.email,
                name: `${u.firstName} ${u.lastName}`,
                phone: u.phone || '-',
                status: u.isBlocked ? 'BLOCKED' : 'ACTIVE',
                department: '',
                details: '',
                lastLogin: u.updatedAt ? u.updatedAt.toISOString().split('T')[0] : '-'
            };

            if (u.student) {
                row.department = u.student.department;
                row.details = `Year: ${u.student.year}, Roll: ${u.student.rollNumber}`;
            } else if (u.mentor) {
                row.department = u.mentor.department;
                row.details = `Spec: ${u.mentor.specialization || '-'}`;
            } else if (u.placementOfficer) {
                row.department = u.placementOfficer.department || '-';
                row.details = `Desig: ${u.placementOfficer.designation || '-'}`;
            }

            sheet.addRow(row);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Export Excel error:', err);
        return error(res, 'Failed to export Excel', 500);
    }
};

/**
 * Get all chats for admin view
 */
export const getAdminChats = async (req, res) => {
    try {
        const messages = await prisma.message.findMany({
            take: 100,
            orderBy: { sentAt: 'desc' },
            include: {
                sender: { select: { firstName: true, lastName: true, role: true } },
                receiver: { select: { firstName: true, lastName: true, role: true } }
            }
        });
        return success(res, { messages }, 'Chats fetched');
    } catch (err) {
        console.error('Get admin chats error:', err);
        return error(res, 'Failed to fetch chats', 500);
    }
};

/**
 * Update system settings
 */

