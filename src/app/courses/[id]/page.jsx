"use client";
import { courses } from "@/app/lib/coursesData";
import { useParams } from "next/navigation";

export default function CoursePage() {
  const { id } = useParams();
  const courseId = parseInt(id);
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="p-8 text-center text-red-500 text-xl">
        Course not found 😢
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">
        {course.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {course.description}
      </p>
      <span className="text-lg font-semibold">
        {course.price === 0 ? "Free" : `KES ${course.price}`}
      </span>
    </div>
  );
}
