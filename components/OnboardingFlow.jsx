// components/OnboardingFlow.jsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient, handleApiError } from '@/lib/api-client';
import useInterfaceStore from '@/stores/interface-store';

// Enhanced validation schemas for each step
const step1Schema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email is too short')
    .max(100, 'Email is too long'),
  age: z.number()
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Please enter a valid age')
    .int('Age must be a whole number'),
});

const step2Schema = z.object({
  stressLevel: z.number().min(1, 'Please rate your stress level').max(10),
  sleepQuality: z.number().min(1, 'Please rate your sleep quality').max(10),
  energyLevel: z.number().min(1, 'Please rate your energy level').max(10),
  exerciseFrequency: z.enum(['never', 'rarely', 'sometimes', 'often', 'daily'], {
    required_error: 'Please select your exercise frequency'
  }),
});

const step3Schema = z.object({
  goals: z.array(z.string()).min(1, 'Please select at least one goal').max(5, 'Please select no more than 5 goals'),
  preferredRitualTime: z.enum(['morning', 'afternoon', 'evening', 'flexible'], {
    required_error: 'Please select your preferred time'
  }),
  currentChallenges: z.array(z.string()).optional(),
});

const step4Schema = z.object({
  commitmentLevel: z.enum(['5min', '15min', '30min', '60min'], {
    required_error: 'Please select your daily commitment'
  }),
  notificationPreference: z.boolean().default(true),
  reminderTimes: z.array(z.string()).optional(),
  privacyConsent: z.boolean().refine(val => val === true, {
    message: 'Please accept the privacy policy to continue'
  }),
});

