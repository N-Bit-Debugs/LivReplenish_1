import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import RitualCard from './RitualCard';
import useInterfaceStore from '@/stores/interface-store';

const Dashboard = () => {
  const { setIsLoading } = useInterfaceStore();

  // Fetch today's plan data
  const { data: planData, isLoading, isError, error } = useQuery({
    queryKey: ['plan', 'today'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/plan/today');
        return response.data;
      } finally {
        setIsLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Calculate streak and progress metrics
  const calculateStreak = (rituals) => {
    if (!rituals) return 0;
    
    // This is a simplified calculation - backend should provide this
    const completedToday = rituals.filter(r => r.completed).length;
    const totalRituals = rituals.length;
    
    // Mock streak calculation (backend will provide real streak data)
    return completedToday === totalRituals ? 7 : Math.floor(Math.random() * 5) + 1;
  };

  const calculateProgress = (rituals) => {
    if (!rituals || rituals.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = rituals.filter(r => r.completed).length;
    const total = rituals.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const calculatePoints = (rituals) => {
    if (!rituals) return 0;
    
    return rituals
      .filter(r => r.completed)
      .reduce((total, ritual) => {
        // Simple point system: 10 points per completed ritual
        // Add bonus for duration: longer rituals = more points
        const durationBonus = Math.floor(ritual.duration / 5); // 1 point per 5 minutes
        return total + 10 + durationBonus;
      }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            
            {/* Rituals skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
                  <div className="flex space-x-4">
                    <div className="h-10 bg-slate-200 rounded flex-1"></div>
                    <div className="h-10 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Unable to Load Dashboard
            </h3>
            <p className="text-slate-600 mb-6">
              {error?.message || 'Something went wrong. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStreak = calculateStreak(planData?.rituals);
  const progress = calculateProgress(planData?.rituals);
  const points = calculatePoints(planData?.rituals);

  // Get current time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {getGreeting()}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Ready to level up your vitality today?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Streak */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">
                  {currentStreak}
                </div>
                <div className="text-sm text-slate-500">day streak</div>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Keep it up! You're building great habits.
            </div>
          </div>

          {/* Today's Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">
                  {progress.percentage}%
                </div>
                <div className="text-sm text-slate-500">
                  {progress.completed}/{progress.total} done
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-slate-600">
              Today's completion rate
            </div>
          </div>

          {/* Vitality Score */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-800">
                  {planData?.vitalityScore || 0}
                </div>
                <div className="text-sm text-slate-500">vitality score</div>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Your overall wellness metric
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  Ready for a quick boost?
                </h3>
                <p className="text-slate-600">
                  Start with a 5-minute focus session
                </p>
              </div>
              <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                Quick Focus 🎯
              </button>
            </div>
          </div>
        </div>

        {/* Today's Rituals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Today's Rituals
              </h2>
              <p className="text-slate-600">
                Your personalized daily plan
              </p>
            </div>
            
            {/* Filter/Sort Options */}
            <div className="flex items-center space-x-3">
              <button className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-white transition-colors duration-200">
                All
              </button>
              <button className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-white transition-colors duration-200">
                Pending
              </button>
              <button className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-white transition-colors duration-200">
                Completed
              </button>
            </div>
          </div>

          {/* Ritual Cards Grid */}
          {planData?.rituals && planData.rituals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {planData.rituals.map((ritual) => (
                <RitualCard 
                  key={ritual.id} 
                  ritual={ritual}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                No rituals planned for today
              </h3>
              <p className="text-slate-500 mb-6">
                Your personalized plan will appear here once it's generated.
              </p>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl transition-colors duration-200">
                Generate Plan
              </button>
            </div>
          )}
        </div>

        {/* Daily Tip */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">
                  Today's Insight
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  Your brain forms new neural pathways through consistent practice. 
                  Each ritual you complete today strengthens your mental resilience and focus capacity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;