"use client";
import CourseCard from "./CourseCard";

export default function CoursesSection({ slug }) {
  // Hii ndio "Service Catalog" yetu mkuu
  const services = [
    {
      id: "schemes-of-work",
      title: "Schemes of Work",
      icon: "📅",
      badge: "Grade 9 Ready",
      description: "Generate KICD-compliant schemes in seconds. Fully editable and aligned with the 2024/25 calendar.",
      comingSoon: false
    },
    {
      id: "mwalimu-helper",
      title: "Mwalimu Helper (AI)",
      icon: "🤖",
      badge: "Professor's Pick",
      description: "Your AI teaching assistant. Get lesson content, inquiry questions, and CBC guidance instantly.",
      comingSoon: false
    },
    {
      id: "lesson-plans",
      title: "Lesson Plans",
      icon: "📝",
      description: "Automatically structured lesson plans that flow directly from your generated schemes.",
      comingSoon: true
    },
    {
      id: "records-of-work",
      title: "Records of Work",
      icon: "📊",
      description: "Digitally track covered strands and learning progress with professional automated reporting.",
      comingSoon: true
    },
    {
        id: "assessment-tools",
        title: "Assessment Tools",
        icon: "🎯",
        description: "Create rubrics and assessment tasks aligned with specific learning outcomes.",
        comingSoon: true
    }
  ];

  return (
    <section className="py-20 px-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <div className="max-w-6xl mx-auto text-center mb-16">
        {/* Subtle Badge */}
        <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
          Professional Suite
        </span>
        
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {slug ? `${slug} Resources` : "Empowering Every Mwalimu"}
        </h2>
        
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 mt-6 text-lg leading-relaxed">
          High-precision CBC tools designed to reduce your paperwork by 90%, 
          giving you more time to focus on what matters: <span className="text-blue-600 font-semibold">The Learner.</span>
        </p>
      </div>

      {/* Grid Layout with proper spacing */}
      <div className="max-w-7xl mx-auto grid gap-10 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {services.map((service) => (
          <CourseCard 
            key={service.id} 
            id={service.id}
            title={service.title}
            description={service.description}
            icon={service.icon}
            badge={service.badge}
            comingSoon={service.comingSoon}
          />
        ))}
      </div>

      {/* Trust Footer */}
      <div className="mt-20 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
          * All resources are generated based on the latest KICD Curriculum Design Framework (2024).
        </p>
      </div>
    </section>
  );
}