export default function AboutSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          About Echoes of Gaia
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
          Echoes of Gaia is a journey through time, evolution, and the deep
          connection between Earth 🌍 and the cosmos ✨. We explore history
          through the lens of biology, culture, and science — weaving stories
          that awaken curiosity and inspire discovery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
              🌿 Evolution Meets History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We connect the dots between ancient events and biological change
              to reveal the hidden patterns shaping our world.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
              🌍 Earth as a Storyteller
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              From tectonic shifts to cultural revolutions, Earth whispers
              narratives we translate into powerful learning journeys.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600 dark:text-emerald-400">
              🚀 Bridging to the Cosmos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We occasionally look upward — connecting Earth’s story to the
              vastness of space to expand our understanding of existence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
