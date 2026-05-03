import { useState, useEffect } from "react";
import { CloseIcon } from "../assets";
import { useLanguage } from "../i18n/LanguageContext";

interface ContactPreferencesModalProps {
  onClose: () => void;
}

export default function ContactPreferencesModal({ onClose }: ContactPreferencesModalProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

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
      const data = await res.json(); setError(data.error || t("contactPrefs.failed"));
    } catch { setError(t("contactPrefs.somethingWrong")); }
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
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t("contactPrefs.title")}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-300">{t("contactPrefs.subtitle")}</p>
          </div>
        </div>
        <div className="space-y-4 mb-4">
          <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl dark:border-gray-700">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">{t("contactPrefs.emailNotifications")}</p><p className="text-xs text-gray-400 dark:text-gray-300">{t("contactPrefs.emailNotificationsSub")}</p></div>
            <button type="button" onClick={handleToggle(setEmailNotifications)} className={`relative w-11 h-6 rounded-full transition-colors ${emailNotifications ? "bg-gray-900 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? "translate-x-5" : ""}`} />
            </button>
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-100 rounded-xl dark:border-gray-700">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">{t("contactPrefs.marketingEmails")}</p><p className="text-xs text-gray-400 dark:text-gray-300">{t("contactPrefs.marketingEmailsSub")}</p></div>
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
          {success ? t("contactPrefs.saved") : loading ? t("contactPrefs.saving") : t("contactPrefs.save")}
        </button>
      </div>
    </div>
  );
}
