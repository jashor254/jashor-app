"use client";

export default function CTASection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-teal-900 text-white py-24 px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -mr-48 -mb-48 blur-3xl"></div>
      
      {/* Additional floating elements */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-teal-400/5 rounded-full blur-2xl"></div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* The Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 animate-fade-in">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
          <span className="text-xs font-bold tracking-widest uppercase">Trusted by 1,000+ Modern Educators</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
          The Future of Teaching <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-200 to-teal-300 bg-[length:200%_auto] animate-gradient">
            Starts Here
          </span>
        </h1>

        <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
          Welcome to <span className="font-bold text-white uppercase tracking-wider">EduNexus</span> — your intelligent workspace for 
          <span className="text-teal-300 font-semibold"> 21st-century teaching</span>. 
          Streamline CBC, 8-4-4, and Competency-Based Education with one powerful platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="group w-full sm:w-auto bg-gradient-to-r from-teal-400 to-blue-400 hover:from-teal-300 hover:to-blue-300 text-blue-900 font-bold px-10 py-4 rounded-2xl shadow-xl hover:shadow-teal-500/30 transform hover:-translate-y-1 transition-all duration-300 hover:scale-105">
            <span className="flex items-center justify-center gap-2">
              Start Free Journey
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 hover:bg-white/10 text-white font-bold px-10 py-4 rounded-2xl transition-all duration-300 hover:border-white/50">
            <span className="flex items-center justify-center gap-2">
              Watch Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </button>
        </div>

        <p className="mt-8 text-sm text-blue-300/80">
          No credit card required • Built for modern Kenyan educators
        </p>
        
        {/* Feature tags */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          <span className="px-4 py-2 bg-white/5 rounded-full text-sm backdrop-blur-sm border border-white/10">
            📚 CBE Ready
          </span>
          <span className="px-4 py-2 bg-white/5 rounded-full text-sm backdrop-blur-sm border border-white/10">
            🎓 8-4-4 Supported
          </span>
          <span className="px-4 py-2 bg-white/5 rounded-full text-sm backdrop-blur-sm border border-white/10">
            ⚡ Competency-Based
          </span>
          <span className="px-4 py-2 bg-white/5 rounded-full text-sm backdrop-blur-sm border border-white/10">
            
          </span>
        </div>
      </div>
    </section>
  );
}