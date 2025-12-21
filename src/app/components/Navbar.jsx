"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-emerald-500/20 transition-shadow">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Edunexus
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                by JASHOR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
              <Link 
                href="/" 
                className="relative px-2 py-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/schemes" 
                className="relative px-2 py-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                Schemes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/lesson-plans" 
                className="relative px-2 py-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                Lesson Plans
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/resources" 
                className="relative px-2 py-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
              >
                Resources
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/ai-tools" 
                className="relative px-2 py-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group flex items-center gap-1"
              >
                <span>AI Tools</span>
                <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                  NEW
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4 ml-6">
              <Link 
                href="/login" 
                className="px-5 py-2 text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-full shadow-md hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute top-1 left-0 w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
              <span className={`absolute top-3 left-0 w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute top-5 left-0 w-6 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
          <div className="flex flex-col gap-4 py-4 border-t border-gray-200 dark:border-gray-800">
            <Link 
              href="/" 
              className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/schemes" 
              className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Schemes
            </Link>
            <Link 
              href="/lesson-plans" 
              className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Lesson Plans
            </Link>
            <Link 
              href="/resources" 
              className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Resources
            </Link>
            <Link 
              href="/ai-tools" 
              className="px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between"
              onClick={() => setIsMenuOpen(false)}
            >
              <span>AI Tools</span>
              <span className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                NEW
              </span>
            </Link>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Link 
                href="/login" 
                className="px-4 py-3 text-center rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="px-4 py-3 text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg shadow-md hover:shadow-emerald-500/30 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}