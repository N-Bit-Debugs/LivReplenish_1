// components/Dashboard.jsx - Optimized React Dashboard
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { formatDuration, getGreeting } from '@/lib/utils';
import useInterfaceStore from '@/stores/interface-store';

const Dashboard = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const { showSuccessNotification } = useInterfaceStore();

  // Fetch today's plan data
  const { data: planData, isLoading } = useQuery({
    queryKey: ['plan', 'today'],
    queryFn: async () => {
      // Mock data for development
      return {
        vitalityScore: 78,
        rituals: [
          {
            id: 1,
            name: 'Morning Mindfulness',
            type: 'meditation',
            duration: 600, // 10 minutes
            completed: false,
            difficulty: 'beginner',
            description: 'Start your day with focused breathing and gentle awareness.',
            benefits: ['Stress Relief', 'Focus'],
            estimatedImpact: 12
          },
          {
            id: 2,
            name: 'Focus Flow',
            type: 'focus',
            duration: 900, // 15 minutes
            completed: true,
            difficulty: 'intermediate',
            description: 'Deep work preparation with concentration techniques.',
            benefits: ['Productivity', 'Mental Clarity'],
            estimatedImpact: 18
          },
          {
            id: 3,
            name: 'Energy Reset',
            type: 'breathing',
            duration: 300, // 5 minutes
            completed: false,
            difficulty: 'beginner',
            description: 'Quick breathing exercise to restore energy and alertness.',
            benefits: ['Energy Boost', 'Alertness'],
            estimatedImpact: 8
          }
        ]
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredRituals = planData?.rituals?.filter(ritual => {
    if (filterStatus === 'completed') return ritual.completed;
    if (filterStatus === 'pending') return !ritual.completed;
    return true;
  }) || [];

  const stats = {
    streak: 7,
    completedToday: planData?.rituals?.filter(r => r.completed).length || 0,
    totalToday: planData?.rituals?.length || 0,
    vitalityScore: planData?.vitalityScore || 0
  };

  const progressPercentage = stats.totalToday > 0 ? Math.round((stats.completedToday / stats.totalToday) * 100) : 0;

  const handleCompleteRitual = async (ritualId) => {
    try {
      // Mock API call
      showSuccessNotification('Ritual marked as complete!');
      // In real app: await apiClient.post(API_ENDPOINTS.COMPLETE_RITUAL(ritualId))
    } catch (error) {
      console.error('Failed to complete ritual:', error);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {getGreeting()}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Ready to boost your vitality today?
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Current Streak"
            value={stats.streak}
            unit="days"
            icon="🔥"
            color="from-orange-400 to-red-500"
            description="Keep building those habits!"
          />
          <StatCard
            title="Today's Progress"
            value={progressPercentage}
            unit="%"
            icon="📈"
            color="from-emerald-400 to-green-500"
            description={`${stats.completedToday}/${stats.totalToday} rituals done`}
            progress={progressPercentage}
          />
          <StatCard
            title="Vitality Score"
            value={stats.vitalityScore}
            unit="pts"
            icon="⚡"
            color="from-blue-400 to-purple-500"
            description="Your wellness metric"
          />
        </div>

        {/* Quick Action */}
        <QuickActionCard />

        {/* Today's Rituals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Today's Rituals</h2>
              <p className="text-slate-600">Your personalized daily plan</p>
            </div>
            
            <div className="flex gap-2">
              {['all', 'pending', 'completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filterStatus === filter
                      ? 'bg-wellness-500 text-white'
                      : 'text-slate-600 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRituals.map((ritual) => (
              <RitualCard
                key={ritual.id}
                ritual={ritual}
                onComplete={() => handleCompleteRitual(ritual.id)}
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

// Optimized Sub-components
const StatCard = ({ title, value, unit, icon, color, description, progress }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-800">{value}{unit}</div>
        <div className="text-sm text-slate-500">{title.toLowerCase()}</div>
      </div>
    </div>
    
    {progress !== undefined && (
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <div 
          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
    
    <p className="text-sm text-slate-600">{description}</p>
  </div>
);

const QuickActionCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">
          Need a quick boost?
        </h3>
        <p className="text-slate-600">Start with a 5-minute breathing exercise</p>
      </div>
      <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg">
        Quick Boost 🎯
      </button>
    </div>
  </div>
);

const RitualCard = ({ ritual, onComplete }) => {
  const getRitualIcon = (type) => {
    const icons = {
      meditation: '🧘‍♀️',
      breathing: '💨',
      focus: '🎯',
      movement: '🤸‍♀️',
      default: '✨'
    };
    return icons[type] || icons.default;
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all ${
      ritual.completed ? 'opacity-75' : 'hover:-translate-y-1'
    }`}>
      
      {ritual.completed && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="text-3xl">{getRitualIcon(ritual.type)}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-lg">{ritual.name}</h3>
          <p className="text-sm text-slate-500">
            {formatDuration(ritual.duration)} • {ritual.difficulty}
          </p>
        </div>
        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
          +{ritual.estimatedImpact} pts
        </span>
      </div>

      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
        {ritual.description}
      </p>

      {ritual.benefits && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {ritual.benefits.slice(0, 2).map((benefit, index) => (
            <span key={index} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg">
              {benefit}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button 
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
            ritual.completed
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-wellness-500 text-white hover:bg-wellness-600 active:scale-95'
          }`}
          disabled={ritual.completed}
        >
          {ritual.completed ? '✓ Completed' : 'Start Ritual'}
        </button>
        
        {!ritual.completed && (
          <button
            onClick={() => onComplete()}
            className="px-4 py-3 border-2 border-wellness-200 text-wellness-700 rounded-xl hover:bg-wellness-50 transition-all"
            title="Mark as complete"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  );
};

const InsightCard = () => (
  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-200">
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl">
        💡
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 mb-2">Today's Insight</h4>
        <p className="text-slate-700">
          Consistent practice creates lasting change. Each ritual strengthens your mental resilience and builds better habits for life.
        </p>
      </div>
    </div>
  </div>
);

const EmptyState = ({ filter }) => (
  <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
    <div className="text-6xl mb-4">
      {filter === 'completed' ? '🎉' : filter === 'pending' ? '⏳' : '📋'}
    </div>
    <h3 className="text-lg font-medium text-slate-600 mb-2">
      {filter === 'completed' ? 'All done for today!' : 
       filter === 'pending' ? 'No pending rituals' : 
       'No rituals planned'}
    </h3>
    <p className="text-slate-500">
      {filter === 'completed' ? 'Great job completing your rituals!' : 
       'Check back later for new activities.'}
    </p>
  </div>
);

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 lg:p-8">
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;