import { useRef, useState } from "react";
import { ExpandArrow } from "../assets";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Account() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingFile(file);
        setPreview(URL.createObjectURL(file));
        setUploadError(null);
    };

    const handleSave = async () => {
        if (!pendingFile) return;
        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append("image", pendingFile);
        try {
            const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/user/avatar", {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            await refreshUser();
            setPendingFile(null);
            setPreview(null);
        } catch {
            setUploadError("Failed to upload. Try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCancel = () => {
        setPendingFile(null);
        setPreview(null);
        setUploadError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const avatarSrc = preview ?? user?.avatar_url ?? null;
    const initials = user?.user_name?.[0]?.toUpperCase() ?? "?";

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
            {/* Clickable avatar */}
            <button
              className="relative w-16 h-16 rounded-full shrink-0 group focus:outline-none"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold dark:bg-white dark:text-gray-900">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-lg dark:text-white">{user?.user_name}</p>
              <p className="text-sm text-gray-400 dark:text-gray-300">{user?.email}</p>
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>

            {pendingFile ? (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={handleSave}
                  disabled={uploading}
                  className="text-sm text-white bg-gray-900 hover:bg-gray-700 px-4 py-1.5 rounded-full transition-all disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  {uploading ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-all dark:text-gray-300 dark:border-gray-600 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ml-auto text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-all dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:border-gray-400 dark:hover:bg-gray-700"
              >
                Edit
              </button>
            )}
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
                icon: "👋",
                label: "Sign out",
                sub: "Sign out of your account",
                onClick: async () => {
                    const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/logout", {
                        method: "POST",
                        credentials: "include"
                    })
                    if(res.ok){
                        refreshUser();
                        navigate("/");
                    }
                }
            },
            {
              icon: "🔒",
              label: "Change password",
              sub: "Update your account password",
              onClick: () => {}
            },
            {
              icon: "📧",
              label: "Contact preferences",
              sub: "Manage your information and notifications",
              onClick: () => {}
            },
            {
              icon: "🗑",
              label: "Delete account",
              sub: "Permanently remove your account",
              danger: true,
              onClick: () => {}
            },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left dark:hover:bg-gray-700"
              onClick={item.onClick}
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
