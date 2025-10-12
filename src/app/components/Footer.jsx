export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 text-center py-6 mt-10">
      <p className="text-gray-600 dark:text-gray-300">
        © {new Date().getFullYear()} Echoes of Gaia. All rights reserved.
      </p>
    </footer>
  );
}
