import { PrismaClient } from '@prisma/client';
import { uploadResume, uploadAssignment } from '../services/upload.service.js';
import { analyzeResume as analyzeResumeAI } from '../services/openai.service.js';
import { getCategorizedEmails } from '../services/gmail.service.js';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Get student dashboard stats
 */
export const getDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                user: true,
                mentor: { include: { user: true } },
                placementOfficer: { include: { user: true } }
            }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        // Get pending assignments count
        let pendingAssignments = 0;
        if (student.mentorId) {
            pendingAssignments = await prisma.assignment.count({
                where: {
                    mentorId: student.mentorId,
                    submissions: {
                        none: { studentId: student.id }
                    },
                    dueDate: { gte: new Date() }
                }
            });
        }

        // Get upcoming events count
        const upcomingEvents = await prisma.event.count({
            where: {
                eventDate: { gte: new Date() },
                status: 'UPCOMING'
            }
        });

        // Get eligible placement drives count
        // Fetch valid placements and filter in memory to avoid Prisma JSON filter issues
        const activePlacements = await prisma.placement.findMany({
            where: {
                applicationDeadline: { gte: new Date() }
            },
            select: {
                eligibilityCriteria: true
            }
        });

        const eligiblePlacements = activePlacements.filter(p => {
            const criteria = p.eligibilityCriteria;
            if (!criteria || !Array.isArray(criteria.allowedYears)) return false;
            return criteria.allowedYears.includes(student.year);
        }).length;

        // Get recent activity
        const recentActivity = await prisma.analyticsLog.findMany({
            where: { studentId: student.id },
            orderBy: { loggedAt: 'desc' },
            take: 10
        });

        // Get gate pass status
        const pendingGatePasses = await prisma.gatePass.count({
            where: {
                studentId: student.id,
                status: 'PENDING'
            }
        });

        // Get announcements
        const announcements = await prisma.announcement.findMany({
            where: {
                isArchived: false,
                OR: [
                    { targetRole: null },
                    { targetRole: 'STUDENT' }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return success(res, {
            student: {
                ...student,
                user: {
                    ...student.user,
                    passwordHash: undefined
                }
            },
            stats: {
                cgpa: student.cgpa || 0,
                pendingAssignments,
                upcomingEvents,
                eligiblePlacements,
                pendingGatePasses
            },
            recentActivity,
            announcements
        }, 'Dashboard stats fetched');
    } catch (err) {
        console.error('Get dashboard error:', err);
        return error(res, 'Failed to fetch dashboard data', 500);
    }
};

/**
 * Update student profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { phone, skills, cgpa, linkedInUrl, githubUrl, leetcodeUrl, about, certificates, profilePicture } = req.body;

        const student = await prisma.student.findUnique({
            where: { userId },
            include: { user: true }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        // Update user info
        const userUpdateData = {};
        if (phone) userUpdateData.phone = phone;
        if (profilePicture) {
            if (student.user.profilePicture) {
                return error(res, 'Profile picture cannot be changed once set', 400);
            }
            userUpdateData.profilePicture = profilePicture;
        }

        if (Object.keys(userUpdateData).length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: userUpdateData
            });
        }

        // Update student info
        const updatedStudent = await prisma.student.update({
            where: { id: student.id },
            data: {
                skills: skills || student.skills,
                cgpa: cgpa !== undefined ? parseFloat(cgpa) : student.cgpa,
                linkedInUrl,
                githubUrl,
                leetcodeUrl,
                about,
                certificates: certificates || student.certificates
            },
            include: {
                user: true,
                mentor: { include: { user: true } },
                placementOfficer: { include: { user: true } }
            }
        });

        return success(res, { student: updatedStudent }, 'Profile updated successfully');
    } catch (err) {
        console.error('Update profile error:', err);
        return error(res, 'Failed to update profile', 500);
    }
};

/**
 * Get eligible placement drives
 */
export const getPlacements = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, search } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        // Build where clause
        const where = {
            applicationDeadline: { gte: new Date() }
        };

        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { jobRole: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get all placements
        let placements = await prisma.placement.findMany({
            where,
            include: {
                placementOfficer: {
                    include: { user: true }
                },
                applications: {
                    where: { studentId: student.id }
                }
            },
            orderBy: { applicationDeadline: 'asc' }
        });

        // Filter by eligibility criteria
        placements = placements.filter(placement => {
            const criteria = placement.eligibilityCriteria;

            // Check year
            if (!criteria.allowedYears?.includes(student.year)) {
                return false;
            }

            // Check CGPA
            if (criteria.minCGPA && student.cgpa < criteria.minCGPA) {
                return false;
            }

            // Check department
            if (criteria.departments?.length > 0 && !criteria.departments.includes(student.department)) {
                return false;
            }

            return true;
        });

        // Filter by application status if requested
        if (status) {
            placements = placements.filter(p => {
                if (status === 'applied') return p.applications.length > 0;
                if (status === 'not_applied') return p.applications.length === 0;
                return true;
            });
        }

        return success(res, { placements }, 'Placements fetched');
    } catch (err) {
        console.error('Get placements error:', err);
        return error(res, 'Failed to fetch placements', 500);
    }
};

