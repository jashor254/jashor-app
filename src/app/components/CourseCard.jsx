"use client";
import Link from "next/link";

export default function CourseCard({ id, title, description, icon, badge, comingSoon }) {
  return (
    <Link
      href={comingSoon ? "#" : `/services/${id}`}
      className={`group relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-md 
                 hover:shadow-2xl transform hover:-translate-y-2 transition-all 
                 duration-500 p-6 flex flex-col justify-between overflow-hidden border border-gray-100 dark:border-gray-700
                 ${comingSoon ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
    >
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-500"></div>

      {/* Header / Icon with Animation */}
      <div className={`relative w-full h-40 bg-gradient-to-br ${comingSoon ? 'from-gray-400 to-gray-600' : 'from-blue-700 via-blue-600 to-teal-500'} rounded-xl flex items-center justify-center shadow-inner`}>
        <div className="text-7xl transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">
          {icon}
        </div>
        
        {badge && (
          <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2">
           <h3 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-teal-400 transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Professor's Recommendation Badge */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-100 rounded-full">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-500 uppercase tracking-tighter">
            Professor's Recommendation: Efficient & CBC Compliant
          </span>
        </div>

        <button
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm
            ${comingSoon 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-blue-200'}`}
        >
          {comingSoon ? "Coming Soon" : "Get Started"}
        </button>
      </div>
    </Link>
  );
}