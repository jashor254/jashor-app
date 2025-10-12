"use client";
import Link from "next/link";

export default function CourseCard({ id, title, price }) {
  return (
    <Link
      href={`/courses/${id}`}
      className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-md 
                 hover:shadow-xl transform hover:-translate-y-1 transition-all 
                 duration-300 p-6 flex flex-col justify-between block overflow-hidden"
    >
      {/* Decorative header (replaces image) */}
      <div className="relative w-full h-48 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
        <div className="text-6xl">📚</div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-4">
          A unique learning journey that connects history, evolution, and our
          planet's story 🌍.
        </p>
      </div>

      {/* Price + Enroll */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {price === 0 ? "Free" : `KES ${price}`}
        </span>
        <button
          onClick={(e) => e.preventDefault()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold 
                     px-4 py-2 rounded-full shadow hover:shadow-lg transition-all"
        >
          Enroll
        </button>
      </div>
    </Link>
  );
}
