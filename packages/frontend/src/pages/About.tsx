import { Logo } from "../assets";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-4 text-center dark:bg-gray-800 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-white">
            <Logo className="w-8 h-8 text-white dark:text-gray-900" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2 dark:text-white">
            Komanda26
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto dark:text-gray-300">
            A community-driven recipe sharing platform where anyone can
            discover, share, and explore delicious recipes from around the
            world.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-300">
            Our mission
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed dark:text-gray-200">
            We believe great food brings people together. Komanda26 was built to
            make it easy for home cooks and food enthusiasts to share their
            favourite recipes — no complexity, just great food and a welcoming
            community.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-300">
              What you can do
            </p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[
              {
                icon: "📤",
                title: "Share recipes",
                desc: "Upload your own recipes with ingredients, descriptions and photos",
              },
              {
                icon: "🔍",
                title: "Discover new dishes",
                desc: "Browse and search hundreds of community recipes",
              },
              {
                icon: "🏷️",
                title: "Filter by category",
                desc: "Find exactly what you're looking for with tag filters",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 px-6 py-4">
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{f.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 dark:text-gray-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 dark:text-gray-300">
            Built by
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-semibold 
              dark:bg-white dark:text-gray-900">
              K
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Komanda26</p>
              <p className="text-xs text-gray-400 dark:text-gray-300">Student project · 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
