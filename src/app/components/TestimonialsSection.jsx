export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Amina K.",
      quote:
        "Echoes of Gaia completely changed how I see history. It’s like connecting the dots between Earth and the stars! 🌍✨",
      role: "Student",
      image: "https://i.pravatar.cc/100?img=1",
    },
    {
      name: "Brian O.",
      quote:
        "The courses are simple, deep, and inspiring. I love how everything ties back to evolution and space. 🚀",
      role: "Content Creator",
      image: "https://i.pravatar.cc/100?img=2",
    },
    {
      name: "Sophia M.",
      quote:
        "Joining Echoes of Gaia was the best decision. The community is vibrant and the lessons stick with you! 🙌🏽",
      role: "Teacher",
      image: "https://i.pravatar.cc/100?img=3",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
        What Our Community Says 💬
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-md p-6 text-center"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
            <p className="text-gray-700 dark:text-gray-300 italic mb-3">
              “{t.quote}”
            </p>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
