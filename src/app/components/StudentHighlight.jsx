export default function StudentHighlight() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
        {/* Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=800&q=80"
            alt="Student studying online"
            className="rounded-2xl shadow-lg w-full max-w-sm object-cover"
          />
        </div>

        {/* Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">
              Learn Anywhere, Anytime 🌍
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Whether in class, at home, or in a study group, Edunexus gives
              learners and teachers tools to stay connected and keep learning
              flowing — beyond walls and timetables.
            </p>
            <a
              href="#"
              className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-full hover:bg-emerald-700 transition font-semibold"
            >
              Explore Learning
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

