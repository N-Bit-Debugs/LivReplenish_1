// components/RitualCard.jsx - Enhanced with better UI and animations
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import useInterfaceStore from '@/stores/interface-store';

const RitualCard = ({ ritual }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showNotification } = useInterfaceStore();
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced completion mutation with optimistic updates
  const completeRitualMutation = useMutation({
    mutationFn: (ritualId) => apiClient.post(`/api/rituals/${ritualId}/complete`),
    onMutate: async (ritualId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['plan', 'today'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['plan', 'today']);
      
      // Optimistically update
      queryClient.setQueryData(['plan', 'today'], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          rituals: oldData.rituals.map(r => 
            r.id === ritualId ? { ...r, completed: true } : r
          )
        };
      });
      
      return { previousData };
    },
    onSuccess: (data, ritualId) => {
      showNotification('Ritual completed! Great work! 🎉', 'success');
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['plan', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error, ritualId, context) => {
      // Rollback optimistic update
      queryClient.setQueryData(['plan', 'today'], context?.previousData);
      showNotification('Failed to complete ritual. Please try again.', 'error');
      console.error('Failed to complete ritual:', error);
    }
  });

  const handleStartRitual = () => {
    // Add loading state and smooth transition
    router.push(`/ritual/${ritual.id}`);
  };

  const handleCompleteRitual = (e) => {
    e.stopPropagation();
    completeRitualMutation.mutate(ritual.id);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getRitualTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'meditation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'breathing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'focus':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`
        relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 
        transition-all duration-300 cursor-pointer group overflow-hidden
        ${ritual.completed 
          ? 'border-emerald-200/50 bg-emerald-50/30' 
          : 'hover:shadow-xl hover:scale-[1.02] hover:border-emerald-300/50 active:scale-[0.98]'
        }
        ${isHovered && !ritual.completed ? 'shadow-lg' : ''}
      `}
      onClick={ritual.completed ? undefined : handleStartRitual}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 
        transition-opacity duration-300
        ${isHovered && !ritual.completed ? 'opacity-100' : ''}
      `} />

      {/* Completion Badge with animation */}
      {ritual.completed && (
        <div className="absolute -top-2 -right-2 z-10 animate-in zoom-in-75 duration-500">
          <div className="bg-emerald-500 text-white rounded-full p-2.5 shadow-lg ring-4 ring-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      <div className="relative p-6">
        {/* Header with enhanced visual hierarchy */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                ${ritual.completed 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-gradient-to-br from-emerald-500 to-blue-600 text-white group-hover:scale-110'
                }
              `}>
                {getRitualTypeIcon(ritual.type)}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-1 ${
                  ritual.completed ? 'text-emerald-800' : 'text-slate-800'
                }`}>
                  {ritual.name}
                </h3>
                {ritual.difficulty && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(ritual.difficulty)}`}>
                    {ritual.difficulty}
                  </span>
                )}
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${
              ritual.completed ? 'text-emerald-600' : 'text-slate-600'
            }`}>
              {ritual.description}
            </p>
          </div>
        </div>

        {/* Enhanced badges section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Duration Badge */}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              ritual.completed 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatDuration(ritual.duration)}
            </span>

            {/* Audio Indicator */}
            {ritual.audioSrc && (
              <span className={`inline-flex items-center text-xs px-2 py-1 rounded-md ${
                ritual.completed ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.785l-4.906-3.64H2a1 1 0 01-1-1V8a1 1 0 011-1h1.477l4.906-3.64a1 1 0 011-.284z" clipRule="evenodd" />
                  <path d="M11.525 6.098a1 1 0 011.37.527 2.5 2.5 0 010 2.75 1 1 0 11-1.898-.776 1.5 1.5 0 000-1.198 1 1 0 01.528-1.303z" />
                </svg>
                Guided
              </span>
            )}
          </div>

          {/* Points indicator */}
          <div className={`text-xs font-medium ${
            ritual.completed ? 'text-emerald-600' : 'text-slate-500'
          }`}>
            +{Math.floor(ritual.duration / 5) + 10} pts
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-3">
          {ritual.completed ? (
            <div className="flex-1 flex items-center justify-center py-3 px-4 text-emerald-700 font-medium bg-emerald-50 rounded-xl border border-emerald-200">
              <svg className="w-4 h-4 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Completed Today
            </div>
          ) : (
            <>
              <button
                onClick={handleStartRitual}
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
                onClick={handleCompleteRitual}
                disabled={completeRitualMutation.isPending}
                className="px-4 py-3 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                title="Mark as complete"
              >
                {completeRitualMutation.isPending ? (
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

        {/* Progress indicator for in-progress rituals */}
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
    </div>
  );
};

export default RitualCard;