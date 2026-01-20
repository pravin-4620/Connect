import { PrismaClient } from '@prisma/client';
import { uploadStudyMaterial } from '../services/upload.service.js';
import { success, error } from '../utils/response.js';

const prisma = new PrismaClient();

/**
 * Get mentor dashboard stats
 */
export const getDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        const mentor = await prisma.mentor.findUnique({
            where: { userId },
            include: {
                user: true,
                students: {
                    include: {
                        user: true,
                        placementApplications: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            }
        });

        if (!mentor) {
            return error(res, 'Mentor profile not found', 404);
        }

        // Get pending approvals count
        // Get pending approvals count (GatePass only for stats, or sum of GatePass + Events?)
        // Usually stats show total pending items.
        const pendingGatePasses = await prisma.gatePass.count({
            where: {
                OR: [
                    { student: { mentorId: mentor.id }, status: 'PENDING' },
                    { student: { chiefMentorId: mentor.id }, status: 'MENTOR_APPROVED' }
                ]
            }
        });

        const pendingEvents = await prisma.eventRegistration.count({
            where: {
                OR: [
                    { event: { createdById: mentor.id }, status: 'PENDING' },
                    { student: { chiefMentorId: mentor.id }, status: 'MENTOR_APPROVED' }
                ]
            }
        });

        const pendingApprovals = pendingGatePasses + pendingEvents;

        // Get upcoming events
        const upcomingEvents = await prisma.event.count({
            where: {
                createdById: mentor.id,
                eventDate: { gte: new Date() },
                status: 'UPCOMING'
            }
        });

        // Recent Activity
        const recentGatePasses = await prisma.gatePass.findMany({
            where: { student: { mentorId: mentor.id } },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { student: { include: { user: true } } }
        });

        const recentSubmissions = await prisma.assignmentSubmission.findMany({
            where: { assignment: { mentorId: mentor.id } },
            orderBy: { submittedAt: 'desc' },
            take: 3,
            include: { student: { include: { user: true } }, assignment: true }
        });

        const activity = [
            ...recentGatePasses.map(g => ({
                id: `gp-${g.id}`,
                type: 'GATE_PASS',
                message: `Gate pass requested by ${g.student.user.firstName} ${g.student.user.lastName}`,
                time: g.createdAt
            })),
            ...recentSubmissions.map(s => ({
                id: `sub-${s.id}`,
                type: 'ASSIGNMENT',
                message: `Assignment submitted by ${s.student.user.firstName} ${s.student.user.lastName}`,
                time: s.submittedAt
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        // Make time relative string (simplified)
        const formatTime = (date) => {
            const diff = Date.now() - new Date(date).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 60) return `${mins} mins ago`;
            const hours = Math.floor(mins / 60);
            if (hours < 24) return `${hours} hours ago`;
            return `${Math.floor(hours / 24)} days ago`;
        };

        const activityWithTime = activity.map(a => ({ ...a, time: formatTime(a.time) }));

        // Placement Stats (Basic calculation)
        const placedCount = mentor.students.filter(s => s.placementApplications.length > 0).length;
        const totalStudents = mentor.students.length;
        const unplacedCount = totalStudents - placedCount;

        // Get announcements
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    { targetRole: 'MENTOR' },
                    { targetRole: null }
                ],
                isArchived: false
            },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        return success(res, {
            ...mentor, // Return mentor details at root or inside a wrapper if frontend expects
            // Frontend Dashboard.tsx expects data structure: { totalStudents, pendingApprovals, ... } directly in data.data or similar
            // API wrapper puts this object in `data`.

            totalStudents,
            pendingApprovals: pendingGatePasses + pendingEventRegistrations,
            upcomingEvents,
            averageAttendance: 85, // Mock
            attendanceData: [
                { name: 'Mon', present: Math.floor(totalStudents * 0.9) },
                { name: 'Tue', present: Math.floor(totalStudents * 0.85) },
                { name: 'Wed', present: Math.floor(totalStudents * 0.88) },
                { name: 'Thu', present: Math.floor(totalStudents * 0.92) },
                { name: 'Fri', present: Math.floor(totalStudents * 0.82) },
            ],
            placementStats: [
                { name: 'Placed', value: placedCount },
                { name: 'Unplaced', value: unplacedCount },
            ],
            activity: activityWithTime,
            announcements
        }, 'Dashboard stats fetched');
    } catch (err) {
        console.error('Get mentor dashboard error:', err);
        return error(res, 'Failed to fetch dashboard data', 500);
    }
};

/**
 * Get assigned students
 */
export const getStudents = async (req, res) => {
    try {
        const userId = req.userId;
        const { search, year, department } = req.query;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        if (!mentor) {
            return error(res, 'Mentor profile not found', 404);
        }

        const where = { mentorId: mentor.id };

        if (year) {
            where.year = parseInt(year);
        }

        if (department) {
            where.department = department;
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
                assignmentSubmissions: {
                    include: {
                        assignment: true
                    }
                },
                testAttempts: true,
                placementApplications: true
            },
            orderBy: { rollNumber: 'asc' }
        });

        // Enrich student data with derived status
        const enrichedStudents = students.map(student => {
            const isPlaced = student.placementApplications.some(app => app.status === 'APPROVED');
            return {
                ...student,
                placementStatus: isPlaced ? 'PLACED' : 'UNPLACED',
                attendance: student.attendance || 0
            };
        });

        return success(res, { students: enrichedStudents }, 'Students fetched');
    } catch (err) {
        console.error('Get students error:', err);
        return error(res, 'Failed to fetch students', 500);
    }
};

