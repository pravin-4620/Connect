import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const MentorDashboard = lazy(() => import('./pages/mentor/Dashboard'));
const PlacementDashboard = lazy(() => import('./pages/placement/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminAnnouncements = lazy(() => import('./pages/admin/Announcements'));
const Chat = lazy(() => import('./pages/Chat'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));
const StudentPlacements = lazy(() => import('./pages/student/Placements'));
const StudentEvents = lazy(() => import('./pages/student/Events'));
const StudentAssignments = lazy(() => import('./pages/student/Assignments'));
const StudentResumeAnalyzer = lazy(() => import('./pages/student/ResumeAnalyzer'));
const StudentGatePass = lazy(() => import('./pages/student/GatePass'));
const StudentStudyMaterials = lazy(() => import('./pages/student/StudyMaterials'));
const StudentSkillsTests = lazy(() => import('./pages/student/SkillsTests'));
const StudentMails = lazy(() => import('./pages/student/Mails'));
const StudentSettings = lazy(() => import('./pages/student/Settings'));
const MentorStudents = lazy(() => import('./pages/mentor/Students'));
const MentorApprovals = lazy(() => import('./pages/mentor/Approvals'));
const MentorEvents = lazy(() => import('./pages/mentor/Events'));
const MentorAssignments = lazy(() => import('./pages/mentor/Assignments'));
const MentorStudyMaterials = lazy(() => import('./pages/mentor/StudyMaterials'));
const MentorProfile = lazy(() => import('./pages/mentor/Profile'));
const MentorStudentDetails = lazy(() => import('./pages/mentor/StudentDetails'));
const MentorAttendance = lazy(() => import('./pages/mentor/MentorAttendance'));
const MentorSettings = lazy(() => import('./pages/mentor/Settings'));
const MentorMails = lazy(() => import('./pages/mentor/Mails'));
const PlacementDrives = lazy(() => import('./pages/placement/Drives'));
const PlacementStudents = lazy(() => import('./pages/placement/Students'));
const PlacementAnnouncements = lazy(() => import('./pages/placement/Announcements'));
const PlacementAnalytics = lazy(() => import('./pages/placement/Analytics'));
const PlacementMails = lazy(() => import('./pages/placement/Mails'));
const PlacementSettings = lazy(() => import('./pages/placement/Settings'));
const PlacementProfile = lazy(() => import('./pages/placement/Profile'));
const SkillsTests = lazy(() => import('./pages/placement/SkillsTests'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminMappings = lazy(() => import('./pages/admin/Mappings'));
const AdminChats = lazy(() => import('./pages/admin/Chats'));
const AdminStatistics = lazy(() => import('./pages/admin/Statistics'));
const PlacementInterviews = lazy(() => import('./pages/placement/Interviews'));

const GmailConnected = lazy(() => import('./pages/auth/GmailConnected'));
const GmailError = lazy(() => import('./pages/auth/GmailError'));

// Placeholder components for routes mentioned in prompts
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
    <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
    <p>This module is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Analytics />
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/gmail-connected" element={
                <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                  <GmailConnected />
                </Suspense>
              } />
              <Route path="/gmail-error" element={
                <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                  <GmailError />
                </Suspense>
              } />

              {/* Protected Routes Wrapper */}
              <Route element={<Layout />}>

                {/* Student Routes */}
                <Route path="/student">
                  <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />

                  <Route path="profile" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentProfile />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="placements" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentPlacements />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="events" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentEvents />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="assignments" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentAssignments />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="study-materials" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentStudyMaterials />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="skills-tests" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentSkillsTests />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="resume-analyzer" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentResumeAnalyzer />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="mails" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentMails />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="gate-pass" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentGatePass />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <StudentSettings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Mentor Routes */}
                <Route path="/mentor">
                  <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="students" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorStudents />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="attendance" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorAttendance />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="students/:id" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorStudentDetails />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorProfile />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorSettings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="approvals" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorApprovals />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="assignments" element={
                    <ProtectedRoute allowedRoles={['MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorAssignments />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="events" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorEvents />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="study-materials" element={
                    <ProtectedRoute allowedRoles={['MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorStudyMaterials />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="mails" element={
                    <ProtectedRoute allowedRoles={['MENTOR', 'CHIEF_MENTOR']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <MentorMails />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Placement Officer Routes */}
                <Route path="/placement">
                  <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="drives" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementDrives />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="companies" element={<ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}><Placeholder title="Companies" /></ProtectedRoute>} />
                  <Route path="students" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementStudents />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="interviews" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementInterviews />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="skills-tests" element={<ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}><Placeholder title=" Skills Tests" /></ProtectedRoute>} />
                  <Route path="analytics" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementAnalytics />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="announcements" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementAnnouncements />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="mails" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementMails />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementSettings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <PlacementProfile />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="skills-tests" element={
                    <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <SkillsTests />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin">
                  <Route path="dashboard" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminDashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="users" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminUsers />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="mappings" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminMappings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="statistics" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminStatistics />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <Settings />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminProfile />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="chats" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminChats />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="announcements" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUB_ADMIN']}>
                      <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                        <AdminAnnouncements />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Common Routes */}
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
                      <Chat />
                    </Suspense>
                  </ProtectedRoute>
                } />
                <Route path="/unauthorized" element={<div className="p-8 text-center text-red-500">Unauthorized Access</div>} />

              </Route>

              {/* Redirect Root */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
              <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
            </Routes>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
