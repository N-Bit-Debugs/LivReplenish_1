// lib/utils.js

/**
 * Format duration from seconds to human readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0min';
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Get appropriate greeting based on time of day
 * @returns {string} Time-appropriate greeting
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

/**
 * Format date for display
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let lastExecution = 0;
  
  return function (...args) {
    const context = this;
    const now = Date.now();
    
    if (now - lastExecution >= delay) {
      func.apply(context, args);
      lastExecution = now;
    }
  };
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  return `${prefix}${prefix ? '-' : ''}${timestamp}-${randomPart}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Clamp a number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculate percentage with optional precision
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} precision - Decimal places (default: 0)
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total, precision = 0) => {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(precision));
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString();
};

/**
 * Get score color based on value
 * @param {number} score - Score value (0-100)
 * @returns {Object} Color classes for text and background
 */
export const getScoreColor = (score) => {
  if (score >= 80) {
    return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      gradient: 'from-emerald-500 to-emerald-600'
    };
  } else if (score >= 60) {
    return {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    };
  } else if (score >= 40) {
    return {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      gradient: 'from-amber-500 to-amber-600'
    };
  } else {
    return {
      text: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      gradient: 'from-red-500 to-red-600'
    };
  }
};

/**
 * Get difficulty styling
 * @param {string} difficulty - Difficulty level
 * @returns {string} CSS classes
 */
export const getDifficultyStyles = (difficulty) => {
  const styles = {
    beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
    advanced: 'bg-red-100 text-red-700 border-red-200'
  };
  
  return styles[difficulty?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Sleep function for async operations
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
};

/**
 * Get ritual type icon
 * @param {string} type - Ritual type
 * @returns {string} Emoji icon
 */
export const getRitualIcon = (type) => {
  const iconMap = {
    meditation: '🧘‍♀️',
    breathing: '💨',
    focus: '🎯',
    movement: '🤸‍♀️',
    mindfulness: '🌸',
    energy: '⚡',
    relaxation: '😌',
    gratitude: '🙏',
    visualization: '💭',
    stretching: '🤸',
    cardio: '🏃‍♀️',
    strength: '💪',
    yoga: '🧘',
    default: '✨'
  };
  
  return iconMap[type?.toLowerCase()] || iconMap.default;
};

/**
 * Calculate streak from completion data
 * @param {Array} completionData - Array of completion objects with date and completed fields
 * @returns {Object} Current and longest streak information
 */
export const calculateStreak = (completionData = []) => {
  if (!completionData.length) {
    return { current: 0, longest: 0 };
  }
  
  // Sort by date (most recent first)
  const sortedData = [...completionData].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate current streak from most recent date
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i].completed) {
      tempStreak++;
      if (i === 0 || currentStreak === 0) {
        currentStreak = tempStreak;
      }
    } else {
      if (i === 0) {
        currentStreak = 0;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return {
    current: currentStreak,
    longest: longestStreak
  };
};

/**
 * Local storage utilities with error handling
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear: () => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// Default export with commonly used utilities
export default {
  formatDuration,
  getGreeting,
  formatRelativeTime,
  formatDate,
  debounce,
  throttle,
  deepClone,
  generateId,
  validateEmail,
  clamp,
  calculatePercentage,
  formatNumber,
  getScoreColor,
  getDifficultyStyles,
  isEmpty,
  sleep,
  retryWithBackoff,
  getRitualIcon,
  calculateStreak,
  storage
};