const OnboardingFlow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  
  const { 
    showNotification, 
    setGlobalLoading, 
    formSubmitting, 
    setFormSubmitting 
  } = useInterfaceStore();

  const totalSteps = 4;

  // Available goals and challenges
  const availableGoals = [
    { id: 'stress', label: 'Reduce stress and anxiety', icon: '🧘' },
    { id: 'sleep', label: 'Improve sleep quality', icon: '😴' },
    { id: 'energy', label: 'Increase daily energy', icon: '⚡' },
    { id: 'focus', label: 'Enhance mental clarity', icon: '🎯' },
    { id: 'mindfulness', label: 'Build mindfulness practice', icon: '🌸' },
    { id: 'balance', label: 'Better work-life balance', icon: '⚖️' },
    { id: 'confidence', label: 'Boost self-confidence', icon: '💪' },
    { id: 'creativity', label: 'Enhance creativity', icon: '🎨' },
  ];

  const availableChallenges = [
    { id: 'time', label: 'Finding time for self-care', icon: '⏰' },
    { id: 'motivation', label: 'Staying motivated', icon: '🎯' },
    { id: 'consistency', label: 'Building consistent habits', icon: '📅' },
    { id: 'overwhelm', label: 'Feeling overwhelmed', icon: '🌪️' },
    { id: 'distraction', label: 'Too many distractions', icon: '📱' },
  ];

  // Get current schema based on step
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      case 4: return step4Schema;
      default: return step1Schema;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(getCurrentSchema()),
    mode: 'onChange',
  });

  // API mutation for submitting onboarding data
  const submitOnboarding = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.submitOnboarding(data);
      return response.data;
    },
    onSuccess: (data) => {
      setFormSubmitting(false);
      setGlobalLoading(false);
      showNotification('Welcome to LivReplenish! Your personalized plan is ready.', 'success');
      router.push('/dashboard');
    },
    onError: (error) => {
      setFormSubmitting(false);
      setGlobalLoading(false);
      handleApiError(error, showNotification);
    },
  });

  const handleStepSubmit = (data) => {
    // Add selected arrays to form data for step 3
    if (currentStep === 3) {
      data.goals = selectedGoals;
      data.currentChallenges = selectedChallenges;
    }

    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      reset();
    } else {
      // Final submission
      setFormSubmitting(true);
      setGlobalLoading(true);
      submitOnboarding.mutate(updatedData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else {
        return prev.length < 5 ? [...prev, goalId] : prev;
      }
    });
  };

  const handleChallengeToggle = (challengeId) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challengeId)) {
        return prev.filter(id => id !== challengeId);
      } else {
        return [...prev, challengeId];
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                Welcome to LivReplenish
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                Let's create your personalized vitality journey. We'll start with some basic information.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  What's your name?
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 ${
                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Age
                </label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  min="13"
                  max="120"
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 ${
                    errors.age ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  placeholder="25"
                />
                {errors.age && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.age.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                How are you feeling?
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                Help us understand your current wellness state so we can create the perfect plan for you.
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Current Stress Level
                </label>
                <div className="space-y-3">
                  <input
                    {...register('stressLevel', { valueAsNumber: true })}
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span className="flex items-center">😌 <span className="ml-1">Low</span></span>
                    <span className="font-medium">Current: {watch('stressLevel') || 5}</span>
                    <span className="flex items-center">😰 <span className="ml-1">High</span></span>
                  </div>
                </div>
                {errors.stressLevel && (
                  <p className="mt-2 text-sm text-red-600">{errors.stressLevel.message}</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Sleep Quality
                </label>
                <div className="space-y-3">
                  <input
                    {...register('sleepQuality', { valueAsNumber: true })}
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span className="flex items-center">😴 <span className="ml-1">Poor</span></span>
                    <span className="font-medium">Current: {watch('sleepQuality') || 5}</span>
                    <span className="flex items-center">✨ <span className="ml-1">Excellent</span></span>
                  </div>
                </div>
                {errors.sleepQuality && (
                  <p className="mt-2 text-sm text-red-600">{errors.sleepQuality.message}</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  Energy Level
                </label>
                <div className="space-y-3">
                  <input
                    {...register('energyLevel', { valueAsNumber: true })}
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-600"
                  />
                  <div className="flex justify-between text-sm text-slate-500">
                    <span className="flex items-center">🔋 <span className="ml-1">Low</span></span>
                    <span className="font-medium">Current: {watch('energyLevel') || 5}</span>
                    <span className="flex items-center">⚡ <span className="ml-1">High</span></span>
                  </div>
                </div>
                {errors.energyLevel && (
                  <p className="mt-2 text-sm text-red-600">{errors.energyLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                  How often do you exercise?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'never', label: 'Never', desc: 'I don\'t exercise' },
                    { value: 'rarely', label: 'Rarely', desc: 'Less than once a week' },
                    { value: 'sometimes', label: 'Sometimes', desc: '1-2 times per week' },
                    { value: 'often', label: 'Often', desc: '3-4 times per week' },
                    { value: 'daily', label: 'Daily', desc: 'Almost every day' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                        watch('exerciseFrequency') === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register('exerciseFrequency')}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{option.label}</div>
                        <div className="text-sm text-slate-500">{option.desc}</div>
                      </div>
                      {watch('exerciseFrequency') === option.value && (
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
                {errors.exerciseFrequency && (
                  <p className="mt-2 text-sm text-red-600">{errors.exerciseFrequency.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                What are your goals?
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                Select up to 5 areas where you'd like to see improvement. We'll personalize your rituals accordingly.
              </p>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700">Select your goals</h3>
                <span className="text-sm text-slate-500">{selectedGoals.length}/5 selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableGoals.map((goal) => (
                  <label
                    key={goal.id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      selectedGoals.includes(goal.id)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200'
                    } ${selectedGoals.length >= 5 && !selectedGoals.includes(goal.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <span className="text-2xl mr-3">{goal.icon}</span>
                    <span className="font-medium text-slate-800 flex-1">{goal.label}</span>
                    {selectedGoals.includes(goal.id) && (
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
              {selectedGoals.length === 0 && (
                <p className="mt-2 text-sm text-red-600">Please select at least one goal</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                When would you prefer to do your daily rituals?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'morning', label: 'Morning', icon: '🌅', desc: 'Start the day right' },
                  { value: 'afternoon', label: 'Afternoon', icon: '☀️', desc: 'Midday energy boost' },
                  { value: 'evening', label: 'Evening', icon: '🌙', desc: 'Wind down peacefully' },
                  { value: 'flexible', label: 'Flexible', icon: '⏰', desc: 'Adapt to my schedule' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      watch('preferredRitualTime') === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('preferredRitualTime')}
                      className="sr-only"
                    />
                    <span className="text-3xl mb-2">{option.icon}</span>
                    <span className="font-medium text-slate-800">{option.label}</span>
                    <span className="text-xs text-slate-500 text-center mt-1">{option.desc}</span>
                    {watch('preferredRitualTime') === option.value && (
                      <svg className="w-5 h-5 text-emerald-600 mt-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
              {errors.preferredRitualTime && (
                <p className="mt-2 text-sm text-red-600">{errors.preferredRitualTime.message}</p>
              )}
            </div>

            <div>
              <div className="mb-4">
                <h3 className="font-semibold text-slate-700 mb-2">What challenges do you face? (Optional)</h3>
                <p className="text-sm text-slate-500">This helps us provide better guidance</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {availableChallenges.map((challenge) => (
                  <label
                    key={challenge.id}
                    className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      selectedChallenges.includes(challenge.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200'
                    }`}
                    onClick={() => handleChallengeToggle(challenge.id)}
                  >
                    <span className="text-xl mr-3">{challenge.icon}</span>
                    <span className="font-medium text-slate-800 flex-1">{challenge.label}</span>
                    {selectedChallenges.includes(challenge.id) && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                Set your commitment
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed max-w-md mx-auto">
                Choose a sustainable daily commitment. You can always adjust this later as you build your practice.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                How much time can you dedicate daily?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: '5min', label: '5 minutes', desc: 'Perfect for busy schedules', icon: '⚡' },
                  { value: '15min', label: '15 minutes', desc: 'Great balance of impact and time', icon: '🎯' },
                  { value: '30min', label: '30 minutes', desc: 'Deep practice sessions', icon: '🧘' },
                  { value: '60min', label: '60 minutes', desc: 'Full transformative experience', icon: '🌟' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      watch('commitmentLevel') === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      {...register('commitmentLevel')}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-4">{option.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{option.label}</div>
                      <div className="text-sm text-slate-500">{option.desc}</div>
                    </div>
                    {watch('commitmentLevel') === option.value && (
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
              {errors.commitmentLevel && (
                <p className="mt-2 text-sm text-red-600">{errors.commitmentLevel.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-start p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  {...register('notificationPreference')}
                  className="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <div className="ml-4">
                  <span className="font-medium text-slate-800">Enable gentle reminders</span>
                  <p className="text-sm text-slate-500 mt-1">
                    Get personalized notifications to help you stay consistent with your practice
                  </p>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 border-slate-200 rounded-xl cursor-pointer transition-all duration-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  {...register('privacyConsent')}
                  className="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <div className="ml-4">
                  <span className="font-medium text-slate-800">I agree to the Privacy Policy</span>
                  <p className="text-sm text-slate-500 mt-1">
                    Your data is safe with us. We use it only to personalize your experience.{' '}
                    <button type="button" className="text-emerald-600 hover:underline">
                      Read our privacy policy
                    </button>
                  </p>
                </div>
              </label>
              {errors.privacyConsent && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.privacyConsent.message}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-slate-600">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 lg:p-10">
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:scale-105 shadow-sm'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </span>
              </button>

              <button
                type="submit"
                disabled={formSubmitting || submitOnboarding.isLoading}
                className="px-10 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {currentStep === totalSteps ? (
                  formSubmitting || submitOnboarding.isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating your plan...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Complete Journey
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )
                ) : (
                  <span className="flex items-center">
                    Continue
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-2">
            Need help? We're here for you.
          </p>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium hover:underline transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;