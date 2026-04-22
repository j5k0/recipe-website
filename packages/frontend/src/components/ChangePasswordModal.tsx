import { useState } from "react";
import { CloseIcon } from "../assets";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!currentPassword || !newPassword) { setError("Please fill in all fields"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/user/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) { setSuccess(true); setTimeout(onClose, 2000); return; }
      const data = await res.json();
      setError(data.error === "Incorrect password" ? "Incorrect current password" : data.error || "Failed to update password");
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white">
          <CloseIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <span className="text-xl">🔒</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Change password</h2>
            <p className="text-xs text-gray-400 dark:text-gray-300">Update your account password</p>
          </div>
        </div>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 mb-3"
          autoFocus
        />
        <input
          type="password"
          placeholder="New password (min 8 characters)"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 mb-3"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 mb-3"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className={`w-full py-2.5 text-sm font-medium rounded-xl transition-colors ${
            success ? "bg-lime-700 text-white" : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          } disabled:opacity-60`}
        >
          {success ? "Password changed!" : loading ? "Updating…" : "Update password"}
        </button>
      </div>
    </div>
  );
}
