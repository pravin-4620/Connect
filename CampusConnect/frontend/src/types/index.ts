/* eslint-disable @typescript-eslint/no-explicit-any */
export type Role = 'STUDENT' | 'MENTOR' | 'PLACEMENT_OFFICER' | 'ADMIN' | 'CHIEF_MENTOR' | 'SUB_ADMIN';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MENTOR_APPROVED';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export type EmailCategory = 'PLACEMENT' | 'ACADEMIC' | 'PERSONAL' | 'SPAM';

export interface User {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    phone?: string;
    profilePicture?: string;
    isFirstLogin: boolean;
    gmailConnected: boolean;
    mentor?: Mentor;
    student?: Student;
}

export interface Student {
    id: string;
    userId: string;
    user?: User; // joined user
    rollNumber: string;
    year: number;
    department: string;
    cgpa?: number;
    mentorId?: string;
    placementOfficerId?: string;
    resumeUrl?: string;
    skills?: string[];
    attendance?: number;
    linkedInUrl?: string;
    githubUrl?: string;
    leetcodeUrl?: string;
    about?: string;
}

export interface Mentor {
    id: string;
    userId: string;
    user?: User;
    department: string;
    specialization?: string;
    experienceYears?: number;
}

export interface PlacementOfficer {
    id: string;
    userId: string;
    user?: User;
    department?: string;
    designation?: string;
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    subject?: string; // Added for UI display
    mentorId: string;
    mentor?: Mentor;
    dueDate: string;
    attachmentUrl?: string;
    createdAt: string;
    submission?: AssignmentSubmission; // current student submission
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    studentId: string;
    student?: Student;
    submissionUrl: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    location?: string;
    createdById: string;
    createdByRole: Role;
    maxParticipants?: number;
    status: EventStatus;
    registeredCount?: number;
    registration?: EventRegistration; // current student registration
}

export interface EventRegistration {
    id: string;
    eventId: string;
    studentId: string;
    status: ApprovalStatus;
    appliedAt: string;
}

export interface Placement {
    id: string;
    companyName: string;
    jobRole: string;
    package: number;
    eligibilityCriteria: {
        minCGPA?: number;
        allowedYears?: number[];
        departments?: string[];
        skills?: string[];
    };
    placementOfficerId: string;
    driveDate: string;
    applicationDeadline: string;
    description: string;
    location?: string; // Added field
    createdAt: string;
    application?: PlacementApplication; // current student application
}

export type PlacementDrive = Placement;

export interface PlacementApplication {
    id: string;
    placementId: string;
    studentId: string;
    status: ApprovalStatus;
    appliedAt: string;
}

export interface SkillsTest {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
    questions: Question[];
    createdById: string;
}

export interface Question {
    id: string;
    question: string;
    type: 'MCQ' | 'TEXT';
    options?: string[];
    correctAnswer?: string;
    marks: number;
}

export interface TestAttempt {
    id: string;
    testId: string;
    studentId: string;
    score: number;
    answers: any;
    attemptedAt: string;
}

export interface GatePass {
    id: string;
    studentId: string;
    student?: Student;
    reason: string;
    fromDate: string;
    toDate: string;
    status: ApprovalStatus;
    approvedById?: string;
    approvalNote?: string;
    createdAt: string;
}

export interface StudyMaterial {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    subject: string;
    year: number;
    uploadedById: string;
    createdAt: string;
}

export interface Email {
    id: string;
    userId: string;
    gmailMessageId: string;
    subject: string;
    fromEmail: string;
    toEmail: string;
    body: string;
    category: EmailCategory;
    receivedAt: string;
    isRead: boolean;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    sentAt: string;
    isRead: boolean;
    senderName?: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdById: string;
    targetRole?: Role;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    createdAt: string;
}

export interface Interview {
    id: string;
    studentId: string;
    student?: Student;
    companyName: string;
    placementOfficerId: string;
    scheduledAt: string; // date using this field
    date?: string; // or this, depending on backend (frontend usually maps strictly)
    type: string; // Technical, HR etc
    link?: string;
    feedback?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface DashboardStats {
    // Student
    cgpa?: number;
    pendingAssignments?: number;
    upcomingEvents?: number;
    activePlacements?: number;
    eligiblePlacements?: number;
    pendingGatePasses?: number;

    // Mentor
    totalStudents?: number;
    pendingApprovals?: number;
    activeEvents?: number;
    assignments?: number;

    // Placement
    activeDrives?: number;
    placedStudents?: number;
    averagePackage?: number;
    upcomingInterviews?: number;

    // Admin
    totalUsers?: number;
    activeStudents?: number;
    newRegistrations?: number; // misc
}

export interface ResumeAnalysis {
    atsScore: number;
    missingKeywords: string[];
    formattingSuggestions: string[];
    skillsRecommendations: string[];
    overallFeedback: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface Activity {
    description: string;
    createdAt: string;
    type: string;
    value?: string | number;
    metricType?: string;
    loggedAt?: string;
}

// Request Types (From Prompt)
export interface LoginRequest {
    email: string;
    password: string;
    role?: Role;
}

export interface PlacementFilters {
    search?: string;
    minPackage?: number;
    maxPackage?: number;
    department?: string;
}

export interface EventFilters {
    status?: EventStatus;
    createdBy?: Role;
    dateFrom?: string;
    dateTo?: string;
}

export interface StudentFilters {
    search?: string;
    year?: number;
    department?: string;
    minCGPA?: number;
    maxCGPA?: number;
}

export interface MaterialFilters {
    subject?: string;
    year?: number;
    search?: string;
}

export interface GatePassRequest {
    reason: string;
    fromDate: string;
    toDate: string;
}

export interface EventCreate {
    title: string;
    description: string;
    eventDate: string;
    location?: string;
    maxParticipants?: number;
}

export interface PlacementCreate {
    companyName: string;
    jobRole: string;
    package: number;
    eligibilityCriteria: {
        minCGPA?: number;
        allowedYears?: number[];
        departments?: string[];
        skills?: string[];
    };
    driveDate: string;
    applicationDeadline: string;
    description: string;
}

export interface InterviewCreate {
    studentId: string;
    scheduledAt: string;
    type: 'MOCK' | 'COMPANY';
    notes?: string;
}

export interface SkillsTestCreate {
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
    questions: Question[];
}

export interface AnnouncementCreate {
    title: string;
    content: string;
    targetRole?: Role;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface UserCreate {
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    department?: string;
    year?: number;
}

export interface MappingCreate {
    studentIds: string[];
    mentorId?: string;
    placementOfficerId?: string;
}

export interface APIError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}
