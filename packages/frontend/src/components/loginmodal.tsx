import { useState, useRef, useEffect } from "react";
import { Logo, CloseIcon } from "../assets";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to auth
    console.log(tab, { email, password, name });
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.32)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(6px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(6px)" : "blur(0px)",
        transition: "background-color 280ms ease, backdrop-filter 280ms ease",
      }}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-100 overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all">
          <CloseIcon className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-6">
            <Logo className="w-6 h-6 text-gray-900" />
            <span className="text-base font-semibold text-gray-900">Komanda26</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all"
                required
              />
            </div>

            {tab === "login" && (
              <div className="text-right">
                <button type="button" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors mt-1"
            >
              {tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
