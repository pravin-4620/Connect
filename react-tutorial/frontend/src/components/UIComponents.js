import React from 'react';
import { AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Toast Notification Component
export const Toast = ({ message, type = 'info', onClose }) => {
  const { isDark } = useTheme();
  
  if (!message) return null;

  const bgColor = {
    success: isDark ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200',
    error: isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200',
    warning: isDark ? 'bg-yellow-900/50 border-yellow-700' : 'bg-yellow-50 border-yellow-200',
    info: isDark ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-200'
  }[type] || (isDark ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-200');

  const iconColor = {
    success: isDark ? 'text-green-400' : 'text-green-600',
    error: isDark ? 'text-red-400' : 'text-red-600',
    warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
    info: isDark ? 'text-blue-400' : 'text-blue-600'
  }[type] || (isDark ? 'text-blue-400' : 'text-blue-600');

  const textColor = {
    success: isDark ? 'text-green-200' : 'text-green-900',
    error: isDark ? 'text-red-200' : 'text-red-900',
    warning: isDark ? 'text-yellow-200' : 'text-yellow-900',
    info: isDark ? 'text-blue-200' : 'text-blue-900'
  }[type] || (isDark ? 'text-blue-200' : 'text-blue-900');

  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }[type] || Info;

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border shadow-lg px-4 md:px-6 py-3 md:py-4 flex items-center space-x-3 max-w-sm rounded`}>
      <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
      <span className={`text-sm ${textColor}`}>{message}</span>
      {onClose && (
        <button onClick={onClose} className={`ml-2 ${iconColor} hover:opacity-70`}>
          ×
        </button>
      )}
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action, isDark: propIsDark }) => {
  // Support both prop and context-based dark mode
  let isDark = propIsDark;
  try {
    const theme = useTheme();
    isDark = propIsDark ?? theme?.isDark ?? false;
  } catch {
    isDark = propIsDark ?? false;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className={`p-3 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <Icon className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
      </div>
      <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm text-center max-w-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      {action}
    </div>
  );
};

// Loading Skeleton Component
export const SkeletonLoader = ({ count = 3, height = 'h-12', isDark: propIsDark }) => {
  let isDark = propIsDark;
  try {
    const theme = useTheme();
    isDark = propIsDark ?? theme?.isDark ?? false;
  } catch {
    isDark = propIsDark ?? false;
  }

  return (
    <div className="space-y-3">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className={`${height} ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded`} />
      ))}
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', text = 'Loading...', isDark: propIsDark }) => {
  let isDark = propIsDark;
  try {
    const theme = useTheme();
    isDark = propIsDark ?? theme?.isDark ?? false;
  } catch {
    isDark = propIsDark ?? false;
  }

  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }[size] || 'h-6 w-6';

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizeClass} border-2 ${isDark ? 'border-gray-600 border-t-gray-200' : 'border-gray-300 border-t-gray-900'} rounded-full animate-spin mb-2`} />
      {text && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{text}</p>}
    </div>
  );
};

export default {
  Toast,
  EmptyState,
  SkeletonLoader,
  LoadingSpinner
};
