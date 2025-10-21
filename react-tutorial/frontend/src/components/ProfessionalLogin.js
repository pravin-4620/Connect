import { useState } from "react";
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

const ProfessionalLogin = () => {
  const [selectedUserType, setSelectedUserType] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const VALID_CREDENTIALS = {
    'student': { email: 'student@college.edu', password: 'student123' },
    'mentor': { email: 'mentor@college.edu', password: 'mentor123' },
    'placement-cell': { email: 'placement@college.edu', password: 'placement123' }
  };

  const userTypes = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Access Your Career Portal',
      description: 'Track applications, find internships, and connect with mentors',
      icon: User,
      color: 'bg-gray-900',
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-700'
    },
    {
      id: 'mentor',
      title: 'Mentor',
      subtitle: 'Guide Student Success',
      description: 'Support students, review applications, and monitor progress',
      icon: GraduationCap,
      color: 'bg-gray-900',
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-700'
    },
    {
      id: 'placement-cell',
      title: 'Placement Officer',
      subtitle: 'Manage Campus Recruitment',
      description: 'Coordinate companies, manage drives, and analyze placement data',
      icon: Building2,
      color: 'bg-gray-900',
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-700'
    }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const creds = VALID_CREDENTIALS[selectedUserType];
    
    setTimeout(() => {
      if (loginData.email === creds.email && loginData.password === creds.password) {
        setIsAuthenticated(true);
        setAuthenticatedUser({
          email: loginData.email,
          userType: selectedUserType,
          name: selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)
        });
      } else {
        setLoginError('Invalid email or password. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    setSelectedUserType('');
    setShowLogin(false);
    setLoginData({ email: '', password: '' });
    setLoginError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setLoginError('');
  };

  // Show appropriate dashboard if authenticated
  if (isAuthenticated && authenticatedUser) {
    switch (authenticatedUser.userType) {
      case 'student':
        return <StudentDashboard onLogout={handleLogout} />;
      case 'mentor':
        return <MentorDashboard onLogout={handleLogout} />;
      case 'placement-cell':
        return <PlacementDashboard onLogout={handleLogout} />;
      default:
        return null;
    }
  }

  // Login form for selected user type
  if (showLogin && selectedUserType) {
    const userTypeData = userTypes.find(type => type.id === selectedUserType);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => {
              setShowLogin(false);
              setSelectedUserType('');
              setLoginError('');
            }}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to selection
          </button>

          {/* Login Card */}
          <div className="bg-white border-2 border-gray-200 shadow-sm">
            {/* Header */}
            <div className={`p-6 ${userTypeData.color}`}>
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-white border border-gray-300">
                  <userTypeData.icon className="h-10 w-10 text-gray-900" />
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
                <div className="mb-4 p-3 bg-gray-50 border border-gray-300">
                  <p className="text-gray-900 text-sm font-medium text-center flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-2" />
                    {loginError}
                  </p>
                </div>
              )}

              {/* Info Notice */}
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
                <p className="text-gray-700 text-xs text-center">
                  Please use your institutional email to sign in
                </p>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-sm"
                    placeholder="you@college.edu"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-11 py-2.5 border border-gray-300 focus:outline-none focus:border-gray-900 transition-colors text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600 text-center font-medium mb-2">Demo Credentials:</p>
                <p className="text-xs text-gray-700 text-center">
                  <strong>Email:</strong> {VALID_CREDENTIALS[selectedUserType].email}<br />
                  <strong>Password:</strong> {VALID_CREDENTIALS[selectedUserType].password}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-gray-900 mr-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CampusConnect</h1>
                <p className="text-xs text-gray-600">Career Development Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-gray-900 mb-3">
            Welcome to CampusConnect
          </h2>
          <p className="text-gray-600 text-lg">Select your role to get started</p>
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
                className="bg-white border-2 border-gray-200 hover:border-gray-900 transition-all cursor-pointer overflow-hidden"
              >
                <div className={`p-6 ${userType.color}`}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-white border border-gray-300">
                      <Icon className="h-10 w-10 text-gray-900" />
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
                  <p className="text-gray-600 text-center text-sm mb-6">
                    {userType.description}
                  </p>
                  <button className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors flex items-center justify-center text-sm">
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
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2025 CampusConnect. All rights reserved.</p>
            <p className="mt-1 text-xs">Need help? Contact support@campusconnect.edu</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfessionalLogin;
