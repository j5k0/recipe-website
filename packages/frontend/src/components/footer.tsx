export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 border-t border-gray-800 dark:bg-white dark:text-gray-900 dark:border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Komanda26. Made with ❤️ for food lovers.
        </p>
      </div>
    </footer>
  );
}