/**
 * Apply for placement drive
 */
export const applyForPlacement = async (req, res) => {
    try {
        const userId = req.userId;
        const { placementId } = req.params;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        // Get placement
        const placement = await prisma.placement.findUnique({
            where: { id: placementId }
        });

        if (!placement) {
            return error(res, 'Placement not found', 404);
        }

        // Check if deadline passed
        if (new Date() > placement.applicationDeadline) {
            return error(res, 'Application deadline has passed', 400);
        }

        // Check eligibility
        const criteria = placement.eligibilityCriteria;

        if (!criteria.allowedYears?.includes(student.year)) {
            return error(res, 'You are not eligible for this placement (year requirement)', 403);
        }

        if (criteria.minCGPA && student.cgpa < criteria.minCGPA) {
            return error(res, `Minimum CGPA required: ${criteria.minCGPA}`, 403);
        }

        if (criteria.departments?.length > 0 && !criteria.departments.includes(student.department)) {
            return error(res, 'Your department is not eligible for this placement', 403);
        }

        // Check if already applied
        const existingApplication = await prisma.placementApplication.findUnique({
            where: {
                placementId_studentId: {
                    placementId,
                    studentId: student.id
                }
            }
        });

        if (existingApplication) {
            return error(res, 'You have already applied for this placement', 400);
        }

        // Create application
        const application = await prisma.placementApplication.create({
            data: {
                placementId,
                studentId: student.id,
                status: 'PENDING'
            },
            include: {
                placement: true
            }
        });

        // Log activity
        await prisma.analyticsLog.create({
            data: {
                studentId: student.id,
                metricType: 'PLACEMENT_APPLICATION',
                value: placement.companyName
            }
        });

        return success(res, { application }, 'Application submitted successfully');
    } catch (err) {
        console.error('Apply for placement error:', err);
        return error(res, 'Failed to submit application', 500);
    }
};

/**
 * Get student profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const student = await prisma.student.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        profilePicture: true,
                        role: true,
                        preferences: true
                    }
                },
                mentor: { include: { user: true } },
                placementOfficer: { include: { user: true } }
            }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        return success(res, { student }, 'Profile fetched');
    } catch (err) {
        console.error('Get profile error:', err);
        return error(res, 'Failed to fetch profile', 500);
    }
};

/**
 * Get events
 */
export const getEvents = async (req, res) => {
    try {
        const userId = req.userId;
        const { filter } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        const where = {};

        if (filter === 'upcoming') {
            where.eventDate = { gte: new Date() };
            where.status = 'UPCOMING';
        } else if (filter === 'registered') {
            where.registrations = {
                some: { studentId: student.id }
            };
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                registrations: {
                    where: { studentId: student.id }
                }
            },
            orderBy: { eventDate: 'asc' }
        });

        return success(res, { events }, 'Events fetched');
    } catch (err) {
        console.error('Get events error:', err);
        return error(res, 'Failed to fetch events', 500);
    }
};

