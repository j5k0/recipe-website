import "./App.css";

export default function App() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300;1,600&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-stone-50 flex flex-col"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* NAV */}
        <nav className="w-full border-b border-stone-100 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <span
              className="text-lg font-semibold text-stone-800"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Komanda<span className="italic text-stone-400">26</span>
            </span>
            <div className="hidden md:flex items-center gap-8 text-sm text-stone-400">
              {["Recipes", "About"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-stone-700 transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
            <button className="text-sm text-stone-600 border border-stone-200 rounded-full px-4 py-1.5 hover:bg-stone-100 transition-colors">
              Sign in
            </button>
          </div>
        </nav>

        {/* HERO */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs tracking-[0.22em] uppercase text-stone-400 mb-6 flex items-center gap-3">
            <span className="inline-block w-6 h-px bg-stone-300" />
            From every corner of the world
            <span className="inline-block w-6 h-px bg-stone-300" />
          </p>

          <h1
            className="text-5xl md:text-7xl font-light text-stone-800 leading-[1.08] mb-6 max-w-2xl"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Good food starts with a{" "}
            <em className="italic text-stone-400">warm kitchen.</em>
          </h1>

          <p className="text-stone-400 text-base leading-relaxed max-w-md mb-10">
            Discover thousands of recipes from every cuisine — curated by cooks
            who actually love to eat.
          </p>

          {/* SEARCH */}
          <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-full px-5 py-3 w-full max-w-md shadow-sm focus-within:border-stone-400 transition-colors mb-4">
            <svg
              className="w-4 h-4 text-stone-300 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="flex-1 bg-transparent outline-none text-sm text-stone-700 placeholder:text-stone-300"
              placeholder="Search recipes, ingredients, cuisines…"
            />
            <button className="bg-stone-800 text-white text-xs font-medium rounded-full px-4 py-1.5 hover:bg-stone-700 transition-colors shrink-0">
              Search
            </button>
          </div>

          {/* QUICK TAGS */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {["Pasta", "Ramen", "Stews", "Salads", "Desserts", "Vegan"].map(
              (t) => (
                <button
                  key={t}
                  className="text-xs text-stone-400 border border-stone-200 rounded-full px-3 py-1.5 hover:border-stone-400 hover:text-stone-600 transition-colors"
                >
                  {t}
                </button>
              ),
            )}
          </div>

          {/* JOIN CTA */}
          <div className="bg-white border border-stone-100 rounded-2xl px-10 py-8 max-w-md w-full shadow-sm">
            <span className="text-xs tracking-[0.18em] uppercase text-stone-400">
              Join the community
            </span>
            <h2
              className="text-2xl font-light text-stone-800 mt-2 mb-2 leading-snug"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Have a recipe the{" "}
              <em className="italic text-stone-400">world should taste?</em>
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              Share your family secrets and heirloom dishes with 200,000+ home
              cooks.
            </p>
            <button className="w-full bg-stone-800 text-white text-sm font-medium rounded-full py-2.5 hover:bg-stone-700 transition-colors">
              Share your recipe
            </button>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="py-8 text-center text-xs text-stone-300">
          © 2026 Komanda26
        </footer>
      </div>
    </>
  );
}
