import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Star, Users, Award, Zap, Heart, Brain, Target, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Neuroscience-Based Rituals",
      description: "Carefully designed practices backed by cognitive science research to optimize your mental performance."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Journey",
      description: "AI-powered recommendations that adapt to your unique lifestyle, goals, and progress patterns."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Quick & Effective",
      description: "Transform your day with rituals ranging from 5 to 30 minutes, designed for busy lifestyles."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Holistic Wellness",
      description: "Address stress, focus, energy, and emotional balance through integrated mindfulness practices."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      avatar: "SC",
      quote: "LivReplenish transformed my morning routine. I feel more focused and energized than ever before.",
      rating: 5
    },
    {
      name: "Marcus Thompson",
      role: "Entrepreneur",
      avatar: "MT",
      quote: "The personalized rituals fit perfectly into my hectic schedule. My stress levels have dramatically improved.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Designer",
      avatar: "ER",
      quote: "Beautiful interface and incredibly effective practices. It's like having a wellness coach in my pocket.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "50,000+", label: "Rituals Completed" },
    { number: "4.9", label: "App Rating" },
    { number: "85%", label: "User Retention" }
  ];

  const handleGetStarted = () => {
    // Navigate to onboarding
    window.location.href = '/onboarding';
  };

  const handleSignIn = () => {
    // Navigate to dashboard if authenticated, or to auth
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 20 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">LivReplenish</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Vitality Journey</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                How it Works
              </a>
              <a href="#testimonials" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Reviews
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Pricing
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block py-2 text-slate-700 hover:text-slate-900 font-medium">
                Features
              </a>
              <a href="#how-it-works" className="block py-2 text-slate-700 hover:text-slate-900 font-medium">
                How it Works
              </a>
              <a href="#testimonials" className="block py-2 text-slate-700 hover:text-slate-900 font-medium">
                Reviews
              </a>
              <a href="#pricing" className="block py-2 text-slate-700 hover:text-slate-900 font-medium">
                Pricing
              </a>
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <button
                  onClick={handleSignIn}
                  className="block w-full py-2.5 px-4 text-slate-700 hover:text-slate-900 font-medium text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="block w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-xl"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 mb-8">
              <Star className="w-4 h-4 text-emerald-600 mr-2" />
              <span className="text-sm font-medium text-emerald-700">Trusted by 10,000+ users worldwide</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Daily Vitality
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Discover personalized wellness rituals designed by neuroscientists to boost your focus, 
              reduce stress, and unlock your mental potential in just minutes a day.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="group flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-slate-900 font-semibold rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <div className="w-4 h-4 bg-emerald-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
          <div className="w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}>
          <div className="w-5 h-5 bg-purple-400 rounded-full opacity-40"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Why Choose LivReplenish?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our science-backed approach combines ancient wisdom with modern neuroscience 
              to create transformative wellness experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="flex items-start space-x-4 p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl hover:from-emerald-50 hover:to-blue-50 transition-all duration-300 hover:shadow-lg">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Your Journey in 3 Simple Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get started on your personalized vitality journey in minutes, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Personal Assessment",
                description: "Tell us about your lifestyle, goals, and wellness preferences through our intelligent onboarding process."
              },
              {
                step: "02",
                title: "Custom Ritual Plan",
                description: "Receive your personalized daily rituals, carefully selected based on neuroscience research and your unique profile."
              },
              {
                step: "03",
                title: "Track & Transform",
                description: "Practice your rituals, track progress, and watch as your vitality, focus, and well-being improve day by day."
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-2xl group-hover:scale-110 transition-all duration-300">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-blue-300 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Loved by Thousands
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See what our community has to say about their transformation journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-3xl p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
            Join thousands who have already discovered the power of personalized wellness rituals. 
            Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-white text-emerald-600 hover:text-emerald-700 font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-semibold rounded-2xl transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">LivReplenish</h3>
                  <p className="text-slate-400">Your Vitality Journey</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Transforming lives through personalized wellness rituals designed by neuroscientists. 
                Discover your potential, one ritual at a time.
              </p>
              <div className="flex space-x-4 mt-6">
                <div className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors cursor-pointer">Reviews</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors cursor-pointer">Pricing</a></li>
                <li><a href="/about" className="hover:text-white transition-colors cursor-pointer">About Us</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="/help" className="hover:text-white transition-colors cursor-pointer">Help Center</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors cursor-pointer">Contact Us</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors cursor-pointer">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white transition-colors cursor-pointer">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 LivReplenish. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span className="text-slate-400 text-sm">for your wellness</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;