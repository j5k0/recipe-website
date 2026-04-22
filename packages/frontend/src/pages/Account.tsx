import { useRef, useState, useEffect } from "react";
import { ExpandArrow, CloseIcon } from "../assets";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function DeleteModal({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!password) { setError("Please enter your password."); return; }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/user", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { onDeleted(); return; }
      const data = await res.json();
      setError(data.error === "Incorrect password" ? "Incorrect password." : "Failed to delete account.");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <span className="text-xl">🗑</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Delete account</h2>
            <p className="text-xs text-gray-400 dark:text-gray-300">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          Your account, recipes, and all associated data will be <span className="font-medium text-red-500">permanently deleted</span>. Enter your password to confirm.
        </p>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleDelete()}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 mb-2"
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Confirm delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({ onClose, userName, userEmail, userAvatar, onUpdated }: { onClose: () => void; userName?: string; userEmail?: string; userAvatar?: string; onUpdated: () => void }) {
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState(userEmail || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (!email.includes("@")) { setError("Invalid email format"); return; }
    setLoading(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        const avatarRes = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/user/avatar", { method: "POST", credentials: "include", body: formData });
        if (!avatarRes.ok) throw new Error("Failed to upload avatar");
      }
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: name.trim(), email: email.trim() }),
      });
      if (res.ok) { setSuccess(true); onUpdated(); setTimeout(onClose, 2000); return; }
      const data = await res.json();
      setError(data.error || "Failed to update profile");
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  const initials = name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white">
          <CloseIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <span className="text-xl">✏️</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit profile</h2>
            <p className="text-xs text-gray-400 dark:text-gray-300">Update your name, email and photo</p>
          </div>
        </div>
        <div className="flex justify-center mb-4">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="relative w-16 h-16 rounded-full group focus:outline-none">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : userAvatar ? (
              <img src={userAvatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold dark:bg-white dark:text-gray-900">{initials}</div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </div>
        <input
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 mb-3"
          autoFocus
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
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
          {success ? "Saved!" : loading ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
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

function ContactPreferencesModal({ onClose }: { onClose: () => void }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchPrefs = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/user/preferences", { credentials: "include" });
      if (res.ok) { const data = await res.json(); setEmailNotifications(data.email_notifications); setMarketingEmails(data.marketing_emails); }
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/user/preferences", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_notifications: emailNotifications, marketing_emails: marketingEmails }),
      });
      if (res.ok) { setSuccess(true); setTimeout(onClose, 2000); return; }
      const data = await res.json(); setError(data.error || "Failed to save preferences");
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  };

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => { setter(prev => !prev); };

  useEffect(() => { fetchPrefs(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white">
          <CloseIcon className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
            <span className="text-xl">📧</span>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Contact preferences</h2>
            <p className="text-xs text-gray-400 dark:text-gray-300">Manage your information and notifications</p>
          </div>
        </div>
        <div className="space-y-4 mb-4">
          <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl dark:border-gray-700">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">Email notifications</p><p className="text-xs text-gray-400 dark:text-gray-300">Receive emails about your account activity</p></div>
            <button type="button" onClick={handleToggle(setEmailNotifications)} className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? "bg-gray-900 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? "translate-x-5" : ""}`} />
            </button>
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl dark:border-gray-700">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">Marketing emails</p><p className="text-xs text-gray-400 dark:text-gray-300">Receive updates and promotional content</p></div>
            <button type="button" onClick={handleToggle(setMarketingEmails)} className={`relative w-11 h-6 rounded-full transition-colors ${marketingEmails ? "bg-gray-900 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${marketingEmails ? "translate-x-5" : ""}`} />
            </button>
          </label>
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <button
          onClick={handleSave}
          disabled={loading || success}
          className={`w-full py-2.5 text-sm font-medium rounded-xl transition-colors ${
            success ? "bg-lime-700 text-white" : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          } disabled:opacity-60`}
        >
          {success ? "Saved!" : loading ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const handleDeleted = async () => { await refreshUser(); navigate("/"); };
  const handleProfileUpdated = async () => { await refreshUser(); };

  const avatarSrc = user?.avatar_url ?? null;
  const initials = user?.user_name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Account</h1>
          <p className="text-sm text-gray-400 mt-1 dark:text-gray-300">Manage your profile and preferences</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-semibold dark:bg-white dark:text-gray-900">{initials}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-lg">{user?.user_name}</p>
              <p className="text-sm text-gray-400 dark:text-gray-300">{user?.email}</p>
            </div>
            <button onClick={() => setShowEditModal(true)} className="ml-auto text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-all dark:text-gray-300 dark:border-gray-600 dark:hover:text-white">Edit</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[{ label: "Recipes shared", value: "?" }, { label: "This month", value: "?" }, { label: "Member since", value: "?" }].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1 dark:text-gray-300">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:divide-gray-700">
          {[
            { icon: "👋", label: "Sign out", sub: "Sign out of your account", onClick: async () => { const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/auth/logout", { method: "POST", credentials: "include" }); if (res.ok) { refreshUser(); navigate("/"); } } },
            { icon: "🔒", label: "Change password", sub: "Update your account password", onClick: () => setShowPasswordModal(true) },
            { icon: "📧", label: "Contact preferences", sub: "Manage your information and notifications", onClick: () => setShowPreferencesModal(true) },
            { icon: "🗑", label: "Delete account", sub: "Permanently remove your account and all data", danger: true, onClick: () => setShowDeleteModal(true) },
          ].map((item) => (
            <button key={item.label} className={`w-full flex items-center gap-4 px-6 py-4 transition-colors text-left ${item.danger ? "hover:bg-red-50 dark:hover:bg-red-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`} onClick={item.onClick}>
              <span className="text-xl w-8 text-center">{item.icon}</span>
              <div><p className={`text-sm font-medium ${item.danger ? "text-red-500" : "text-gray-900 dark:text-white"}`}>{item.label}</p><p className="text-xs text-gray-400 dark:text-gray-300">{item.sub}</p></div>
              <ExpandArrow className={`w-4 h-4 ml-auto ${item.danger ? "text-red-300" : "text-gray-300 dark:text-gray-500"}`} />
            </button>
          ))}
        </div>
      </div>
      {showDeleteModal && <DeleteModal onClose={() => setShowDeleteModal(false)} onDeleted={handleDeleted} />}
      {showEditModal && <EditProfileModal onClose={() => { setShowEditModal(false); handleProfileUpdated(); }} userName={user?.user_name} userEmail={user?.email} userAvatar={user?.avatar_url ?? undefined} onUpdated={handleProfileUpdated} />}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showPreferencesModal && <ContactPreferencesModal onClose={() => setShowPreferencesModal(false)} />}
    </div>
  );
}