/**
 * Update student attendance
 */
export const updateAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { studentId } = req.params;
        const { attendance } = req.body;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return error(res, 'Student not found', 404);
        }

        if (student.mentorId !== mentor.id) {
            return error(res, 'You can only update attendance for your students', 403);
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: { attendance: parseFloat(attendance) }
        });

        return success(res, { student: updatedStudent }, 'Attendance updated successfully');
    } catch (err) {
        console.error('Update attendance error:', err);
        return error(res, 'Failed to update attendance', 500);
    }
};

/**
 * Mark daily attendance
 */
export const markDailyAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { studentId } = req.params;
        const { date, status } = req.body;

        if (!['PRESENT', 'ABSENT', 'ON_DUTY', 'LEAVE'].includes(status)) {
            return error(res, 'Invalid status', 400);
        }

        const mentor = await prisma.mentor.findUnique({ where: { userId } });
        const student = await prisma.student.findUnique({ where: { id: studentId } });

        if (!student || student.mentorId !== mentor.id) {
            return error(res, 'Unauthorized or student not found', 403);
        }

        const recordDate = date ? new Date(date) : new Date();
        // Normalize time to start of day to avoid duplicates on same day
        recordDate.setHours(0, 0, 0, 0);

        const record = await prisma.attendanceRecord.upsert({
            where: {
                studentId_date: {
                    studentId,
                    date: recordDate
                }
            },
            update: { status },
            create: {
                studentId,
                date: recordDate,
                status
            }
        });

        return success(res, { record }, 'Attendance marked');
    } catch (err) {
        console.error('Mark attendance error:', err);
        return error(res, 'Failed to mark attendance', 500);
    }
};

/**
 * Get attendance records
 */
export const getAttendanceRecords = async (req, res) => {
    try {
        const userId = req.userId;
        const { studentId } = req.params;

        const mentor = await prisma.mentor.findUnique({ where: { userId } });
        const student = await prisma.student.findUnique({ where: { id: studentId } });

        if (!student || student.mentorId !== mentor.id) {
            return error(res, 'Unauthorized', 403);
        }

        const records = await prisma.attendanceRecord.findMany({
            where: { studentId },
            orderBy: { date: 'desc' }
        });

        return success(res, { records }, 'Records fetched');
    } catch (err) {
        console.error('Get records error:', err);
        return error(res, 'Failed to fetch records', 500);
    }
};

/**
 * Get batch attendance for a specific date
 */
export const getBatchAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { date } = req.query;

        if (!date) {
            return error(res, 'Date is required', 400);
        }

        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(queryDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const mentor = await prisma.mentor.findUnique({ where: { userId } });
        if (!mentor) return error(res, 'Mentor not found', 404);

        const students = await prisma.student.findMany({
            where: { mentorId: mentor.id },
            include: {
                user: true,
                attendanceRecords: {
                    where: {
                        date: {
                            gte: queryDate,
                            lt: nextDate
                        }
                    }
                }
            },
            orderBy: { rollNumber: 'asc' }
        });

        const attendance = students.map(s => ({
            studentId: s.id,
            studentName: `${s.user.firstName} ${s.user.lastName}`,
            rollNumber: s.rollNumber,
            status: s.attendanceRecords[0]?.status || 'PRESENT', // Default to PRESENT if no record
            isMarked: s.attendanceRecords.length > 0
        }));

        return success(res, { attendance }, 'Batch attendance fetched');
    } catch (err) {
        console.error('Get batch attendance error:', err);
        return error(res, 'Failed to fetch batch attendance', 500);
    }
};

