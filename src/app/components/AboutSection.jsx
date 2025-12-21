export default function AboutSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          About Edunexus
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
          Edunexus is a collaborative learning space built to connect{" "}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            teachers, learners, and parents
          </span>{" "}
          under one platform. It empowers CBC education through accessible tools
          for self-paced learning, creativity, and growth — anywhere, anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
          {/* Teachers */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
              👩🏾‍🏫 Empowering Teachers
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access ready-to-use schemes, lesson plans, and learning guides —
              saving time while enhancing creativity and effective classroom delivery.
            </p>
          </div>

          {/* Learners */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
              🧠 Guiding Learners
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Learn at your own pace with structured resources designed to build confidence, curiosity,
              and skills for real-world problem solving.
            </p>
          </div>

          {/* Parents */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
              🤝 Supporting Parents
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Stay connected to your child’s learning journey with simplified insights,
              progress updates, and resources to guide home support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
