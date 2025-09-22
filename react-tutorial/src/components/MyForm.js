import { useState, useEffect } from "react";
import {
  GraduationCap,
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Zap,
  Shield,
  Globe,
  Star,
  TrendingUp,
  Users,
  Award,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Filter,
  MapPin,
  Clock,
  BookOpen,
  Briefcase,
  Target,
  Download,
  Share2,
  Heart,
  AlertCircle,
  X,
  Check,
  Phone,
  KeyRound,
  Smartphone,
  FileText
} from 'lucide-react';

// Import the detailed StudentDashboard component
import StudentDashboard from '../StudentDash.js';
import MentorDashboard from '../Mentor.js'; // <-- Add this import
// Simple dashboards for mentor and placement officer
import PlacementDashboard from '../Placement.js';


const CampusConnectLogin = () => {
  // All hooks must be declared at the top level
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [loginData, setLoginData] = useState({
    username: '', // Changed from email to username
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);



  // Real-time stats
  const [liveStats, setLiveStats] = useState({
    activeUsers: 1247,
    newApplications: 89,
    placementsToday: 12,
    onlineRecruiters: 34
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        newApplications: prev.newApplications + Math.floor(Math.random() * 3),
        placementsToday: prev.placementsToday + Math.floor(Math.random() * 2),
        onlineRecruiters: prev.onlineRecruiters + Math.floor(Math.random() * 4) - 2
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Authentication credentials
  const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    setSelectedUserType('');
    setShowLogin(false);
    setLoginData({ username: '', password: '' });
    setLoginError('');
    setShowMFA(false);
    setMfaCode(['', '', '', '', '', '']);
  };

  // Render appropriate dashboard based on user type
  if (isAuthenticated && authenticatedUser) {
    switch (authenticatedUser.userType) {
      case 'student':
        // Use the imported StudentDashboard component with onLogout prop
        return <StudentDashboard onLogout={handleLogout} />;
      case 'mentor':
        return <MentorDashboard onLogout={handleLogout} />;
      case 'placement-cell':
        return <PlacementDashboard onLogout={handleLogout} />;
      default:
        return null;
    }
  }

  const userTypes = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Find Your Next Opportunity',
      description: 'Discover internships, track applications, and connect with industry professionals',
      icon: User,
      neonColor: '#00D9FF',
      neonShadow: 'shadow-cyan-400/50',
      neonBorder: 'border-cyan-400',
      neonText: 'text-cyan-400',
      neonBg: 'bg-cyan-400/10',
      neonGlow: 'shadow-cyan-400/25',
      features: ['Browse Internships', 'Application Tracking', 'Interview Scheduling', 'Career Resources', 'Skill Assessments', 'Peer Networking'],
      stats: '2,500+ Students',
      newFeatures: ['AI Resume Builder', 'Mock Interviews', 'Salary Insights', 'Company Reviews']
    },
    {
      id: 'mentor',
      title: 'Mentor',
      subtitle: 'Guide Student Success',
      description: 'Support student growth, review applications, and monitor progress effectively',
      icon: UserCheck,
      neonColor: '#00FF88',
      neonShadow: 'shadow-emerald-400/50',
      neonBorder: 'border-emerald-400',
      neonText: 'text-emerald-400',
      neonBg: 'bg-emerald-400/10',
      neonGlow: 'shadow-emerald-400/25',
      features: ['Student Management', 'Application Reviews', 'Progress Analytics', 'Guidance Tools', 'Video Consultations', 'Goal Setting'],
      stats: '450+ Mentors',
      newFeatures: ['Smart Matching', 'Calendar Integration', 'Performance Dashboards', 'Batch Messaging']
    },
    {
      id: 'placement-cell',
      title: 'Placement Officer',
      subtitle: 'Manage Placements',
      description: 'Coordinate with companies, manage recruitment drives, and analyze placement data',
      icon: Building2,
      neonColor: '#FF6B35',
      neonShadow: 'shadow-orange-400/50',
      neonBorder: 'border-orange-400',
      neonText: 'text-orange-400',
      neonBg: 'bg-orange-400/10',
      neonGlow: 'shadow-orange-400/25',
      features: ['Company Relations', 'Placement Analytics', 'Event Management', 'Student Database', 'Recruitment Automation', 'Report Generation'],
      stats: '800+ Companies',
      newFeatures: ['AI Matching Engine', 'Virtual Career Fairs', 'Bulk Communication', 'Advanced Analytics']
    }
  ];

  // Notifications data
  const notifications = [
    { id: 1, type: 'success', message: 'New internship opportunity at Google', time: '5m ago', icon: Briefcase },
    { id: 2, type: 'info', message: 'Resume review completed', time: '1h ago', icon: CheckCircle2 },
    { id: 3, type: 'warning', message: 'Application deadline approaching', time: '2h ago', icon: Clock },
    { id: 4, type: 'info', message: '3 new mentor messages', time: '3h ago', icon: MessageSquare }
  ];

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
    setTimeout(() => setShowLogin(true), 200);
  };

  const handleMFASubmit = async () => {
    const code = mfaCode.join('');
    if (code.length !== 6) {
      setLoginError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (code === '123456') { // Demo code
        const userTypeData = userTypes.find(type => type.id === selectedUserType);
        setShowSuccessMessage(`ðŸŽ‰ Welcome! Redirecting to your ${userTypeData.title} dashboard...`);
        
        setTimeout(() => {
          // Set authenticated state and user data
          setIsAuthenticated(true);
          setAuthenticatedUser({
            userType: selectedUserType,
            username: loginData.username,
            userData: userTypeData
          });
          
          // Reset form states
          setShowMFA(false);
          setShowLogin(false);
          setLoginData({ username: '', password: '' });
          setMfaCode(['', '', '', '', '', '']);
          setShowSuccessMessage('');
        }, 2000);
      } else {
        setLoginError('Invalid verification code. Try 123456 for demo.');
      }
    } catch (error) {
      setLoginError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newMfaCode = [...mfaCode];
      newMfaCode[index] = value;
      setMfaCode(newMfaCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`mfa-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.endsWith('@college.edu')) {
      setLoginError('Please use your institutional email');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccessMessage('Password reset link sent to your email!');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setShowSuccessMessage('');
      }, 3000);
    } catch (error) {
      setLoginError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setIsGoogleLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockGoogleUser = {
        email: 'admin@college.edu',
        name: 'Admin User',
        picture: 'https://via.placeholder.com/40'
      };

      if (!mockGoogleUser.email.endsWith('@college.edu')) {
        throw new Error('Please use your institutional Google account (@college.edu)');
      }

      // Simulate MFA requirement for Google sign-in too
      setShowMFA(true);

    } catch (error) {
      setLoginError(error.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoginError('');

    // Validate credentials
    if (loginData.username !== VALID_CREDENTIALS.username) {
      setLoginError('Invalid username. Use "admin" for demo.');
      return;
    }

    if (loginData.password !== VALID_CREDENTIALS.password) {
      setLoginError('Invalid password. Use "admin123" for demo.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Simulate successful login leading to MFA
      setShowMFA(true);

    } catch (error) {
      setLoginError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // MFA Screen
  if (showMFA) {
    const userTypeData = userTypes.find(type => type.id === selectedUserType);
    
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: userTypeData.neonColor }}
          ></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className={`bg-gray-800/90 backdrop-blur-xl rounded-3xl border ${userTypeData.neonBorder} ${userTypeData.neonGlow} p-8`}>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 bg-gray-900 border-2 ${userTypeData.neonBorder} rounded-2xl ${userTypeData.neonGlow}`}>
                    <Shield className="h-12 w-12" style={{ color: userTypeData.neonColor }} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
                <p className="text-gray-300">Enter the 6-digit code sent to your device</p>
                <p className="text-sm text-gray-400 mt-2">Demo code: 123456</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm font-medium text-center">âš ï¸ {loginError}</p>
                </div>
              )}

              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm font-medium text-center">âœ… {showSuccessMessage}</p>
                </div>
              )}

              <div className="flex justify-center space-x-3 mb-8">
                {mfaCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`mfa-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMFAInputChange(index, e.target.value)}
                    className={`w-12 h-12 text-center text-xl font-bold bg-gray-900/50 border-2 rounded-xl transition-all duration-300 text-white ${
                      digit ? `${userTypeData.neonBorder} ${userTypeData.neonGlow}` : 'border-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleMFASubmit}
                disabled={isLoading}
                className={`w-full py-4 px-6 bg-gray-900 border-2 ${userTypeData.neonBorder} text-white font-bold rounded-2xl transition-all duration-300 ${userTypeData.neonGlow} disabled:opacity-50`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mr-3" style={{ borderColor: userTypeData.neonColor }}></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowMFA(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  â† Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Screen
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-cyan-400 shadow-cyan-400/25 p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gray-900 border-2 border-cyan-400 rounded-2xl shadow-cyan-400/25">
                    <KeyRound className="h-12 w-12 text-cyan-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-gray-300">Enter your email to receive reset instructions</p>
              </div>

              {loginError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm font-medium text-center">âš ï¸ {loginError}</p>
                </div>
              )}

              {showSuccessMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm font-medium text-center">âœ… {showSuccessMessage}</p>
                </div>
              )}

              <div className="mb-6">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your.email@college.edu"
                  className="w-full pl-4 pr-4 py-4 bg-gray-900/50 border-2 border-gray-600 rounded-2xl transition-all duration-300 text-white placeholder-gray-500 focus:border-cyan-400 focus:shadow-cyan-400/25"
                />
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gray-900 border-2 border-cyan-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-cyan-400/25 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent mr-3"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setLoginError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  â† Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (showLogin && selectedUserType) {
    const userTypeData = userTypes.find(type => type.id === selectedUserType);
    
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-8 w-8 text-cyan-400" />
              <span className="font-bold text-white">CAMPUS CONNECT</span>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-start space-x-3">
                            <notif.icon className="h-5 w-5 text-cyan-400 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-white text-sm">{notif.message}</p>
                              <p className="text-gray-400 text-xs mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Time */}
              <div className="text-gray-400 text-sm">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ backgroundColor: userTypeData.neonColor }}
          ></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6 pt-24">
          <div className="max-w-lg w-full">
            {/* Back Button */}
            <button
              onClick={() => {
                setShowLogin(false);
                setSelectedUserType('');
                setLoginData({ email: '', password: '' });
                setLoginError('');
              }}
              className={`mb-8 flex items-center text-gray-400 hover:text-white transition-all duration-300 transform hover:translate-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:${userTypeData.neonBorder} hover:${userTypeData.neonGlow} rounded-xl px-5 py-3`}
            >
              <ChevronRight className="h-4 w-4 transform rotate-180 mr-2" />
              <span className="font-medium">Back to selection</span>
            </button>

            {/* Login Card */}
            <div className={`bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-700 hover:${userTypeData.neonBorder} ${userTypeData.neonGlow} transition-all duration-500 overflow-hidden`}>
              {/* Header */}
              <div className="bg-gray-900/80 border-b border-gray-700 p-8 relative overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundColor: userTypeData.neonColor }}
                ></div>
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 bg-gray-800 border-2 ${userTypeData.neonBorder} rounded-2xl ${userTypeData.neonGlow} relative`}>
                      <userTypeData.icon 
                        className="h-12 w-12" 
                        style={{ color: userTypeData.neonColor }} 
                      />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                  <p className="text-gray-300 font-medium">
                    Sign in to your {userTypeData.title} account
                  </p>
                </div>
              </div>

              <div className="p-8">
                {/* Security Notice */}
                <div className={`p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-6`}>
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-400 mt-1 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-400">Enhanced Security</h3>
                      <p className="mt-1 text-sm text-blue-300">
                        Two-factor authentication required • Use institutional email (@college.edu)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 text-sm font-medium text-center">⚠️ {loginError}</p>
                  </div>
                )}

                {/* Google Sign-In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-4 px-6 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 relative overflow-hidden group mb-6"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-800 border-t-transparent mr-3"></div>
                      Signing in with Google...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </div>
                  )}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800 text-gray-400 font-medium">Or continue with email</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Username
                    </label>
                    <div className="relative">
                      <User className={`absolute left-4 top-4 h-5 w-5 transition-colors duration-300 ${
                        focusedInput === 'username' ? userTypeData.neonText : 'text-gray-500'
                      }`} />
                      <input
                        type="text"
                        name="username"
                        value={loginData.username}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput('')}
                        className={`w-full pl-12 pr-12 py-4 bg-gray-900/50 border-2 rounded-2xl transition-all duration-300 text-white placeholder-gray-500 ${
                          focusedInput === 'username' 
                            ? `${userTypeData.neonBorder} ${userTypeData.neonGlow} ${userTypeData.neonBg}` 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        placeholder="Enter your username (admin)"
                        required
                      />
                      {loginData.username && (
                        <div className="absolute right-4 top-4">
                          {loginData.username === 'admin' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-4 h-5 w-5 transition-colors duration-300 ${
                        focusedInput === 'password' ? userTypeData.neonText : 'text-gray-500'
                      }`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={loginData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput('')}
                        className={`w-full pl-12 pr-16 py-4 bg-gray-900/50 border-2 rounded-2xl transition-all duration-300 text-white placeholder-gray-500 ${
                          focusedInput === 'password' 
                            ? `${userTypeData.neonBorder} ${userTypeData.neonGlow} ${userTypeData.neonBg}` 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="h-5 w-5 bg-gray-800 border-gray-600 rounded transition-all duration-300 focus:ring-2 focus:ring-offset-0"
                        style={{ accentColor: userTypeData.neonColor }}
                      />
                      <span className="ml-3 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        Remember me
                      </span>
                    </label>
                    <button 
                      onClick={() => setShowForgotPassword(true)}
                      className={`${userTypeData.neonText} hover:text-white font-semibold transition-colors duration-300`}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 bg-gray-900 border-2 ${userTypeData.neonBorder} text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${userTypeData.neonGlow} hover:${userTypeData.neonBg} disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div 
                          className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mr-3"
                          style={{ borderColor: userTypeData.neonColor, borderTopColor: 'transparent' }}
                        ></div>
                        Signing you in...
                      </div>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center justify-center">
                          <Zap className="h-5 w-5 mr-2" style={{ color: userTypeData.neonColor }} />
                          Sign In
                          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div 
                          className="absolute inset-0 opacity-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                          style={{ backgroundColor: userTypeData.neonColor }}
                        ></div>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Stats */}
                <div className={`mt-8 p-5 bg-gray-900/50 border border-gray-700 rounded-2xl ${userTypeData.neonBg} backdrop-blur-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-1">Active Community</p>
                      <p className="text-2xl font-bold text-white">{userTypeData.stats}</p>
                    </div>
                    <div 
                      className="p-3 rounded-xl border-2"
                      style={{ 
                        backgroundColor: `${userTypeData.neonColor}20`,
                        borderColor: userTypeData.neonColor
                      }}
                    >
                      <CheckCircle2 className="h-8 w-8" style={{ color: userTypeData.neonColor }} />
                    </div>
                  </div>
                </div>

                {/* Help */}
                <div className="mt-6 text-center space-y-3">
                  <p className="text-gray-400">
                    Don't have an account?{' '}
                    <button className={`${userTypeData.neonText} hover:text-white font-semibold transition-colors duration-300`}>
                      Contact Admin
                    </button>
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>🔒 Your data is secured with industry-standard encryption</p>
                    <p>📱 SMS verification required for enhanced security</p>
                    <p>📧 Only institutional emails (@college.edu) are accepted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Selection Screen
  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          
        </div>
      </div>

      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '6s'}}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(#00D9FF22 1px, transparent 1px), linear-gradient(90deg, #00D9FF22 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 pt-20">
        {/* Hero Section */}
        <div className="text-center pt-16 pb-12">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="p-6 bg-gray-800 border-2 border-cyan-400 rounded-3xl shadow-2xl shadow-cyan-400/25 transition-all duration-500 group-hover:shadow-cyan-400/50">
                <GraduationCap className="h-20 w-20 text-cyan-400" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            </div>
          </div>
          
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
            CAMPUS CONNECT
          </h1>
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <Zap className="h-6 w-6 text-cyan-400 animate-pulse" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-emerald-400"></div>
          </div>
          
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-20">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userTypes.map((userType, index) => (
              <div
                key={userType.id}
                onClick={() => handleUserTypeSelect(userType.id)}
                className={`group relative bg-gray-800/50 backdrop-blur-sm rounded-3xl border-2 border-gray-700 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:${userType.neonBorder} hover:${userType.neonShadow} overflow-hidden`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Neon glow effect on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
                  style={{ backgroundColor: userType.neonColor }}
                ></div>
                
                <div className="relative z-10 p-8">
                  {/* Icon */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 bg-gray-900 border-2 ${userType.neonBorder} rounded-2xl ${userType.neonShadow} group-hover:${userType.neonGlow} transition-all duration-300`}>
                      <userType.icon 
                        className="h-12 w-12" 
                        style={{ color: userType.neonColor }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors duration-300">
                      {userType.title}
                    </h3>
                    <p className="text-lg font-semibold mb-3" style={{ color: userType.neonColor }}>
                      {userType.subtitle}
                    </p>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {userType.description}
                    </p>
                  </div>

                  

                  
                  

                  {/* Button */}
                  <button
                    className={`w-full py-4 px-6 bg-gray-900 border-2 ${userType.neonBorder} text-white font-bold rounded-2xl transition-all duration-300 transform group-hover:scale-105 ${userType.neonShadow} relative overflow-hidden`}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <Zap className="h-5 w-5 mr-2" style={{ color: userType.neonColor }} />
                      Access Portal
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div 
                      className="absolute inset-0 opacity-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                      style={{ backgroundColor: userType.neonColor }}
                    ></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
{/* Footer */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            <div className="text-center pt-8 border-t border-gray-800">
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400"></div>
                <span className="text-gray-400 font-medium">SECURE • RELIABLE • FAST</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-400"></div>
              </div>
              <p className="text-gray-500 mb-4">
                © 2024 Campus Connect. All rights reserved. |{' '}
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300">
                  Privacy Policy
                </button>
                {' '} | {' '}
                <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300">
                  Terms of Service
                </button>
              </p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusConnectLogin;