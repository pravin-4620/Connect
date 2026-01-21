import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

export const roleSchema = z.enum(['STUDENT', 'MENTOR', 'PLACEMENT_OFFICER', 'ADMIN', 'PLACEMENT_HEAD', 'CHIEF_MENTOR', 'SUB_ADMIN']);

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'), // Allow simple pass for login flow
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const userProfileSchema = z.object({
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().or(z.literal('')),
    department: z.string().min(1, 'Department is required'),
    skills: z.string().optional(),
    linkedInUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    leetcodeUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    about: z.string().optional(),
    // New personal fields
    dob: z.string().optional(),
    gender: z.string().optional(),
    nationality: z.string().optional(),
    contactAddress: z.string().optional(),
    personalEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    // New academic fields
    cgpa: z.number().min(0).max(10).optional(),
    historyOfArrears: z.number().min(0).optional(),
    currentArrears: z.number().min(0).optional(),
    tenthPercentage: z.number().min(0).max(100).optional(),
    twelfthPercentage: z.number().min(0).max(100).optional(),
});

export const placementSchema = z.object({
    companyName: z.string().min(2, 'Company name is required'),
    jobRole: z.string().min(2, 'Job role is required'),
    package: z.coerce.number().positive('Package must be positive'),
    driveDate: z.string().refine(val => new Date(val) > new Date(), 'Drive date must be in the future'),
    applicationDeadline: z.string(),
    description: z.string().min(10, 'Description is too short'),
    eligibility: z.object({
        minCGPA: z.coerce.number().min(0).max(10).optional(),
        allowedYears: z.array(z.number()).optional(),
        departments: z.array(z.string()).optional(),
    }).optional()
});

export const eventSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(10, 'Description is too short'),
    eventDate: z.string().refine(val => new Date(val) > new Date(), 'Event date must be in the future'),
    location: z.string().min(2, 'Location is required'),
    maxParticipants: z.coerce.number().positive().optional(),
});

export const assignmentSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(10, 'Description is too short'),
    dueDate: z.string().refine(val => new Date(val) > new Date(), 'Due date must be in the future'),
    subject: z.string().optional(),
});

export const gatePassSchema = z.object({
    reason: z.string().min(5, 'Reason is required'),
    fromDate: z.string(),
    toDate: z.string(),
}).refine(data => new Date(data.toDate) >= new Date(data.fromDate), {
    message: "End date cannot be before start date",
    path: ["toDate"],
});

export const announcementSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    content: z.string().min(5, 'Content is required'),
    targetRole: z.enum(['STUDENT', 'MENTOR', 'PLACEMENT_OFFICER', 'PLACEMENT_HEAD', 'ADMIN', 'CHIEF_MENTOR', 'SUB_ADMIN']).optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('LOW'),
});