/**
 * Register for event
 */
export const registerForEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventId } = req.params;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                registrations: true
            }
        });

        if (!event) {
            return error(res, 'Event not found', 404);
        }

        // Check if event is in the past
        if (new Date() > event.eventDate) {
            return error(res, 'Cannot register for past events', 400);
        }

        // Check if max participants reached
        if (event.maxParticipants && event.registrations.length >= event.maxParticipants) {
            return error(res, 'Event is full', 400);
        }

        // Check if already registered
        const existingRegistration = await prisma.eventRegistration.findUnique({
            where: {
                eventId_studentId: {
                    eventId,
                    studentId: student.id
                }
            }
        });

        if (existingRegistration) {
            return error(res, 'Already registered for this event', 400);
        }

        // Create registration
        const registration = await prisma.eventRegistration.create({
            data: {
                eventId,
                studentId: student.id,
                status: 'PENDING'
            },
            include: {
                event: true
            }
        });

        // Log activity
        await prisma.analyticsLog.create({
            data: {
                studentId: student.id,
                metricType: 'EVENT_REGISTRATION',
                value: event.title
            }
        });

        return success(res, { registration }, 'Registration submitted successfully');
    } catch (err) {
        console.error('Register for event error:', err);
        return error(res, 'Failed to register for event', 500);
    }
};

/**
 * Get assignments
 */
export const getAssignments = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        if (!student.mentorId) {
            return success(res, { assignments: [] }, 'Assignments fetched');
        }

        const where = { mentorId: student.mentorId };

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                mentor: { include: { user: true } },
                submissions: {
                    where: { studentId: student.id }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        // Filter by status
        let filteredAssignments = assignments;
        if (status === 'pending') {
            filteredAssignments = assignments.filter(a => a.submissions.length === 0 && new Date() < a.dueDate);
        } else if (status === 'submitted') {
            filteredAssignments = assignments.filter(a => a.submissions.length > 0);
        } else if (status === 'overdue') {
            filteredAssignments = assignments.filter(a => a.submissions.length === 0 && new Date() > a.dueDate);
        }

        return success(res, { assignments: filteredAssignments }, 'Assignments fetched');
    } catch (err) {
        console.error('Get assignments error:', err);
        return error(res, 'Failed to fetch assignments', 500);
    }
};

/**
 * Submit assignment
 */
export const submitAssignment = async (req, res) => {
    try {
        const userId = req.userId;
        const { assignmentId } = req.params;
        const file = req.file;

        if (!file) {
            return error(res, 'No file uploaded', 400);
        }

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId }
        });

        if (!assignment) {
            return error(res, 'Assignment not found', 404);
        }

        // Check if due date has passed
        if (new Date() > assignment.dueDate) {
            return error(res, 'Assignment is locked due to deadline', 400);
        }
        const existingSubmission = await prisma.assignmentSubmission.findFirst({
            where: {
                assignmentId,
                studentId: student.id
            }
        });

        if (existingSubmission) {
            return error(res, 'Assignment already submitted', 400);
        }

        // Upload file to S3
        const uploadResult = await uploadAssignment(file, student.id, assignmentId);

        // Create submission
        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId,
                studentId: student.id,
                submissionUrl: uploadResult.url
            },
            include: {
                assignment: true
            }
        });

        // Log activity
        await prisma.analyticsLog.create({
            data: {
                studentId: student.id,
                metricType: 'ASSIGNMENT_SUBMIT',
                value: assignment.title
            }
        });

        return success(res, { submission }, 'Assignment submitted successfully');
    } catch (err) {
        console.error('Submit assignment error:', err);
        return error(res, 'Failed to submit assignment', 500);
    }
};

/**
 * Get study materials
 */