/**
 * Mark bulk attendance
 */
export const markBulkAttendance = async (req, res) => {
    try {
        const userId = req.userId;
        const { date, records } = req.body;

        if (!date || !Array.isArray(records)) {
            return error(res, 'Date and records array are required', 400);
        }

        const recordDate = new Date(date);
        recordDate.setHours(0, 0, 0, 0);

        const mentor = await prisma.mentor.findUnique({ where: { userId } });
        if (!mentor) return error(res, 'Mentor not found', 404);

        await prisma.$transaction(
            records.map(r =>
                prisma.attendanceRecord.upsert({
                    where: {
                        studentId_date: {
                            studentId: r.studentId,
                            date: recordDate
                        }
                    },
                    update: { status: r.status },
                    create: {
                        studentId: r.studentId,
                        date: recordDate,
                        status: r.status
                    }
                })
            )
        );

        return success(res, null, 'Bulk attendance marked successfully');
    } catch (err) {
        console.error('Bulk attendance error:', err);
        return error(res, 'Failed to mark bulk attendance', 500);
    }
};




/**
 * Get mentor emails
 */
export const getEmails = async (req, res) => {
    try {
        const userId = req.userId;
        const { category } = req.query;

        const where = { userId };
        if (category && category !== 'ALL') {
            where.category = category.toUpperCase();
        }

        const emails = await prisma.email.findMany({
            where,
            orderBy: { receivedAt: 'desc' }
        });

        return success(res, { emails }, 'Emails fetched');
    } catch (err) {
        console.error('Get emails error:', err);
        return error(res, 'Failed to fetch emails', 500);
    }
};

/**
 * Get student by ID (detailed view)
 */
export const getStudentById = async (req, res) => {
    try {
        const userId = req.userId;
        const { studentId } = req.params;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: true,
                assignmentSubmissions: {
                    include: {
                        assignment: true
                    },
                    orderBy: { submittedAt: 'desc' }
                },
                testAttempts: {
                    include: {
                        test: true
                    },
                    orderBy: { attemptedAt: 'desc' }
                },
                gatePasses: {
                    orderBy: { createdAt: 'desc' }
                },
                eventRegistrations: {
                    include: {
                        event: true
                    }
                },
                placementApplications: {
                    include: {
                        placement: true
                    }
                },
                analyticsLogs: {
                    orderBy: { loggedAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!student) {
            return error(res, 'Student not found', 404);
        }

        // Verify this student is assigned to the mentor
        if (student.mentorId !== mentor.id) {
            return error(res, 'This student is not assigned to you', 403);
        }

        return success(res, { student }, 'Student details fetched');
    } catch (err) {
        console.error('Get student by ID error:', err);
        return error(res, 'Failed to fetch student details', 500);
    }
};

/**
 * Create event
 */
export const createEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, eventDate, location, url, maxParticipants } = req.body;

        if (!title || !description || !eventDate) {
            return error(res, 'Title, description, and event date are required', 400);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const event = await prisma.event.create({
            data: {
                title,
                description,
                eventDate: new Date(eventDate),
                location,
                url,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
                createdById: mentor.id,
                createdByRole: 'MENTOR',
                status: 'UPCOMING'
            }
        });

        return success(res, { event }, 'Event created successfully');
    } catch (err) {
        console.error('Create event error:', err);
        return error(res, 'Failed to create event', 500);
    }
};

/**
 * Update event
 */
export const updateEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventId } = req.params;
        const { title, description, eventDate, location, url, maxParticipants, status } = req.body;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        // Verify event belongs to mentor
        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return error(res, 'Event not found', 404);
        }

        if (event.createdById !== mentor.id) {
            return error(res, 'You can only update your own events', 403);
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title: title || event.title,
                description: description || event.description,
                eventDate: eventDate ? new Date(eventDate) : event.eventDate,
                location: location !== undefined ? location : event.location,
                url: url !== undefined ? url : event.url,
                maxParticipants: maxParticipants !== undefined ? parseInt(maxParticipants) : event.maxParticipants,
                status: status || event.status
            }
        });

        return success(res, { event: updatedEvent }, 'Event updated successfully');
    } catch (err) {
        console.error('Update event error:', err);
        return error(res, 'Failed to update event', 500);
    }
};

/**
 * Delete event
 */
