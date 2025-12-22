import { useState, useEffect } from "react";
import {
  GraduationCap,
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield
} from 'lucide-react';
import StudentDashboard from "../StudentDashboard";
import MentorDashboard from "../MentorDashboard";
import PlacementDashboard from "../PlacementDashboard";
import StudentRegistration from "./StudentRegistration";
import { login as apiLogin, logout as apiLogout, isAuthenticated as checkAuth, getStoredUser } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const ProfessionalLogin = () => {
  const { isDark } = useTheme();
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    bgCard: isDark ? 'bg-gray-800' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    header: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    footer: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    console.log('🔍 Checking authentication...');
    const token = checkAuth();
    const user = getStoredUser();
    
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('User data:', user);
    
    if (token && user && user.role) {
      console.log('✅ Auto-login: User found in localStorage', user.role);
      setIsAuthenticated(true);
      setAuthenticatedUser({
        email: user.email,
        userType: user.role,
        name: user.name,
        id: user.id,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        profileCompleted: user.profileCompleted
      });
    } else {
      console.log('❌ No stored user or token found');
      setIsAuthenticated(false);
      setAuthenticatedUser(null);
    }
    
    setIsCheckingAuth(false);
  }, []);

  const userTypes = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Access Your Career Portal',
      description: 'Track applications, find internships, and connect with mentors',
      icon: User,
      color: isDark ? 'bg-blue-700' : 'bg-gray-900',
      bgColor: isDark ? 'bg-gray-700' : 'bg-gray-50',
      iconBg: isDark ? 'bg-gray-600' : 'bg-gray-100',
      iconColor: isDark ? 'text-gray-200' : 'text-gray-700'
    },
    {
      id: 'mentor',
      title: 'Mentor',
      subtitle: 'Guide Student Success',
      description: 'Support students, review applications, and monitor progress',
      icon: GraduationCap,
      color: isDark ? 'bg-green-700' : 'bg-gray-900',
      bgColor: isDark ? 'bg-gray-700' : 'bg-gray-50',
      iconBg: isDark ? 'bg-gray-600' : 'bg-gray-100',
      iconColor: isDark ? 'text-gray-200' : 'text-gray-700'
    },
    {
      id: 'placement',
      title: 'Placement Officer',
      subtitle: 'Manage Campus Recruitment',
      description: 'Coordinate companies, manage drives, and analyze placement data',
      icon: Building2,
      color: isDark ? 'bg-purple-700' : 'bg-gray-900',
      bgColor: isDark ? 'bg-gray-700' : 'bg-gray-50',
      iconBg: isDark ? 'bg-gray-600' : 'bg-gray-100',
      iconColor: isDark ? 'text-gray-200' : 'text-gray-700'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!loginData.email || !loginData.password) {
        setLoginError('Please enter email and password');
        setIsLoading(false);
        return;
      }

      // Call real API
      const response = await apiLogin(loginData.email, loginData.password);
      
      if (response.success && response.user) {
        console.log('Login successful, user data:', response.user);
        
        const userData = {
          email: response.user.email,
          userType: response.user.role,
          name: response.user.name,
          id: response.user.id,
          role: response.user.role,
          isFirstLogin: response.user.isFirstLogin,
          profileCompleted: response.user.profileCompleted
        };
        
        console.log('Setting authenticated user:', userData);
        
        // Set authenticated state
        setIsAuthenticated(true);
        setAuthenticatedUser(userData);
        setLoginData({ email: '', password: '' });
      } else {
        setLoginError(response.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🔓 Logging out...');
    // Call API logout
    apiLogout();
    
    // Reset state
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    setSelectedUserType('');
    setShowLogin(false);
    setLoginData({ email: '', password: '' });
    setLoginError('');
    console.log('✅ Logout complete');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setLoginError('');
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin h-12 w-12 border-4 ${isDark ? 'border-blue-500 border-t-transparent' : 'border-gray-900 border-t-transparent'} rounded-full mx-auto mb-4`}></div>
          <p className={themeClasses.textSecondary}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show appropriate dashboard if authenticated
  if (isAuthenticated && authenticatedUser) {
    console.log('🎯 Routing to dashboard for role:', authenticatedUser.role);
    
    if (!authenticatedUser.role) {
      console.error('⚠️ No role found in authenticated user');
      return (
        <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: User role not found</p>
            <button
              onClick={handleLogout}
              className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white px-6 py-2 rounded-lg`}
            >
              Logout and Try Again
            </button>
          </div>
        </div>
      );
    }
    
    switch (authenticatedUser.role) {
      case 'student':
        console.log('👨‍🎓 Loading Student Dashboard');
        return <StudentDashboard onLogout={handleLogout} user={authenticatedUser} />;
      case 'mentor':
        console.log('👨‍🏫 Loading Mentor Dashboard');
        return <MentorDashboard onLogout={handleLogout} user={authenticatedUser} />;
      case 'placement_officer':
        console.log('💼 Loading Placement Dashboard');
        return <PlacementDashboard onLogout={handleLogout} user={authenticatedUser} />;
      default:
        console.error('❌ Unknown user role:', authenticatedUser.role);
        return (
          <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
            <div className="text-center">
              <p className="text-red-600 mb-4">Unknown user role: {authenticatedUser.role}</p>
              <button
                onClick={handleLogout}
                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white px-6 py-2 rounded-lg`}
              >
                Logout
              </button>
            </div>
          </div>
        );
    }
  }

  // Show registration form if requested
  if (showRegistration) {
    // Convert selectedUserType to role format
    const roleMapping = {
      'student': 'student',
      'mentor': 'mentor',
      'placement': 'placement_officer'
    };
    
    const registrationRole = roleMapping[selectedUserType] || 'student';
    
    return (
      <StudentRegistration 
        defaultRole={registrationRole}
        onBack={() => {
          setShowRegistration(false);
          // Keep the selected user type when going back
        }}
        onSuccess={() => {
          setShowRegistration(false);
          setShowLogin(true);
          // Keep the selected user type for login
        }}
      />
    );
  }

  // Login form for selected user type
  if (showLogin && selectedUserType) {
    const userTypeData = userTypes.find(type => type.id === selectedUserType);
    
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => {
              setShowLogin(false);
              setSelectedUserType('');
              setLoginError('');
            }}
            className={`mb-4 flex items-center ${themeClasses.textSecondary} hover:opacity-70 font-medium transition-colors text-sm`}
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to selection
          </button>

          {/* Login Card */}
          <div className={`${themeClasses.bgCard} border-2 ${themeClasses.border} shadow-sm`}>
            {/* Header */}
            <div className={`p-6 ${userTypeData.color}`}>
              <div className="flex items-center justify-center mb-3">
                <div className={`p-3 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}>
                  <userTypeData.icon className={`h-10 w-10 ${isDark ? 'text-gray-100' : 'text-gray-900'}`} />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-white text-center mb-1">
                {userTypeData.title} Login
              </h2>
              <p className="text-white text-center text-sm opacity-90">
                {userTypeData.subtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-6">
              {/* Error Message */}
              {loginError && (
                <div className={`mb-4 p-3 ${isDark ? 'bg-red-900/50 border-red-700' : 'bg-gray-50 border-gray-300'} border`}>
                  <p className={`${isDark ? 'text-red-300' : 'text-gray-900'} text-sm font-medium text-center flex items-center justify-center`}>
                    <Shield className="h-4 w-4 mr-2" />
                    {loginError}
                  </p>
                </div>
              )}

              {/* Info Notice */}
              <div className={`mb-4 p-3 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
                <p className={`${themeClasses.textSecondary} text-xs text-center`}>
                  Please use your institutional email to sign in
                </p>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.textMuted}`} />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-4 py-2.5 border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
                    placeholder="you@college.edu"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className={`block ${themeClasses.textSecondary} text-sm font-medium mb-2`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeClasses.textMuted}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-11 py-2.5 border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} hover:opacity-70`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                )}
              </button>

              {/* Registration Link for All User Types */}
              <div className="mt-4 text-center">
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {selectedUserType === 'student' && "New student? "}
                  {selectedUserType === 'mentor' && "New mentor? "}
                  {selectedUserType === 'placement' && "New placement officer? "}
                  <button
                    type="button"
                    onClick={() => setShowRegistration(true)}
                    className={`${themeClasses.text} font-medium hover:underline`}
                  >
                    Register here
                  </button>
                </p>
              </div>

              {/* Demo Info */}
              <div className={`mt-6 p-4 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
                <p className={`text-xs ${themeClasses.textSecondary} text-center font-medium mb-2`}>
                  💡 First time? Register an account or use demo credentials
                </p>
                <p className={`text-xs ${themeClasses.textSecondary} text-center`}>
                  Students can self-register. Contact admin for staff accounts.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // User type selection (home page)
  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Header */}
      <header className={`${themeClasses.header} border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-2 ${isDark ? 'bg-blue-600' : 'bg-gray-900'} mr-3`}>
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-semibold ${themeClasses.text}`}>CampusConnect</h1>
                <p className={`text-xs ${themeClasses.textSecondary}`}>Career Development Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-semibold ${themeClasses.text} mb-3`}>
            Welcome to CampusConnect
          </h2>
          <p className={`${themeClasses.textSecondary} text-lg`}>Select your role to get started</p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {userTypes.map((userType) => {
            const Icon = userType.icon;
            return (
              <div
                key={userType.id}
                onClick={() => {
                  setSelectedUserType(userType.id);
                  setShowLogin(true);
                }}
                className={`${themeClasses.bgCard} border-2 ${themeClasses.border} ${isDark ? 'hover:border-blue-500' : 'hover:border-gray-900'} transition-all cursor-pointer overflow-hidden`}
              >
                <div className={`p-6 ${userType.color}`}>
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}>
                      <Icon className={`h-10 w-10 ${isDark ? 'text-gray-100' : 'text-gray-900'}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white text-center mb-1">
                    {userType.title}
                  </h3>
                  <p className="text-white text-center text-sm opacity-90">
                    {userType.subtitle}
                  </p>
                </div>
                <div className="p-6">
                  <p className={`${themeClasses.textSecondary} text-center text-sm mb-6`}>
                    {userType.description}
                  </p>
                  <button className={`w-full py-2.5 px-4 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-medium transition-colors flex items-center justify-center text-sm`}>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className={`${themeClasses.footer} border-t mt-auto`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className={`text-center ${themeClasses.textSecondary} text-sm`}>
            <p>© 2025 CampusConnect. All rights reserved.</p>
            <p className="mt-1 text-xs">Need help? Contact support@campusconnect.edu</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalLogin;