export const getStudyMaterials = async (req, res) => {
    try {
        const userId = req.userId;
        const { subject, year } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        const where = {};

        if (subject) {
            where.subject = { contains: subject, mode: 'insensitive' };
        }

        if (year) {
            where.year = parseInt(year);
        } else {
            where.year = student.year;
        }

        const materials = await prisma.studyMaterial.findMany({
            where,
            include: {
                uploadedBy: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return success(res, { materials }, 'Study materials fetched');
    } catch (err) {
        console.error('Get study materials error:', err);
        return error(res, 'Failed to fetch study materials', 500);
    }
};

/**
 * Get skills tests
 */
export const getSkillsTests = async (req, res) => {
    try {
        const userId = req.userId;
        const student = await prisma.student.findUnique({
            where: { userId }
        });

        if (!student) {
            return error(res, 'Student profile not found', 404);
        }

        const tests = await prisma.skillsTest.findMany({
            include: {
                createdBy: {
                    include: { user: true }
                },
                attempts: {
                    where: { studentId: student.id }
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
 * Attempt skills test
 */
export const attemptTest = async (req, res) => {
    try {
        const userId = req.userId;
        const { testId } = req.params;
        const { answers } = req.body;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        const test = await prisma.skillsTest.findUnique({
            where: { id: testId }
        });

        if (!test) {
            return error(res, 'Test not found', 404);
        }

        // Calculate score
        const questions = test.questions;
        let correctAnswers = 0;

        questions.forEach((question, index) => {
            if (question.correctAnswer === answers[index]) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / questions.length) * test.totalMarks;

        // Save attempt
        const attempt = await prisma.testAttempt.create({
            data: {
                testId,
                studentId: student.id,
                score,
                answers
            },
            include: {
                test: true
            }
        });

        // Log activity
        await prisma.analyticsLog.create({
            data: {
                studentId: student.id,
                metricType: 'TEST_TAKEN',
                value: `${test.title}: ${score}/${test.totalMarks}`
            }
        });

        return success(res, {
            attempt,
            score,
            totalMarks: test.totalMarks,
            percentage: (score / test.totalMarks) * 100
        }, 'Test submitted successfully');
    } catch (err) {
        console.error('Attempt test error:', err);
        return error(res, 'Failed to submit test', 500);
    }
};

/**
 * Analyze resume
 */
export const analyzeResume = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return error(res, 'No file uploaded', 400);
        }

        // Extract text from PDF or DOCX
        let resumeText = '';

        if (file.mimetype === 'application/pdf') {
            const pdfData = await pdf(file.buffer);
            resumeText = pdfData.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            resumeText = result.value;
        } else {
            return error(res, 'Invalid file format. Only PDF and DOCX are supported', 400);
        }

        // Analyze using OpenAI
        const analysis = await analyzeResumeAI(resumeText);

        // Optionally save resume
        const student = await prisma.student.findUnique({
            where: { userId: req.userId }
        });

        if (student) {
            const uploadResult = await uploadResume(file, req.userId);

            await prisma.student.update({
                where: { id: student.id },
                data: { resumeUrl: uploadResult.url }
            });
        }

        return success(res, { analysis }, 'Resume analyzed successfully');
    } catch (err) {
        console.error('Analyze resume error:', err);
        return error(res, 'Failed to analyze resume', 500);
    }
};

/**
 * Get emails
 */
export const getEmails = async (req, res) => {
    try {
        const userId = req.userId;
        const { category, limit = 50 } = req.query;

        const emails = await getCategorizedEmails(userId, category, parseInt(limit));

        return success(res, { emails }, 'Emails fetched');
    } catch (err) {
        console.error('Get emails error:', err);
        return error(res, 'Failed to fetch emails', 500);
    }
};

/**
 * Upload event certificate
 */
export const uploadEventCertificate = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventId } = req.params;
        const { certificateUrl } = req.body;

        if (!certificateUrl) return error(res, 'Certificate URL required', 400);

        const student = await prisma.student.findUnique({ where: { userId } });

        const registration = await prisma.eventRegistration.findUnique({
            where: {
                eventId_studentId: {
                    eventId,
                    studentId: student.id
                }
            }
        });

        if (!registration) return error(res, 'Registration not found', 404);

        // Allow uploading if status is APPROVED (or COMPLETED?) 
        // Assuming APPROVED means they were allowed to attend.
        // Or maybe check EventStatus?
        // Let's stick to registration status 'APPROVED'
        if (registration.status !== 'APPROVED') return error(res, 'Registration not approved', 400);

        const updated = await prisma.eventRegistration.update({
            where: { id: registration.id },
            data: {
                certificateUrl,
                certificateUploadedAt: new Date()
            }
        });

        return success(res, { registration: updated }, 'Certificate uploaded successfully');
    } catch (err) {
        console.error('Upload certificate error:', err);
        return error(res, 'Failed to upload certificate', 500);
    }
};

/**
 * Get attendance records
 */
export const getAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const student = await prisma.student.findUnique({ where: { userId } });

        if (!student) return error(res, 'Student not found', 404);

        const records = await prisma.attendanceRecord.findMany({
            where: { studentId: student.id },
            orderBy: { date: 'desc' }
        });

        // Calculate stats
        const total = records.length;
        const present = records.filter(r => r.status === 'PRESENT').length;
        const absent = records.filter(r => r.status === 'ABSENT').length;
        const od = records.filter(r => r.status === 'ON_DUTY').length;
        const leave = records.filter(r => r.status === 'LEAVE').length;

        // Assuming OD counts as present for Percentage? Or just Present?
        // Usually OD (On Duty) is considered Present.
        const percentage = total > 0 ? ((present + od) / total) * 100 : 0;

        return success(res, {
            records,
            stats: {
                total,
                present,
                absent,
                od,
                leave,
                percentage
            }
        }, 'Attendance fetched');
    } catch (err) {
        console.error('Get attendance error:', err);
        return error(res, 'Failed to fetch attendance', 500);
    }
};

/**
 * Apply for gate pass
 */
export const applyForGatePass = async (req, res) => {
    try {
        const userId = req.userId;
        const { reason, fromDate, toDate } = req.body;

        if (!reason || !fromDate || !toDate) {
            return error(res, 'Reason, from date, and to date are required', 400);
        }

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        if (!student.mentorId) {
            return error(res, 'No mentor assigned. Cannot apply for gate pass', 400);
        }

        const gatePass = await prisma.gatePass.create({
            data: {
                studentId: student.id,
                reason,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                status: 'PENDING'
            },
            include: {
                student: {
                    include: { user: true }
                }
            }
        });

        return success(res, { gatePass }, 'Gate pass application submitted successfully');
    } catch (err) {
        console.error('Apply for gate pass error:', err);
        return error(res, 'Failed to apply for gate pass', 500);
    }
};

/**
 * Get gate passes
 */
export const getGatePasses = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const student = await prisma.student.findUnique({
            where: { userId }
        });

        const where = { studentId: student.id };

        if (status) {
            where.status = status;
        }

        const gatePasses = await prisma.gatePass.findMany({
            where,
            include: {
                approvedBy: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return success(res, { gatePasses }, 'Gate passes fetched');
    } catch (err) {
        console.error('Get gate passes error:', err);
        return error(res, 'Failed to fetch gate passes', 500);
    }
};

/**
 * Get user settings
 */
export const getSettings = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        if (!user) {
            return error(res, 'User not found', 404);
        }

        return success(res, { preferences: user.preferences }, 'Settings fetched');
    } catch (err) {
        console.error('Get settings error:', err);
        return error(res, 'Failed to fetch settings', 500);
    }
};

/**
 * Update user settings
 */
export const updateSettings = async (req, res) => {
    try {
        const userId = req.userId;
        const { emailNotifs, pushNotifs, theme } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                preferences: {
                    emailNotifs,
                    pushNotifs,
                    theme
                }
            }
        });

        return success(res, { preferences: user.preferences }, 'Settings updated successfully');
    } catch (err) {
        console.error('Update settings error:', err);
        return error(res, 'Failed to update settings', 500);
    }
};
