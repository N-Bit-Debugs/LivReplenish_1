// app/page.js - Home/Landing Page
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (this will be replaced with real auth check)
    const isAuthenticated = false; // Replace with actual auth check
    const hasCompletedOnboarding = false; // Replace with actual onboarding check

    if (!isAuthenticated) {
      // Redirect to onboarding for new users
      router.replace('/onboarding');
    } else if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    } else {
      // Redirect authenticated users to dashboard
      router.replace('/dashboard');
    }
  }, [router]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-4">LivReplenish</h1>
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-slate-600 mt-4">Preparing your vitality journey...</p>
      </div>
    </div>
  );
}

// app/dashboard/page.js - Dashboard Page
'use client';

import { Suspense } from 'react';
import Dashboard from '@/components/Dashboard';

// Loading component for dashboard
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}

// app/ritual/[id]/page.js - Dynamic Ritual Player Page
'use client';

import { Suspense } from 'react';
import RitualPlayer from '@/components/RitualPlayer';

// Loading component for ritual player
function RitualPlayerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"></div>
        <p className="text-white/80">Loading your ritual...</p>
      </div>
    </div>
  );
}

export default function RitualPage() {
  return (
    <Suspense fallback={<RitualPlayerLoading />}>
      <RitualPlayer />
    </Suspense>
  );
}

// app/progress/page.js - Progress Page
'use client';

import { Suspense } from 'react';
import ProgressPage from '@/components/ProgressPage';

// Loading component for progress page
function ProgressLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgressPageWrapper() {
  return (
    <Suspense fallback={<ProgressLoading />}>
      <ProgressPage />
    </Suspense>
  );
}

// app/onboarding/page.js - Onboarding Page
'use client';

import { Suspense } from 'react';
import OnboardingFlow from '@/components/OnboardingFlow';

// Loading component for onboarding
function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-md">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Preparing your personalized experience...</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Suspense fallback={<OnboardingLoading />}>
        <OnboardingFlow />
      </Suspense>
    </div>
  );
}

// app/globals.css - Global Styles
/* 
@tailwind base;
@tailwind components;  
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}

// Custom scrollbar styles
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

// Animation keyframes
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

// Focus visible styles for accessibility
.focus-visible:focus {
  outline: 2px solid #10B981;
  outline-offset: 2px;
}
*/