export const deleteEvent = async (req, res) => {
    try {
        const userId = req.userId;
        const { eventId } = req.params;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return error(res, 'Event not found', 404);
        }

        if (event.createdById !== mentor.id) {
            return error(res, 'You can only delete your own events', 403);
        }

        await prisma.event.delete({
            where: { id: eventId }
        });

        return success(res, null, 'Event deleted successfully');
    } catch (err) {
        console.error('Delete event error:', err);
        return error(res, 'Failed to delete event', 500);
    }
};

/**
 * Get pending approvals (gate passes and event registrations)
 */
export const getApprovals = async (req, res) => {
    try {
        const userId = req.userId;
        const { type } = req.query;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        let gatePasses = [];
        let eventRegistrations = [];

        if (!type || type === 'gatepass') {
            gatePasses = await prisma.gatePass.findMany({
                where: {
                    OR: [
                        { student: { mentorId: mentor.id } },
                        { student: { chiefMentorId: mentor.id } }
                    ]
                },
                include: {
                    student: {
                        include: { user: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        if (!type || type === 'event') {
            eventRegistrations = await prisma.eventRegistration.findMany({
                where: {
                    OR: [
                        { event: { createdById: mentor.id } },
                        { student: { chiefMentorId: mentor.id } }
                    ]
                },
                include: {
                    event: true,
                    student: {
                        include: { user: true }
                    }
                },
                orderBy: { appliedAt: 'desc' }
            });
        }

        return success(res, { gatePasses, eventRegistrations }, 'Approvals fetched');
    } catch (err) {
        console.error('Get approvals error:', err);
        return error(res, 'Failed to fetch approvals', 500);
    }
};

/**
 * Update approval status
 */
export const updateApproval = async (req, res) => {
    try {
        const userId = req.userId;
        const { approvalId } = req.params;
        const { type, status, note } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return error(res, 'Invalid status. Must be APPROVED or REJECTED', 400);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        if (type === 'gatepass') {
            const gatePass = await prisma.gatePass.findUnique({
                where: { id: approvalId },
                include: { student: true }
            });

            if (!gatePass) {
                return error(res, 'Gate pass not found', 404);
            }

            let newStatus = status;

            // Authorization and Workflow Logic
            if (status === 'APPROVED') {
                if (gatePass.student.mentorId === mentor.id) {
                    // Mentor approving
                    // If student has a Chief Mentor, forward it (MENTOR_APPROVED)
                    // Else, final approval
                    newStatus = gatePass.student.chiefMentorId ? 'MENTOR_APPROVED' : 'APPROVED';
                } else if (gatePass.student.chiefMentorId === mentor.id) {
                    // Chief Mentor approving
                    if (gatePass.status !== 'MENTOR_APPROVED') {
                        return error(res, 'Request must be approved by Mentor first', 400);
                    }
                    newStatus = 'APPROVED';
                } else {
                    return error(res, 'Unauthorized', 403);
                }
            } else {
                // REJECTED
                // Either can reject?
                if (gatePass.student.mentorId !== mentor.id && gatePass.student.chiefMentorId !== mentor.id) {
                    return error(res, 'Unauthorized', 403);
                }
            }

            const updated = await prisma.gatePass.update({
                where: { id: approvalId },
                data: {
                    status: newStatus,
                    approvedById: mentor.id,
                    approvalNote: note
                },
                include: {
                    student: { include: { user: true } }
                }
            });

            return success(res, { gatePass: updated }, `Gate pass ${newStatus.toLowerCase().replace('_', ' ')}`);

        } else if (type === 'event') {
            const registration = await prisma.eventRegistration.findUnique({
                where: { id: approvalId },
                include: { event: true, student: true }
            });

            if (!registration) {
                return error(res, 'Event registration not found', 404);
            }

            let newStatus = status;

            // Simple logic: if Event Creator (Mentor) -> Forward to Chief -> Approve
            // But usually event host approves. 
            // If User Requirement "event request... forwarded to chief", implies 2-step.

            if (status === 'APPROVED') {
                if (registration.event.createdById === mentor.id) {
                    newStatus = registration.student.chiefMentorId ? 'MENTOR_APPROVED' : 'APPROVED';
                } else if (registration.student.chiefMentorId === mentor.id) {
                    newStatus = 'APPROVED';
                } else {
                    return error(res, 'Unauthorized', 403);
                }
            } else {
                if (registration.event.createdById !== mentor.id && registration.student.chiefMentorId !== mentor.id) {
                    return error(res, 'Unauthorized', 403);
                }
            }

            const updated = await prisma.eventRegistration.update({
                where: { id: approvalId },
                data: { status: newStatus }
            });

            return success(res, { registration: updated }, `Event registration ${newStatus.toLowerCase().replace('_', ' ')}`);

        } else {
            return error(res, 'Invalid approval type', 400);
        }
    } catch (err) {
        console.error('Update approval error:', err);
        return error(res, 'Failed to update approval', 500);
    }
};

/**
 * Upload study material
 */
export const uploadMaterial = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, subject, year } = req.body;
        const file = req.file;

        if (!file) {
            return error(res, 'No file uploaded', 400);
        }

        if (!title || !subject || !year) {
            return error(res, 'Title, subject, and year are required', 400);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        // Upload file to S3
        const uploadResult = await uploadStudyMaterial(file, mentor.id);

        // Create study material record
        const material = await prisma.studyMaterial.create({
            data: {
                title,
                description,
                subject,
                year: parseInt(year),
                fileUrl: uploadResult.url,
                uploadedById: mentor.id
            }
        });

        return success(res, { material }, 'Study material uploaded successfully');
    } catch (err) {
        console.error('Upload material error:', err);
        return error(res, 'Failed to upload study material', 500, err.message);
    }
};

/**
 * Create assignment
 */
export const createAssignment = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, dueDate, attachmentUrl } = req.body;

        if (!title || !description || !dueDate) {
            return error(res, 'Title, description, and due date are required', 400);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const assignment = await prisma.assignment.create({
            data: {
                title,
                description,
                dueDate: new Date(dueDate),
                attachmentUrl,
                mentorId: mentor.id
            }
        });

        return success(res, { assignment }, 'Assignment created successfully');
    } catch (err) {
        console.error('Create assignment error:', err);
        return error(res, 'Failed to create assignment', 500);
    }
};

/**
 * Grade assignment submission
 */
export const gradeSubmission = async (req, res) => {
    try {
        const userId = req.userId;
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        if (grade === undefined) {
            return error(res, 'Grade is required', 400);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const submission = await prisma.assignmentSubmission.findUnique({
            where: { id: submissionId },
            include: { assignment: true }
        });

        if (!submission) {
            return error(res, 'Submission not found', 404);
        }

        if (submission.assignment.mentorId !== mentor.id) {
            return error(res, 'You can only grade submissions for your assignments', 403);
        }

        const updated = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade: parseFloat(grade),
                feedback
            },
            include: {
                assignment: true,
                student: {
                    include: { user: true }
                }
            }
        });

        return success(res, { submission: updated }, 'Submission graded successfully');
    } catch (err) {
        console.error('Grade submission error:', err);
        return error(res, 'Failed to grade submission', 500);
    }
};

