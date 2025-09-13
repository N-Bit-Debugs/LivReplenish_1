// components/ProgressPage.jsx - Enhanced with better analytics and visualizations
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { apiClient, handleApiError } from '@/lib/api-client';
import useInterfaceStore from '@/stores/interface-store';

// Loading Spinner Component
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg className="w-full h-full text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <p className="text-slate-600 font-medium">{text}</p>
    </div>
  );
};

const ProgressPage = () => {
  const { showNotification, progressTimeRange, setProgressTimeRange, progressChartType, setProgressChartType } = useInterfaceStore();
  const [timeRange, setTimeRange] = useState(progressTimeRange || '30d');
  const [chartType, setChartType] = useState(progressChartType || 'area');

  // Enhanced progress data fetching
  const { data: progressData, isLoading, isError, refetch, error } = useQuery({
    queryKey: ['progress', timeRange],
    queryFn: async () => {
      try {
        const response = await apiClient.getProgress(timeRange);
        return response.data;
      } catch (error) {
        handleApiError(error, showNotification);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });

  // Enhanced data processing with memoization
  const analytics = useMemo(() => {
    if (!progressData?.history || progressData.history.length === 0) {
      return null;
    }

    const history = progressData.history;
    const scores = history.map(h => h.vitalityScore);
    const currentScore = scores[scores.length - 1];
    const previousScore = scores.length > 1 ? scores[scores.length - 2] : currentScore;
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const trend = currentScore - previousScore;

    // Calculate streaks
    const calculateStreak = () => {
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].ritualsCompleted > 0) {
          tempStreak++;
          if (i === history.length - 1) currentStreak = tempStreak;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      return { current: currentStreak, longest: longestStreak };
    };

    const streaks = calculateStreak();

    // Calculate improvement rate
    const getImprovementRate = () => {
      if (history.length < 7) return 0;
      const recentAvg = scores.slice(-7).reduce((sum, score) => sum + score, 0) / 7;
      const earlierAvg = scores.slice(0, 7).reduce((sum, score) => sum + score, 0) / 7;
      return Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
    };

    const improvementRate = getImprovementRate();

    // Weekly breakdown
    const weeklyData = [];
    for (let i = 0; i < history.length; i += 7) {
      const week = history.slice(i, i + 7);
      const weekAvg = Math.round(
        week.reduce((sum, day) => sum + day.vitalityScore, 0) / week.length
      );
      const weekTotal = week.reduce((sum, day) => sum + (day.ritualsCompleted || 0), 0);
      
      weeklyData.push({
        week: `Week ${Math.floor(i / 7) + 1}`,
        average: weekAvg,
        totalRituals: weekTotal,
        consistency: Math.round((week.filter(day => day.ritualsCompleted > 0).length / week.length) * 100)
      });
    }

    return {
      current: currentScore,
      previous: previousScore,
      average: averageScore,
      max: maxScore,
      min: minScore,
      trend,
      streaks,
      improvementRate,
      weeklyData,
      totalDays: history.length,
      activeDays: history.filter(h => h.ritualsCompleted > 0).length,
      totalRituals: history.reduce((sum, h) => sum + (h.ritualsCompleted || 0), 0)
    };
  }, [progressData]);

  // Chart data formatting
  const chartData = useMemo(() => {
    if (!progressData?.history) return [];
    
    return progressData.history.map((item, index) => ({
      ...item,
      date: formatDate(item.date),
      dayNumber: index + 1,
      ritualsCompleted: item.ritualsCompleted || 0
    }));
  }, [progressData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTooltipDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Enhanced tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200">
          <p className="font-semibold text-slate-800 mb-2">
            {formatTooltipDate(data.date)}
          </p>
          <div className="space-y-1">
            <p className="text-emerald-600 font-semibold">
              Vitality Score: {data.vitalityScore}
            </p>
            <p className="text-blue-600 text-sm">
              Rituals Completed: {data.ritualsCompleted}
            </p>
            {data.mood && (
              <p className="text-purple-600 text-sm">
                Mood: {data.mood}/10
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Utility functions for styling
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  // Handle time range change
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    setProgressTimeRange(newRange);
  };

  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    setProgressChartType(newType);
  };

  // Render chart based on selected type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="vitalityScore"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="vitalityScore" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
          </BarChart>
        );
      
      default: // area
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorVitality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="vitalityScore"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#colorVitality)"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <LoadingSpinner size="xl" text="Analyzing your progress data..." />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-slate-200 text-center">
            <div className="text-red-500 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-4">
              Unable to Load Progress Data
            </h3>
            <p className="text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
              We couldn't fetch your progress analytics. {error?.message || 'This could be a temporary issue with our servers.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => refetch()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Your Progress</h1>
            <p className="text-slate-600">Track your vitality journey and celebrate your growth</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-16 shadow-sm border border-slate-200 text-center">
            <div className="text-slate-400 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-3">No Progress Data Yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
              Start completing rituals to see your progress analytics. Your journey data will appear here as you build consistency.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Your First Ritual
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                Your Progress Analytics
              </h1>
              <p className="text-lg text-slate-600">
                Insights into your vitality journey and personal growth
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-white/30 shadow-sm">
              {[
                { key: '7d', label: '7 Days' },
                { key: '30d', label: '30 Days' },
                { key: '90d', label: '90 Days' },
                { key: '1y', label: '1 Year' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => handleTimeRangeChange(range.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range.key
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Score */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-lg group ${getScoreBackground(analytics.current)}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600">Current Score</h3>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(analytics.current)}`}>
              {analytics.current}
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(analytics.trend)}
              <span className={`ml-2 ${analytics.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {analytics.trend > 0 ? '+' : ''}{analytics.trend} from yesterday
              </span>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600">Average Score</h3>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(analytics.average)}`}>
              {analytics.average}
            </div>
            <p className="text-sm text-slate-500">
              Over {analytics.totalDays} days
            </p>
          </div>

          {/* Streak Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600">Current Streak</h3>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {analytics.streaks.current}
            </div>
            <p className="text-sm text-slate-500">
              Best: {analytics.streaks.longest} days
            </p>
          </div>

          {/* Improvement Rate */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600">Improvement</h3>
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            </div>
            <div className={`text-3xl font-bold mb-2 ${analytics.improvementRate >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {analytics.improvementRate > 0 ? '+' : ''}{analytics.improvementRate}%
            </div>
            <p className="text-sm text-slate-500">
              Weekly trend
            </p>
          </div>
        </div>

        {/* Enhanced Chart Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Vitality Score Trend
              </h2>
              <p className="text-slate-600">
                Your progress visualization over time
              </p>
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 mt-4 lg:mt-0">
              {[
                { key: 'area', label: 'Area', icon: '📈' },
                { key: 'line', label: 'Line', icon: '📊' },
                { key: 'bar', label: 'Bar', icon: '📋' }
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleChartTypeChange(type.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    chartType === type.key
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <span className="mr-1">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium">No data for selected period</p>
                <p className="text-sm">Try selecting a different time range</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-emerald-600 font-semibold">📅</span>
                  </div>
                  <span className="font-medium text-slate-700">Total Days Active</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">{analytics.activeDays}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">🧘</span>
                  </div>
                  <span className="font-medium text-slate-700">Total Rituals</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{analytics.totalRituals}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">📊</span>
                  </div>
                  <span className="font-medium text-slate-700">Consistency Rate</span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {Math.round((analytics.activeDays / analytics.totalDays) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Score Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Excellent (80-100)</span>
                <div className="flex items-center">
                  <div className="w-24 bg-slate-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${chartData.length > 0 ? (chartData.filter(d => d.vitalityScore >= 80).length / chartData.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {chartData.length > 0 ? Math.round((chartData.filter(d => d.vitalityScore >= 80).length / chartData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Good (60-79)</span>
                <div className="flex items-center">
                  <div className="w-24 bg-slate-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${chartData.length > 0 ? (chartData.filter(d => d.vitalityScore >= 60 && d.vitalityScore < 80).length / chartData.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {chartData.length > 0 ? Math.round((chartData.filter(d => d.vitalityScore >= 60 && d.vitalityScore < 80).length / chartData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Fair (40-59)</span>
                <div className="flex items-center">
                  <div className="w-24 bg-slate-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${chartData.length > 0 ? (chartData.filter(d => d.vitalityScore >= 40 && d.vitalityScore < 60).length / chartData.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-amber-600">
                    {chartData.length > 0 ? Math.round((chartData.filter(d => d.vitalityScore >= 40 && d.vitalityScore < 60).length / chartData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Needs Focus (0-39)</span>
                <div className="flex items-center">
                  <div className="w-24 bg-slate-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${chartData.length > 0 ? (chartData.filter(d => d.vitalityScore < 40).length / chartData.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    {chartData.length > 0 ? Math.round((chartData.filter(d => d.vitalityScore < 40).length / chartData.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress Breakdown */}
        {analytics.weeklyData.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Weekly Breakdown</h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-max">
                {analytics.weeklyData.slice(-4).map((week, index) => (
                  <div key={week.week} className="bg-slate-50 rounded-xl p-4 min-w-48">
                    <h4 className="font-semibold text-slate-700 mb-3">{week.week}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Average Score</span>
                        <span className={`font-bold ${getScoreColor(week.average)}`}>
                          {week.average}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Rituals</span>
                        <span className="font-bold text-blue-600">{week.totalRituals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Consistency</span>
                        <span className="font-bold text-purple-600">{week.consistency}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights and Recommendations */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-slate-800 mb-3">
                Your Progress Insights
              </h4>
              <div className="space-y-3 text-slate-700 leading-relaxed">
                {analytics.trend > 0 && (
                  <p>🎉 <strong>Great momentum!</strong> Your vitality score is trending upward. You're {analytics.trend} points higher than yesterday.</p>
                )}
                
                {analytics.streaks.current >= 7 && (
                  <p>🔥 <strong>Incredible consistency!</strong> You've maintained a {analytics.streaks.current}-day streak. This kind of dedication creates lasting neural pathways.</p>
                )}
                
                {analytics.improvementRate > 10 && (
                  <p>📈 <strong>Exceptional growth!</strong> Your weekly improvement rate of {analytics.improvementRate}% shows you're building strong vitality habits.</p>
                )}
                
                {analytics.current >= 80 && (
                  <p>⭐ <strong>Peak performance zone!</strong> Your current score of {analytics.current} indicates excellent vitality levels. Keep up the outstanding work.</p>
                )}

                {analytics.current < 40 && (
                  <p>🌱 <strong>Growth opportunity!</strong> Your current score suggests there's room for improvement. Consider dedicating more time to your daily rituals for better results.</p>
                )}

                {analytics.streaks.current === 0 && analytics.totalRituals > 0 && (
                  <p>🎯 <strong>Time to restart!</strong> You've completed rituals before, so you know you can do it. Getting back on track starts with just one ritual today.</p>
                )}

                {Math.round((analytics.activeDays / analytics.totalDays) * 100) >= 80 && (
                  <p>💪 <strong>Consistency champion!</strong> Your {Math.round((analytics.activeDays / analytics.totalDays) * 100)}% consistency rate shows remarkable dedication to your wellbeing journey.</p>
                )}
                
                <div className="mt-6 p-4 bg-white/50 rounded-xl border border-emerald-100">
                  <p className="text-sm text-slate-600 font-medium">
                    💡 <strong>Remember:</strong> Every ritual completed strengthens your mental resilience and contributes to long-term wellbeing. Small, consistent actions create profound transformations over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.current < 60 && (
              <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-2xl mr-3">📚</span>
                <div>
                  <h4 className="font-medium text-amber-800">Focus on Fundamentals</h4>
                  <p className="text-sm text-amber-700">Review basic techniques to improve your scores</p>
                </div>
              </div>
            )}

            {analytics.streaks.current < 3 && (
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <h4 className="font-medium text-blue-800">Build Consistency</h4>
                  <p className="text-sm text-blue-700">Aim for 3+ consecutive days of practice</p>
                </div>
              </div>
            )}

            {analytics.totalRituals > 50 && analytics.improvementRate > 0 && (
              <div className="flex items-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-2xl mr-3">🚀</span>
                <div>
                  <h4 className="font-medium text-emerald-800">Level Up</h4>
                  <p className="text-sm text-emerald-700">Consider trying advanced rituals</p>
                </div>
              </div>
            )}

            {Math.round((analytics.activeDays / analytics.totalDays) * 100) < 50 && (
              <div className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <h4 className="font-medium text-purple-800">Set Reminders</h4>
                  <p className="text-sm text-purple-700">Enable notifications for better consistency</p>
                </div>
              </div>
            )}

            <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h4 className="font-medium text-slate-800">Track Progress</h4>
                <p className="text-sm text-slate-700">Check your analytics regularly</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-2xl mr-3">🌟</span>
              <div>
                <h4 className="font-medium text-green-800">Celebrate Wins</h4>
                <p className="text-sm text-green-700">Acknowledge your progress milestones</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;