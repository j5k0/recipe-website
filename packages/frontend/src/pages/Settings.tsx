import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? "bg-gray-900 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-600"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function Settings() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState(true);
  const [newRecipes, setNewRecipes] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(import.meta.env.VITE_BACKEND_URL + "/api/user/preferences", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setEmailNotifications(data.email_notifications);
        setMarketingEmails(data.marketing_emails);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/user/preferences", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          marketing_emails: marketingEmails,
        }),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 2500);
  };

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

        {/* Contact Preferences */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-300">
              Contact Preferences
            </p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {[
              {
                label: "Email notifications",
                sub: "Receive important updates about your account and recipes via email",
                value: emailNotifications,
                toggle: () => setEmailNotifications((v) => !v),
              },
              {
                label: "Marketing emails",
                sub: "Get tips, featured recipes, and news from the team",
                value: marketingEmails,
                toggle: () => setMarketingEmails((v) => !v),
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
                <Toggle enabled={item.value} onChange={item.toggle} disabled={loading || !user} />
              </div>
            ))}
          </div>
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
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving" || !user}
          className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          {saveStatus === "saving"
            ? "Saving…"
            : saveStatus === "saved"
            ? "Saved"
            : saveStatus === "error"
            ? "Failed to save"
            : "Save changes"}
        </button>
      </div>
    </div>
  );
}
