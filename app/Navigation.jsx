// components/Navigation.jsx
"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useInterfaceStore from '@/stores/interface-store';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    isMenuOpen, 
    setIsMenuOpen, 
    notifications,
    removeNotification 
  } = useInterfaceStore();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      badge: null
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: null
    },
    {
      name: 'Rituals',
      href: '/rituals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      badge: null
    }
  ];

  const handleNavigation = (href) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  const isActive = (href) => pathname === href;

  // Close menu when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-xl p-3 shadow-lg border border-slate-200 hover:bg-slate-50 transition-all duration-200 group"
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        <div className="w-5 h-5 relative">
          <span
            className={`absolute block h-0.5 w-5 bg-slate-600 transform transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'
            }`}
          />
          <span
            className={`absolute block h-0.5 w-5 bg-slate-600 transform transition-all duration-300 ease-in-out translate-y-1.5 ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute block h-0.5 w-5 bg-slate-600 transform transition-all duration-300 ease-in-out ${
              isMenuOpen ? '-rotate-45 translate-y-1.5' : 'translate-y-3'
            }`}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Desktop Sidebar & Mobile Menu */}
      <nav
        className={`
          fixed top-0 left-0 h-full bg-white/95 backdrop-blur-lg shadow-xl border-r border-slate-200/50 z-40 
          transform transition-all duration-300 ease-in-out
          w-72 lg:translate-x-0
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand Section */}
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">LivReplenish</h1>
                <p className="text-sm text-slate-500 font-medium">Vitality Journey</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-sm border border-emerald-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
                `}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className={`transition-colors duration-200 ${
                  isActive(item.href) ? 'text-emerald-600' : 'group-hover:text-slate-700'
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
                )}
              </button>
            ))}
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-slate-200/50">
            <div className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer group">
              <div className="w-11 h-11 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                U
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">User Profile</p>
                <p className="text-sm text-slate-500">Manage account</p>
              </div>
              <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* App Version & Info */}
          <div className="p-4 text-center border-t border-slate-200/50">
            <p className="text-xs text-slate-400 font-medium">LivReplenish v1.0.0</p>
            <p className="text-xs text-slate-300 mt-1">© 2024 All rights reserved</p>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile (Alternative/Supplementary) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/50 px-2 py-2 z-30 shadow-lg">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`
                flex flex-col items-center space-y-1 px-4 py-2.5 rounded-xl transition-all duration-200
                ${isActive(item.href)
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              <span className={`transition-transform duration-200 ${
                isActive(item.href) ? 'scale-110' : 'scale-100'
              }`}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.name}</span>
              {isActive(item.href) && (
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-xl shadow-lg backdrop-blur-sm border transform transition-all duration-300 ease-in-out
              ${notification.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : ''}
              ${notification.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : ''}
              ${notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' : ''}
              ${notification.type === 'info' ? 'bg-blue-50/90 border-blue-200 text-blue-800' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-3 flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity duration-200"
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Spacer for Desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0" aria-hidden="true">
        {/* This div reserves space so main content doesn't slide under the sidebar */}
      </div>
    </>
  );
};

export default Navigation;