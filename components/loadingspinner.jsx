// components/ui/LoadingSpinner.jsx - Reusable Loading Component
import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'emerald', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    emerald: 'border-emerald-500',
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    white: 'border-white'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`} />
      {text && <span className="ml-3 text-slate-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;