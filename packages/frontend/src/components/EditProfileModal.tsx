import { useRef, useState } from "react";
import { CloseIcon } from "../assets";

interface EditProfileModalProps {
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onUpdated: () => void;
}

export default function EditProfileModal({ onClose, userName, userEmail, userAvatar, onUpdated }: EditProfileModalProps) {
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