/**
 * Get all assignments created by mentor
 */
export const getAssignments = async (req, res) => {
    try {
        const userId = req.userId;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const assignments = await prisma.assignment.findMany({
            where: { mentorId: mentor.id },
            include: {
                submissions: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            },
            orderBy: { dueDate: 'desc' }
        });

        return success(res, { assignments }, 'Assignments fetched');
    } catch (err) {
        console.error('Get assignments error:', err);
        return error(res, 'Failed to fetch assignments', 500);
    }
};

/**
 * Get all events created by mentor
 */
export const getEvents = async (req, res) => {
    try {
        const userId = req.userId;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const events = await prisma.event.findMany({
            where: { createdById: mentor.id },
            include: {
                registrations: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            },
            orderBy: { eventDate: 'desc' }
        });

        return success(res, { events }, 'Events fetched');
    } catch (err) {
        console.error('Get events error:', err);
        return error(res, 'Failed to fetch events', 500);
    }
};

/**
 * Get study materials uploaded by mentor
 */
export const getStudyMaterials = async (req, res) => {
    try {
        const userId = req.userId;

        const mentor = await prisma.mentor.findUnique({
            where: { userId }
        });

        const materials = await prisma.studyMaterial.findMany({
            where: { uploadedById: mentor.id },
            orderBy: { createdAt: 'desc' }
        });

        return success(res, { materials }, 'Study materials fetched');
    } catch (err) {
        console.error('Get study materials error:', err);
        return error(res, 'Failed to fetch study materials', 500);
    }
};

/**
 * Update mentor profile
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { firstName, lastName, phone, specialization, experienceYears } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName,
                lastName,
                phone,
                mentor: {
                    update: {
                        specialization,
                        experienceYears: experienceYears ? parseInt(experienceYears) : undefined
                    }
                }
            },
            include: {
                mentor: true
            }
        });

        return success(res, { user }, 'Profile updated successfully');
    } catch (err) {
        console.error('Update profile error:', err);
        return error(res, 'Failed to update profile', 500);
    }
};

/**
 * Get mentor settings
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
 * Update mentor settings
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
