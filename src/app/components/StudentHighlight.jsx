export default function StudentHighlight() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
        {/* Image */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=600&q=80"
            alt="Student with glasses"
            className="rounded-2xl shadow-lg w-full max-w-sm object-cover"
          />
        </div>

        {/* Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-md">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Learn Anywhere, Anytime 🌍
            </h2>
            <p className="text-gray-600 mb-6">
              Whether you’re at home, at the library, or sipping coffee in your
              favorite corner ☕—our platform gives you the flexibility to learn
              at your own pace.
            </p>
            <a
              href="#"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
            >
              Join Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
