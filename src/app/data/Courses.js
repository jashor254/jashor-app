"use client";
import { courses } from "../data/   Courses";
import CourseCard from "../components/CourseCard";

export default function CoursesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Courses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            price={course.price}
            // later we can also pass: description, duration, level, etc
          />
        ))}
      </div>
    </div>
  );
}
