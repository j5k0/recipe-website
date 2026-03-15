import { ExpandArrow } from "../assets";

export default function Account() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight dark:text-white">
            Account
          </h1>
          <p className="text-sm text-gray-400 mt-1 dark:text-gray-300">
            Manage your profile and preferences
          </p>
        </div>

        {/* Avatar + name */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold shrink-0
             dark:bg-white dark:text-gray-900">
              K
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg dark:text-white">Komanda26</p>
              <p className="text-sm text-gray-400 dark:text-gray-300">komanda26@example.com</p>
            </div>
            <button className="ml-auto text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-all
             dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:border-gray-400 dark:hover:bg-gray-700">
              Edit
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: "Recipes shared", value: "?" },
            { label: "This month", value: "?" },
            { label: "Member since", value: "?" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center dark:bg-gray-800 dark:border-gray-700"
            >
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 dark:text-gray-300">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:divide-gray-700">
          {[
            {
              icon: "🔒",
              label: "Change password",
              sub: "Update your account password",
            },
            {
              icon: "📧",
              label: "Contact preferences",
              sub: "Manage your information and notifications",
            },
            {
              icon: "🗑",
              label: "Delete account",
              sub: "Permanently remove your account",
              danger: true,
            },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left dark:hover:bg-gray-700"
            >
              <span className="text-xl w-8 text-center">{item.icon}</span>
              <div>
                <p
                  className={`text-sm font-medium ${item.danger ? "text-red-500" : "text-gray-900 dark:text-white"}`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-300">{item.sub}</p>
              </div>
              <ExpandArrow className="w-4 h-4 text-gray-300 ml-auto dark:text-gray-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
