// components/RitualPlayer.jsx - Enhanced with better UX and visual feedback
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import useInterfaceStore from '@/stores/interface-store';

const RitualPlayer = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showNotification } = useInterfaceStore();
  
  // Audio ref for better control
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Enhanced timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Audio states
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Visual states
  const [showBreathingAnimation, setShowBreathingAnimation] = useState(false);
  const [motivation, setMotivation] = useState('');

  // Fetch ritual data with enhanced error handling
  const { data: ritual, isLoading, isError } = useQuery({
    queryKey: ['ritual', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/rituals/${id}`);
      return response.data;
    },
    enabled: !!id,
    onSuccess: (data) => {
      const durationInSeconds = data.duration * 60;
      setTimeLeft(durationInSeconds);
      setTotalTime(durationInSeconds);
      setMotivation(getMotivationalMessage(data.type));
    },
    onError: () => {
      showNotification('Failed to load ritual details', 'error');
    }
  });

  // Enhanced completion mutation
  const completeRitualMutation = useMutation({
    mutationFn: () => apiClient.post(`/api/rituals/${id}/complete`),
    onSuccess: (data) => {
      // Update cache optimistically
      queryClient.setQueryData(['plan', 'today'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          rituals: oldData.rituals.map(r => 
            r.id === id ? { ...r, completed: true } : r
          )
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['plan', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      
      showNotification('Ritual completed successfully! 🌟', 'success');
      setIsCompleted(true);
    },
    onError: (error) => {
      showNotification('Failed to save completion. Please try again.', 'error');
      console.error('Failed to complete ritual:', error);
    }
  });

  // Audio setup and handlers
  useEffect(() => {
    if (ritual?.audioSrc && audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedData = () => {
        setIsAudioLoaded(true);
        setAudioError(null);
      };
      
      const handleError = (e) => {
        setAudioError('Failed to load audio');
        setIsAudioLoaded(false);
        console.error('Audio error:', e);
      };
      
      const handleTimeUpdate = () => {
        if (audio.duration) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      const handleEnded = () => {
        setIsAudioPlaying(false);
      };

      audio.addEventListener('loadeddata', handleLoadedData);
      audio.addEventListener('error', handleError);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('loadeddata', handleLoadedData);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [ritual?.audioSrc]);

  // Enhanced timer logic with better state management
  useEffect(() => {
    if (isTimerActive && !isTimerPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            setIsCompleted(true);
            if (audioRef.current) {
              audioRef.current.pause();
              setIsAudioPlaying(false);
            }
            showNotification('Ritual time completed! 🎉', 'success');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerActive, isTimerPaused, timeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Enhanced timer controls
  const startTimer = () => {
    setIsTimerActive(true);
    setIsTimerPaused(false);
    setShowBreathingAnimation(true);
    
    if (ritual?.audioSrc && audioRef.current && isAudioLoaded) {
      audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch(err => {
          setAudioError('Failed to play audio');
          console.error('Audio play error:', err);
        });
    }
    
    showNotification('Session started! Find your focus. 🧘‍♀️', 'info');
  };

  const pauseTimer = () => {
    setIsTimerPaused(true);
    setShowBreathingAnimation(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  const resumeTimer = () => {
    setIsTimerPaused(false);
    setShowBreathingAnimation(true);
    
    if (ritual?.audioSrc && audioRef.current) {
      audioRef.current.play()
        .then(() => setIsAudioPlaying(true))
        .catch(err => console.error('Resume audio error:', err));
    }
  };

  const stopTimer = () => {
    setIsTimerActive(false);
    setIsTimerPaused(false);
    setTimeLeft(totalTime);
    setShowBreathingAnimation(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAudioPlaying(false);
      setAudioProgress(0);
    }
  };

  const completeEarly = () => {
    setIsCompleted(true);
    setIsTimerActive(false);
    setShowBreathingAnimation(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
    
    completeRitualMutation.mutate();
  };

  // Helper functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!totalTime) return 0;
    const elapsed = totalTime - timeLeft;
    return Math.min((elapsed / totalTime) * 100, 100);
  };

  const getMotivationalMessage = (type) => {
    const messages = {
      meditation: "Let your thoughts flow like water, observing without judgment.",
      breathing: "Each breath is a new beginning, a fresh start for your mind.",
      focus: "Your attention is like a muscle - each moment of focus makes it stronger.",
      mindfulness: "Be present with whatever arises, welcoming each moment with curiosity."
    };
    return messages[type] || "Trust the process. Every moment of practice matters.";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Preparing Your Ritual</h3>
          <p className="text-white/70">Creating the perfect environment for your practice...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !ritual) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md">
          <div className="text-red-400 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Ritual Unavailable</h3>
          <p className="text-white/70 mb-8 leading-relaxed">
            We couldn't load this ritual. It might be temporarily unavailable or there could be a connection issue.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center max-w-2xl">
          <div className="text-6xl mb-8 animate-bounce">🌟</div>
          <h2 className="text-4xl font-bold text-white mb-6">Ritual Complete!</h2>
          <p className="text-white/80 text-xl mb-8 leading-relaxed">
            Wonderful work completing "{ritual.name}". You've just strengthened your mental pathways and invested in your long-term wellbeing.
          </p>
          
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-300 mb-1">
                +{Math.floor(ritual.duration / 5) + 10}
              </div>
              <div className="text-sm text-white/70">Vitality Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-300 mb-1">{ritual.duration}</div>
              <div className="text-sm text-white/70">Minutes Invested</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-300 mb-1">+1</div>
              <div className="text-sm text-white/70">Streak Day</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
              disabled={completeRitualMutation.isPending}
            >
              {completeRitualMutation.isPending ? (
                <>
                  <svg className="w-5 h-5 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Progress...
                </>
              ) : (
                'Continue Journey'
              )}
            </button>
            <button
              onClick={() => router.push('/progress')}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main ritual player interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hidden audio element */}
      {ritual.audioSrc && (
        <audio
          ref={audioRef}
          src={ritual.audioSrc}
          preload="auto"
          className="hidden"
        />
      )}

      {/* Enhanced header with better navigation */}
      <div className="pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/70 hover:text-white transition-all duration-200 mb-6 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main content with enhanced layout */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          {/* Enhanced ritual info section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
              {ritual.type} Session
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {ritual.name}
            </h1>
            <p className="text-xl text-white/70 mb-4 max-w-2xl mx-auto leading-relaxed">
              {ritual.description}
            </p>
            <div className="text-white/50 font-medium">
              {ritual.duration} minute guided experience
            </div>
          </div>

          {/* Enhanced progress circle with breathing animation */}
          <div className="flex justify-center mb-12">
            <div className="relative w-80 h-80 lg:w-96 lg:h-96">
              {/* Breathing animation backdrop */}
              {showBreathingAnimation && (
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              )}
              
              {/* Main progress circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#progressGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Enhanced timer display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl lg:text-7xl font-mono font-bold text-white mb-4 tracking-wider">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-white/60 text-lg font-medium mb-2">
                    {isTimerActive && !isTimerPaused ? (
                      <span className="flex items-center justify-center">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                        In Progress
                      </span>
                    ) : isTimerPaused ? (
                      <span className="flex items-center justify-center">
                        <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                        Paused
                      </span>
                    ) : (
                      'Ready to Begin'
                    )}
                  </div>
                  <div className="text-white/40 text-sm">
                    {Math.round(getProgress())}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced audio controls */}
          {ritual.audioSrc && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.785l-4.906-3.64H2a1 1 0 01-1-1V8a1 1 0 011-1h1.477l4.906-3.64a1 1 0 011-.284z" clipRule="evenodd" />
                      <path d="M11.525 6.098a1 1 0 011.37.527 2.5 2.5 0 010 2.75 1 1 0 11-1.898-.776 1.5 1.5 0 000-1.198 1 1 0 01.528-1.303z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">Guided Audio Track</div>
                    <div className="text-white/60 text-sm">
                      {audioError ? (
                        <span className="text-red-400">{audioError}</span>
                      ) : isAudioLoaded ? (
                        isAudioPlaying ? 'Now Playing' : 'Ready to Play'
                      ) : (
                        'Loading...'
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Audio progress */}
                  <div className="w-24 bg-white/10 rounded-full h-1">
                    <div 
                      className="bg-emerald-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  
                  {/* Audio control button */}
                  <button
                    onClick={() => {
                      if (isAudioPlaying) {
                        audioRef.current?.pause();
                        setIsAudioPlaying(false);
                      } else if (isAudioLoaded) {
                        audioRef.current?.play()
                          .then(() => setIsAudioPlaying(true))
                          .catch(err => setAudioError('Playback failed'));
                      }
                    }}
                    disabled={!isAudioLoaded}
                    className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  >
                    {isAudioPlaying ? (
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced timer controls */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {!isTimerActive && !isCompleted && (
                <button
                  onClick={startTimer}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  <span className="flex items-center">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Begin Session
                  </span>
                </button>
              )}

              {isTimerActive && !isTimerPaused && (
                <button
                  onClick={pauseTimer}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause
                  </span>
                </button>
              )}

              {isTimerActive && isTimerPaused && (
                <>
                  <button
                    onClick={resumeTimer}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Resume
                    </span>
                  </button>
                  <button
                    onClick={stopTimer}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg"
                  >
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Reset
                    </span>
                  </button>
                </>
              )}

              {(isTimerActive || isTimerPaused) && (
                <button
                  onClick={completeEarly}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete Early
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced motivational message */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3 text-lg">Mindful Moment</h4>
                <p className="text-white/80 leading-relaxed text-lg italic">
                  "{motivation}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualPlayer;