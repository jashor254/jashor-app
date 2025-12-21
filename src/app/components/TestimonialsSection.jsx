"use client";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Mr. Brian O.",
      quote:
        "Edunexus cut my lesson planning time by 70%. The AI tools generate creative CBC schemes in minutes instead of hours. A game-changer!",
      role: "Science Teacher, Nairobi",
      image: "https://i.pravatar.cc/100?img=2",
      rating: 5,
      subject: "Science & Tech",
    },
    {
      name: "Mrs. Wanjiku M.",
      quote:
        "Finally, a platform that understands Kenyan teachers! The assessment tools for both CBC and 8-4-4 have transformed how I track student progress.",
      role: "Math Teacher, Mombasa",
      image: "https://i.pravatar.cc/100?img=5",
      rating: 5,
      subject: "Mathematics",
    },
    {
      name: "Mr. Kamau S.",
      quote:
        "As a headteacher, I've rolled out Edunexus to my entire staff. Resource sharing and collaborative planning have never been this seamless.",
      role: "Headteacher, Kisumu",
      image: "https://i.pravatar.cc/100?img=6",
      rating: 5,
      subject: "School Admin",
    },
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full -mr-48 -mb-48 blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-500/20 mb-6">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
              👩🏾‍🏫 Teacher Verified
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Educators Across Kenya
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join 1,000+ teachers who have transformed their workflow with Edunexus
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-emerald-500/20 text-6xl">"</div>
              
              {/* Stars */}
              <div className="flex mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 italic">
                "{t.quote}"
              </p>
              
              {/* Teacher Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{t.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.role}</p>
                  <div className="mt-1 inline-block px-3 py-1 bg-emerald-500/10 rounded-full">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.subject}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">1,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Time Saved Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">4.9★</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Teacher Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}