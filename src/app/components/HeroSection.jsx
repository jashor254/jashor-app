"use client";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-28 px-6 sm:px-8 lg:px-10"
    >
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Animated dots pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-500/30 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="text-sm font-medium tracking-wide">
            The Future of Teaching, Today
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500 animate-gradient">
            Edunexus
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Your all-in-one digital workspace designed{" "}
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            exclusively for teachers
          </span>
          . Streamline planning, assessment, and collaboration with AI-powered tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
          <a
            href="#signup"
            className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-teal-500/30 transform hover:-translate-y-1 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-3">
              Start Free Trial
              <svg 
                className="w-5 h-5 group-hover:translate-x-2 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
          
          <a
            href="#features"
            className="group px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-3">
              See Platform Tour
              <svg 
                className="w-5 h-5 group-hover:scale-110 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">1,000+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Teachers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resources Shared</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">98%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
          </div>
        </div>

        {/* Developer credit */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Developed by{" "}
            <span className="font-bold text-teal-600 dark:text-teal-400 tracking-wide">
              JASHOR
            </span>{" "}
            • Empowering Educators Since 2023 • © 2026
          </p>
        </div>
      </div>
    </section>
  );
}