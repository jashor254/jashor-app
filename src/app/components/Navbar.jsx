"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-md px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <Link href="/" className="text-2xl font-bold text-emerald-600">
          Echoes of Gaia
        </Link>

        {/* LINKS */}
        <div className="hidden sm:flex gap-6 text-gray-700 dark:text-gray-300 font-medium">
          <Link href="/" className="hover:text-emerald-600 transition">
            Home
          </Link>
          <Link href="/courses" className="hover:text-emerald-600 transition">
            Courses
          </Link>
          <Link href="/about" className="hover:text-emerald-600 transition">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
