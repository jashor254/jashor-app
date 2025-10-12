export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="backdrop-blur-lg bg-white/30 p-6 rounded-2xl shadow-lg flex flex-col items-center">
        <div className="w-14 h-14 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full animate-spin drop-shadow-md"></div>
        <p className="mt-3 text-blue-700 font-semibold animate-pulse">
          Loading courses...
        </p>
      </div>
    </div>
  );
}
