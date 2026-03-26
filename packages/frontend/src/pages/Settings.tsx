import { useState, useEffect } from "react";

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? "bg-gray-900 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-600"}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [newRecipes, setNewRecipes] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [darkMode, setDarkMode] = useState( () => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1 dark:text-gray-300">
            Customize your experience
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-300">
              Notifications
            </p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[
              {
                label: "Push notifications",
                sub: "Receive alerts in your browser",
                value: notifications,
                toggle: () => setNotifications((v) => !v),
              },
              {
                label: "New recipes",
                sub: "When someone shares a new recipe",
                value: newRecipes,
                toggle: () => setNewRecipes((v) => !v),
              },
              {
                label: "Recipe review",
                sub: "When someone posts a review on your recipe",
                value: weeklyDigest,
                toggle: () => setWeeklyDigest((v) => !v),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-300">{item.sub}</p>
                </div>
                <Toggle enabled={item.value} onChange={item.toggle} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-300">
              Privacy
            </p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Public profile
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-300">
                Allow others to see your shared recipes
              </p>
            </div>
            <Toggle
              enabled={publicProfile}
              onChange={() => setPublicProfile((v) => !v)}
            />
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-300">
              Appearance
            </p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Dark mode</p>
              <p className="text-xs text-gray-400 dark:text-gray-300">
                Switch the app to a darker theme
              </p>
            </div>
            <Toggle enabled={darkMode} onChange={() => setDarkMode((v) => !v)} />
          </div>
        </div>

        {/* Save */}
        <button className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors 
          dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
          Save changes
        </button>
      </div>
    </div>
  );
}
