import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { register } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const StudentRegistration = ({ onBack, onSuccess, defaultRole = 'student' }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    card: isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    iconBg: isDark ? 'bg-gray-700' : 'bg-gray-50',
  };

  // Get role title for display
  const getRoleTitle = () => {
    switch (defaultRole) {
      case 'student':
        return 'Student';
      case 'mentor':
        return 'Mentor';
      case 'placement_officer':
        return 'Placement Officer';
      default:
        return 'User';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(formData);
      
      if (response.success) {
        setSuccess('Registration successful! Please login to continue.');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: defaultRole
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`flex items-center ${themeClasses.textSecondary} hover:opacity-70 mb-6 transition`}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Login
        </button>

        {/* Registration Card */}
        <div className={`rounded-lg shadow-lg p-8 border ${themeClasses.card}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`${themeClasses.iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <User className={themeClasses.text} size={32} />
            </div>
            <h2 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>{getRoleTitle()} Registration</h2>
            <p className={themeClasses.textSecondary}>Create your CampusConnect account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`${isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-800'} border px-4 py-3 rounded-lg mb-4 flex items-start`}>
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className={`${isDark ? 'bg-green-900/50 border-green-700 text-green-300' : 'bg-green-50 border-green-300 text-green-800'} border px-4 py-3 rounded-lg mb-4 flex items-start`}>
              <CheckCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Full Name *
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`} size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${themeClasses.input}`}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* College Email */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Email *
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`} size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${themeClasses.input}`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <p className={`text-xs ${themeClasses.textMuted} mt-1`}>Use a valid email address</p>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Password *
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${themeClasses.input}`}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} hover:opacity-70`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`} size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${themeClasses.input}`}
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} hover:opacity-70`}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm mt-6`}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <p className={`text-center text-sm ${themeClasses.textSecondary} mt-6`}>
            Already have an account?{' '}
            <button
              onClick={onBack}
              className={`${themeClasses.text} font-semibold hover:underline`}
            >
              Login here
            </button>
          </p>
        </div>

        {/* Info Note */}
        <div className={`mt-6 ${isDark ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            <strong>Note:</strong> After registration, you'll need to complete your profile with academic details, skills, and other information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
