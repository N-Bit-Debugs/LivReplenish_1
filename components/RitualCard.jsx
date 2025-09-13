import React, { useState, useCallback } from 'react';
import { Play, CheckCircle2, Clock, Target, Zap, Award } from 'lucide-react';

const RitualCard = ({ 
  ritual, 
  onStart, 
  onComplete, 
  loading = false,
  className = "" 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle start ritual with loading state
  const handleStart = useCallback(async () => {
    if (loading || ritual.completed) return;
    
    try {
      await onStart?.(ritual.id);
    } catch (error) {
      console.error('Failed to start ritual:', error);
    }
  }, [onStart, ritual.id, ritual.completed, loading]);

  // Handle complete ritual with loading state  
  const handleComplete = useCallback(async (e) => {
    e.stopPropagation();
    if (isCompleting || ritual.completed) return;
    
    setIsCompleting(true);
    try {
      await onComplete?.(ritual.id);
    } catch (error) {
      console.error('Failed to complete ritual:', error);
    } finally {
      setIsCompleting(false);
    }
  }, [onComplete, ritual.id, ritual.completed, isCompleting]);

  // Format duration helper
  const formatDuration = (seconds) => {
    if (!seconds) return '0min';
    
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Get ritual type icon
  const getRitualIcon = (type) => {
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
      default: '✨'
    };
    return iconMap[type?.toLowerCase()] || iconMap.default;
  };

  // Get difficulty styling
  const getDifficultyStyles = (difficulty) => {
    const styles = {
      beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      intermediate: 'bg-amber-100 text-amber-700 border-amber-200', 
      advanced: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[difficulty?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Calculate estimated points
  const getEstimatedPoints = () => {
    if (ritual.estimatedImpact) return ritual.estimatedImpact;
    
    // Fallback calculation based on duration and difficulty
    const basePoints = Math.floor((ritual.duration || 300) / 60); // 1 point per minute
    const difficultyMultiplier = {
      beginner: 1,
      intermediate: 1.2,
      advanced: 1.5
    };
    
    const multiplier = difficultyMultiplier[ritual.difficulty?.toLowerCase()] || 1;
    return Math.max(5, Math.round(basePoints * multiplier));
  };

  return (
    <div 
      className={`
        relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border 
        transition-all duration-300 cursor-pointer group overflow-hidden
        ${ritual.completed 
          ? 'border-emerald-200 bg-emerald-50/30' 
          : 'border-white/50 hover:shadow-xl hover:scale-[1.02] hover:border-emerald-300/50 active:scale-[0.98]'
        }
        ${loading ? 'pointer-events-none opacity-60' : ''}
        ${className}
      `}
      onClick={ritual.completed ? undefined : handleStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={ritual.completed ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStart();
        }
      }}
      aria-label={`${ritual.name} ritual - ${ritual.completed ? 'completed' : 'start ritual'}`}
    >
      {/* Animated background gradient */}
      <div className={`
        absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 
        transition-opacity duration-300
        ${isHovered && !ritual.completed ? 'opacity-100' : 'opacity-0'}
      `} />

      {/* Completion badge */}
      {ritual.completed && (
        <div className="absolute -top-2 -right-2 z-10 animate-in zoom-in-75 duration-500">
          <div className="bg-emerald-500 text-white rounded-full p-2.5 shadow-lg ring-4 ring-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      <div className="relative p-6">
        {/* Header section */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`
            text-3xl transition-transform duration-300
            ${!ritual.completed && isHovered ? 'scale-110' : ''}
          `}>
            {getRitualIcon(ritual.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-semibold text-lg truncate ${
                ritual.completed ? 'text-emerald-800' : 'text-slate-800'
              }`}>
                {ritual.name}
              </h3>
              
              {ritual.difficulty && (
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-md border shrink-0
                  ${getDifficultyStyles(ritual.difficulty)}
                `}>
                  {ritual.difficulty}
                </span>
              )}
            </div>
            
            {/* Meta information */}
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(ritual.duration)}
              </span>
              
              {ritual.type && (
                <span className="flex items-center gap-1 capitalize">
                  <Target className="w-3.5 h-3.5" />
                  {ritual.type}
                </span>
              )}
              
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <Award className="w-3.5 h-3.5" />
                +{getEstimatedPoints()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm leading-relaxed mb-4 ${
          ritual.completed ? 'text-emerald-600' : 'text-slate-600'
        }`}>
          {ritual.description || 'A transformative wellness ritual designed to enhance your vitality.'}
        </p>

        {/* Benefits tags */}
        {ritual.benefits && ritual.benefits.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {ritual.benefits.slice(0, 3).map((benefit, index) => (
              <span 
                key={`${benefit}-${index}`}
                className={`px-2 py-1 text-xs rounded-lg font-medium ${
                  ritual.completed 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {benefit}
              </span>
            ))}
          </div>
        )}

        {/* Progress bar for partially completed rituals */}
        {ritual.progress && ritual.progress > 0 && !ritual.completed && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(ritual.progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(ritual.progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {ritual.completed ? (
            <div className="flex-1 flex items-center justify-center py-3 px-4 text-emerald-700 font-medium bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed Today
            </div>
          ) : (
            <>
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
                aria-label={`Start ${ritual.name} ritual`}
              >
                <span className="flex items-center justify-center">
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? 'Starting...' : 'Start Ritual'}
                </span>
              </button>
              
              <button
                onClick={handleComplete}
                disabled={isCompleting || loading}
                className="px-4 py-3 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 group/btn"
                title="Mark as complete"
                aria-label={`Mark ${ritual.name} as complete`}
              >
                {isCompleting ? (
                  <div className="w-4 h-4 animate-spin border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                ) : (
                  <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Additional features */}
        {ritual.audioSrc && (
          <div className="mt-3 flex items-center text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 mr-1" />
            <span>Includes guided audio</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Error boundary for RitualCard
class RitualCardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RitualCard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <h3 className="text-red-800 font-semibold mb-2">Something went wrong</h3>
          <p className="text-red-600 text-sm">Unable to load this ritual card</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced RitualCard with error boundary
const SafeRitualCard = (props) => (
  <RitualCardErrorBoundary>
    <RitualCard {...props} />
  </RitualCardErrorBoundary>
);

// PropTypes for better development experience
RitualCard.defaultProps = {
  ritual: {
    name: 'Untitled Ritual',
    type: 'meditation',
    duration: 300,
    completed: false,
    difficulty: 'beginner',
    description: 'A wellness ritual to enhance your vitality.',
    benefits: [],
    estimatedImpact: 10
  },
  onStart: () => {},
  onComplete: () => {},
  loading: false,
  className: ''
};

// Memoize the component to prevent unnecessary re-renders
const MemoizedRitualCard = React.memo(RitualCard, (prevProps, nextProps) => {
  // Custom comparison logic
  const ritualChanged = JSON.stringify(prevProps.ritual) !== JSON.stringify(nextProps.ritual);
  const loadingChanged = prevProps.loading !== nextProps.loading;
  const classNameChanged = prevProps.className !== nextProps.className;
  
  // Only re-render if these props changed
  return !(ritualChanged || loadingChanged || classNameChanged);
});

export default SafeRitualCard;
export { RitualCard, MemoizedRitualCard };