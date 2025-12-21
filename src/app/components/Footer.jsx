"use client";

export default function CTASection() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white py-20 px-6 text-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mt-24 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full -mr-32 -mb-32 blur-2xl"></div>
      
      <div className="relative max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <span className="inline-block bg-yellow-400/20 backdrop-blur-sm text-yellow-300 text-sm font-bold px-4 py-1.5 rounded-full border border-yellow-400/30 mb-6">
            👩🏾‍🏫 Exclusively for Teachers
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
          Built <span className="text-yellow-300">by Teachers</span>, <br />
          <span className="text-emerald-200">for Teachers</span>
        </h2>

        <p className="text-xl mb-10 text-emerald-100 max-w-2xl mx-auto leading-relaxed">
          Join fellow educators who are transforming their classrooms with 
          <span className="font-semibold text-yellow-300"> AI-powered tools</span>, 
          streamlined workflows, and collaborative resources. Focus on teaching, not paperwork.
        </p>

        {/* CTA Button */}
        <div className="mb-16">
          <button className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-emerald-900 font-bold px-10 py-4 rounded-full shadow-2xl hover:shadow-yellow-400/30 transform hover:-translate-y-1 transition-all duration-300">
            <span className="flex items-center justify-center gap-3">
              Start Your Free Account
              <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <p className="mt-4 text-sm text-emerald-300/80">
            No credit card • No commitment • Full access for 30 days
          </p>
        </div>

        {/* Footer with developer credit */}
        <div className="pt-8 border-t border-emerald-500/30">
          <p className="text-sm text-emerald-400">
            Developed by{" "}
            <span className="font-bold text-yellow-300 tracking-wide">JASHOR</span>{" "}
            • © 2026 All Rights Reserved
          </p>
          <p className="text-xs text-emerald-500/70 mt-2">
            Empowering educators since 2023
          </p>
        </div>
      </div>
    </section>
  );
}