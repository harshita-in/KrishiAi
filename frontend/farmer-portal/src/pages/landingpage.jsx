import React from 'react';

export default function LandingPage() {
  // Simple navigation handler to simulate routing to your auth page
  const handleGetStarted = () => {
    navigate('/auth'); // Smoothly transitions to your Auth page without a page refresh
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-emerald-200">
      
      {/* Subtle background ambient decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse duration-[6000ms] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse duration-[8000ms] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-700">Krishi<span className="text-slate-700 font-medium">AI</span></span>
        </div>
        <button 
          onClick={handleGetStarted}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-200"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center z-10">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-6 animate-fade-in">
          Honoring 'Krishi' — Empowering the Hands That Feed Us
        </span>
        
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 max-w-3xl mx-auto leading-[1.15] mb-6 transition-all duration-700 ease-out">
          Cultivate abundance with intelligent farming.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed mb-10">
          Bridging ancient agricultural wisdom with modern predictability. Protect your yields, understand your soil health, and ensure a prosperous harvest season after season.
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleGetStarted}
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-emerald-700 rounded-full shadow-md shadow-emerald-700/10 hover:bg-emerald-800 hover:shadow-lg hover:shadow-emerald-700/20 active:scale-[0.98] transition-all duration-200 ease-out"
          >
            Get Started
            <svg 
              className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Core Solutions Showcase */}
      <section className="relative max-w-6xl mx-auto px-6 py-12 z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Card 1: Crop Recommendation */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 ease-in-out group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-3">Optimal Crop Match</h3>
            <p className="text-slate-500 font-light leading-relaxed">
              Eliminate the guesswork. Input simple details about your field conditions to find exactly which crops will naturally flourish, maximizing your seasonal profit margins.
            </p>
          </div>

          {/* Card 2: Crop Disease Detection */}
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 ease-in-out group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-3">Instant Health Diagnostics</h3>
            <p className="text-slate-500 font-light leading-relaxed">
              Identify issues before they spread. Upload a clear photograph of any troubled foliage to instantly recognize illnesses and get immediate, actionable guidance on curing them.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 mt-12 border-t border-slate-200 text-center text-xs text-slate-400 font-light">
        &copy; {new Date().getFullYear()} KrishiAI. All rights reserved to safe, scalable agriculture.
      </footer>
    </div>
  );
}