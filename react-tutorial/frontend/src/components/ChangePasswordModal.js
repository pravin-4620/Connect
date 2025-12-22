import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import { changePassword, updateStoredUser } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const ChangePasswordModal = ({ onSuccess, onClose }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const themeClasses = {
    bg: isDark ? 'bg-gray-800' : 'bg-white',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-600' : 'border-gray-200',
    input: isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    iconBg: isDark ? 'bg-blue-900/50' : 'bg-blue-50',
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (response.success) {
        updateStoredUser({ isFirstLogin: false });
        alert('Password changed successfully!');
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/80' : 'bg-gray-900/75'} flex items-center justify-center z-50 p-4`}>
      <div className={`${themeClasses.bg} rounded-lg shadow-2xl max-w-md w-full p-8 relative border ${themeClasses.border}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${themeClasses.textMuted} hover:opacity-70 transition`}
        >
          <X size={24} />
        </button>

        <div className="flex items-center mb-6">
          <div className={`${themeClasses.iconBg} p-3 rounded-full mr-4`}>
            <Lock className={isDark ? 'text-blue-400' : 'text-blue-600'} size={28} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Change Password</h2>
            <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>You must change your default password</p>
          </div>
        </div>

        {error && (
          <div className={`${isDark ? 'bg-red-900/50 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-800'} border px-4 py-3 rounded-lg mb-4 text-sm`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${themeClasses.input}`}
                required
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`}
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${themeClasses.input}`}
                required
                placeholder="Enter new password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`}
              >
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className={`text-xs ${themeClasses.textMuted} mt-1`}>Minimum 6 characters</p>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${themeClasses.input}`}
                required
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted}`}
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white py-3 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm`}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>

        <p className={`text-xs ${themeClasses.textMuted} mt-6 text-center`}>
          Make sure to remember your new password!
        </p>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
