'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // <-- NEW IMPORT
import Link from 'next/link'; // <-- NEW IMPORT for navigation
import { useRouter } from 'next/navigation'; // For sign out redirect
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Lightbulb,
  PenLine,
  Menu,
  X
} from 'lucide-react';

// NOTE: You need to implement your actual sign out function here or import it.
const handleSignOut = () => {
  // Replace this with your actual Supabase sign out logic
  // e.g., await supabase.auth.signOut();
  window.location.href = '/login'; 
};

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false); // Default to closed on mobile
  const pathname = usePathname(); // Get current path: e.g., /dashboard/schemes
  const router = useRouter(); // Initialize router for navigation

  // Define menu items with their path for routing
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'My Schemes', path: '/dashboard/schemes', icon: <BookOpen size={18} /> },
    { name: 'Lesson Plans', path: '/dashboard/plans', icon: <PenLine size={18} /> },
    { name: 'Records of Work', path: '/dashboard/records', icon: <Lightbulb size={18} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 bg-white shadow-xl h-full w-64 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">
            Edu<span className="text-gray-800">Nexus</span>
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.name}
                href={item.path}
                onClick={() => setOpen(false)} // auto close on mobile after click
                className={`flex items-center w-full p-3 rounded-lg text-sm font-medium transition-all 
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 w-full px-4">
          <button 
            onClick={handleSignOut} 
            className="flex items-center w-full p-3 text-red-600 border border-red-400 rounded-lg hover:bg-red-50 transition"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-0">
        {/* The children prop is the page component (e.g., page.jsx for /dashboard) */}
        {children} 

        {/* Mwalimu Helper Floating Button */}
        <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-500 transition-all duration-300 animate-bounce">
          Mwalimu Helper
        </button>
      </main>
    </div>
  );
}
