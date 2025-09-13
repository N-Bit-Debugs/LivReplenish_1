import React, { useState, useMemo } from 'react';

// Mock store hook for demonstration (replace with your actual store)
const useInterfaceStore = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: Date.now() }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    showNotification,
    removeNotification,
    isLoading,
    setIsLoading
  };
};

// Utility functions
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}min` : ''}`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// Loading Skeleton Component
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 lg:p-8">
    <div className="max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2"></div>
        <div className="h-5 bg-slate-200 rounded w-48"></div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="text-right">
                <div className="h-8 bg-slate-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-slate-200 rounded w-12"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-32"></div>
          </div>
        ))}
      </div>
      
      {/* Rituals Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-slate-200 rounded-xl"></div>
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Enhanced Stat Card Component
const StatCard = ({ title, value, unit, icon, color, description, progress, trend }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          <span className="text-sm text-slate-500">{unit}</span>
          {trend && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              trend > 0 ? 'text-emerald-600 bg-emerald-100' : 
              trend < 0 ? 'text-red-600 bg-red-100' : 
              'text-slate-600 bg-slate-100'
            }`}>
              {trend > 0 ? '+' : ''}{trend}
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 capitalize">{title}</div>
      </div>
    </div>
    
    {typeof progress === 'number' && (
      <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
        <div 
          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    )}
    
    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
  </div>
);

// Enhanced Ritual Card Component
const RitualCard = ({ ritual, onStart, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const getRitualIcon = (type) => {
    const icons = {
      meditation: '🧘‍♀️',
      breathing: '💨',
      focus: '🎯',
      movement: '🤸‍♀️',
      mindfulness: '🌸',
      energy: '⚡',
      default: '✨'
    };
    return icons[type] || icons.default;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(ritual.id);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border transition-all duration-300 relative overflow-hidden group ${
      ritual.completed 
        ? 'border-emerald-200 bg-emerald-50/30' 
        : 'border-white/50 hover:shadow-xl hover:scale-[1.02] hover:border-emerald-300/50'
    }`}>
      
      {/* Completion Badge */}
      {ritual.completed && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-emerald-500 text-white rounded-full p-2 shadow-lg ring-4 ring-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={`text-3xl transition-transform duration-300 ${!ritual.completed && 'group-hover:scale-110'}`}>
          {getRitualIcon(ritual.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`font-semibold text-lg ${ritual.completed ? 'text-emerald-800' : 'text-slate-800'}`}>
              {ritual.name}
            </h3>
            {ritual.difficulty && (
              <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getDifficultyColor(ritual.difficulty)}`}>
                {ritual.difficulty}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatDuration(ritual.duration)}
            </span>
            {ritual.estimatedImpact && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                +{ritual.estimatedImpact} pts
              </span>
            )}
          </div>
        </div>
      </div>

      <p className={`text-sm leading-relaxed mb-4 ${ritual.completed ? 'text-emerald-600' : 'text-slate-600'}`}>
        {ritual.description}
      </p>

      {ritual.benefits && ritual.benefits.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {ritual.benefits.slice(0, 2).map((benefit, index) => (
            <span key={index} className={`px-2 py-1 text-xs rounded-lg font-medium ${
              ritual.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {benefit}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {ritual.completed ? (
          <div className="flex-1 flex items-center justify-center py-3 px-4 text-emerald-700 font-medium bg-emerald-50 rounded-xl border border-emerald-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Completed Today
          </div>
        ) : (
          <>
            <button
              onClick={() => onStart(ritual.id)}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Ritual
              </span>
            </button>
            
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-4 py-3 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              title="Mark as complete"
            >
              {isCompleting ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>

      {/* Progress indicator */}
      {ritual.progress && ritual.progress > 0 && !ritual.completed && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(ritual.progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(ritual.progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Action Card
const QuickActionCard = ({ onQuickBoost }) => (
  <div className="bg-gradient-to-r from-emerald-100 to-blue-100 rounded-2xl p-6 mb-8 border border-emerald-200">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Need a quick energy boost?
        </h3>
        <p className="text-slate-600">Start with a 5-minute breathing exercise to reset your focus</p>
      </div>
      <button 
        onClick={onQuickBoost}
        className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
      >
        Quick Boost ⚡
      </button>
    </div>
  </div>
);

// Daily Insight Card
const InsightCard = () => (
  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-200">
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
        💡
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 mb-2">Today's Insight</h4>
        <p className="text-slate-700 leading-relaxed">
          Consistency beats perfection. Each ritual you complete strengthens neural pathways and builds lasting habits. 
          Small daily actions create profound long-term transformations.
        </p>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ filter }) => (
  <div className="col-span-full bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-slate-200">
    <div className="text-6xl mb-4">
      {filter === 'completed' ? '🎉' : filter === 'pending' ? '⏳' : '📋'}
    </div>
    <h3 className="text-xl font-semibold text-slate-700 mb-3">
      {filter === 'completed' ? 'All rituals completed!' : 
       filter === 'pending' ? 'No pending rituals' : 
       'No rituals planned'}
    </h3>
    <p className="text-slate-500 leading-relaxed">
      {filter === 'completed' ? 'Excellent work! You\'ve completed all your rituals for today.' : 
       filter === 'pending' ? 'Great job staying on track!' :
       'Your personalized rituals will appear here once your plan is ready.'}
    </p>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { notifications, showNotification, removeNotification, isLoading } = useInterfaceStore();
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with real API call
  const [dashboardData] = useState({
    vitalityScore: 78,
    streak: 7,
    rituals: [
      {
        id: 1,
        name: 'Morning Mindfulness',
        type: 'meditation',
        duration: 600, // 10 minutes in seconds
        completed: false,
        difficulty: 'beginner',
        description: 'Start your day with focused breathing and gentle awareness to center your mind.',
        benefits: ['Stress Relief', 'Mental Clarity'],
        estimatedImpact: 12,
        progress: 0
      },
      {
        id: 2,
        name: 'Focus Flow Session',
        type: 'focus',
        duration: 900, // 15 minutes
        completed: true,
        difficulty: 'intermediate',
        description: 'Deep work preparation with concentration techniques and mental clarity exercises.',
        benefits: ['Productivity', 'Focus'],
        estimatedImpact: 18,
        progress: 100
      },
      {
        id: 3,
        name: 'Energy Reset Breathing',
        type: 'breathing',
        duration: 300, // 5 minutes
        completed: false,
        difficulty: 'beginner',
        description: 'Quick energizing breathing pattern to restore alertness and mental energy.',
        benefits: ['Energy Boost', 'Alertness'],
        estimatedImpact: 8,
        progress: 25
      },
      {
        id: 4,
        name: 'Mindful Movement',
        type: 'movement',
        duration: 1200, // 20 minutes
        completed: false,
        difficulty: 'intermediate',
        description: 'Gentle stretching and movement to awaken your body and improve circulation.',
        benefits: ['Flexibility', 'Energy'],
        estimatedImpact: 15,
        progress: 0
      }
    ]
  });

  // Computed values
  const stats = useMemo(() => {
    const completedToday = dashboardData.rituals.filter(r => r.completed).length;
    const totalToday = dashboardData.rituals.length;
    const progressPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    
    return {
      streak: dashboardData.streak,
      completedToday,
      totalToday,
      vitalityScore: dashboardData.vitalityScore,
      progressPercentage,
      totalPoints: dashboardData.rituals
        .filter(r => r.completed)
        .reduce((sum, r) => sum + (r.estimatedImpact || 0), 0)
    };
  }, [dashboardData]);

  // Filter rituals based on status
  const filteredRituals = useMemo(() => {
    return dashboardData.rituals.filter(ritual => {
      if (filterStatus === 'completed') return ritual.completed;
      if (filterStatus === 'pending') return !ritual.completed;
      return true;
    });
  }, [dashboardData.rituals, filterStatus]);

  // Event handlers
  const handleStartRitual = (ritualId) => {
    showNotification(`Starting ritual...`, 'info');
    // Navigate to ritual page
    console.log('Navigate to ritual:', ritualId);
  };

  const handleCompleteRitual = async (ritualId) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      showNotification('Ritual completed! Great work! 🎉', 'success');
      
      // In real app, you'd update the data here or refetch from API
      console.log('Ritual completed:', ritualId);
    } catch (error) {
      showNotification('Failed to complete ritual. Please try again.', 'error');
    }
  };

  const handleQuickBoost = () => {
    showNotification('Starting quick boost session...', 'info');
    // Navigate to quick boost ritual
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 lg:p-8">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div key={notification.id} className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg p-4 max-w-sm animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-slate-600 ml-3"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {getGreeting()}, Sarah! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Ready to boost your vitality today? You're doing amazing!
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Current Streak"
            value={stats.streak}
            unit="days"
            icon="🔥"
            color="from-orange-400 to-red-500"
            description="Keep building those habits!"
            trend={+1}
          />
          <StatCard
            title="Today's Progress"
            value={stats.progressPercentage}
            unit="%"
            icon="📈"
            color="from-emerald-400 to-emerald-600"
            description={`${stats.completedToday}/${stats.totalToday} rituals done`}
            progress={stats.progressPercentage}
          />
          <StatCard
            title="Vitality Score"
            value={stats.vitalityScore}
            unit="pts"
            icon="⚡"
            color="from-blue-400 to-purple-500"
            description="Your wellness metric"
            trend={+5}
          />
          <StatCard
            title="Points Earned"
            value={stats.totalPoints}
            unit="pts"
            icon="⭐"
            color="from-purple-400 to-pink-500"
            description="Today's achievements"
          />
        </div>

        {/* Quick Action */}
        <QuickActionCard onQuickBoost={handleQuickBoost} />

        {/* Today's Rituals */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-2xl font-bold text-slate-800">Today's Rituals</h2>
              <p className="text-slate-600">Your personalized daily wellness plan</p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-white/30">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'completed', label: 'Completed' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    filterStatus === filter.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rituals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRituals.map((ritual) => (
              <RitualCard
                key={ritual.id}
                ritual={ritual}
                onStart={handleStartRitual}
                onComplete={handleCompleteRitual}
              />
            ))}
          </div>

          {filteredRituals.length === 0 && (
            <EmptyState filter={filterStatus} />
          )}
        </section>

        {/* Daily Insight */}
        <InsightCard />
      </div>
    </div>
  );
};

export default Dashboard;