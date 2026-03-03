import { useState } from "react";

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
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? "bg-gray-900" : "bg-gray-200"}`}
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Customize your experience
          </p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Notifications
            </p>
          </div>
          <div className="divide-y divide-gray-50">
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
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
                <Toggle enabled={item.value} onChange={item.toggle} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Privacy
            </p>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Public profile
              </p>
              <p className="text-xs text-gray-400">
                Allow others to see your shared recipes
              </p>
            </div>
            <Toggle
              enabled={publicProfile}
              onChange={() => setPublicProfile((v) => !v)}
            />
          </div>
        </div>

        {/* Save */}
        <button className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors">
          Save changes
        </button>
      </div>
    </div>
  );
}
