import { useState, useRef, useEffect } from "react";
import { Logo, CloseIcon } from "../assets";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loginState, setLoginState] = useState<"fail" | "success" | "unknown">("unknown");
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

  const handleRegister = async () => {
      try{
          const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, name, password }),
          });
          if(res.ok){
              setLoginState("success");
          }
          else{
              setLoginState("fail");
          }
      }
      catch{
        setLoginState("fail");
      }
  }

  const handleLogin = async() => {
      try{
          const res = await fetch(import.meta.env.VITE_BACKEND_URL + '/auth/login', {
              method: 'POST',
              credentials: "include",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });
          if(res && res.ok){
              setLoginState("success");
          }
          else{
              setLoginState("fail");
          }
      }
      catch{
          setLoginState("fail");
      }
  }

  // TODO: surely this can be done in a better way than redeclaring the same classes multiple times
  const loginButtonStates: Record<string, { additionalClasses: string, label: string }> = {
      unknown: { additionalClasses: "w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors mt-1 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200", label: "Sign in"},
      fail: { additionalClasses: "w-full py-2.5 bg-rose-700 text-white text-sm font-medium rounded-xl hover:bg-rose-800 transition-colors mt-1", label: "Failed to sign in" },
      success: { additionalClasses: "w-full py-2.5 bg-lime-700 text-white text-sm font-medium rounded-xl hover:bg-lime-800 transition-colors mt-1", label: "Success"}
  }

  const signUpButtonStates: Record<string, { additionalClasses: string, label: string }> = {
      unknown: { additionalClasses: "w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors mt-1 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200", label: "Create account"},
      fail: { additionalClasses: "w-full py-2.5 bg-rose-700 text-white text-sm font-medium rounded-xl hover:bg-rose-800 transition-colors mt-1", label: "Failed to sign up" },
      success: { additionalClasses: "w-full py-2.5 bg-lime-700 text-white text-sm font-medium rounded-xl hover:bg-lime-800 transition-colors mt-1", label: "Success"}
  }


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
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all
         dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white">
          <CloseIcon className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-6">
            <Logo className="w-6 h-6 text-gray-900 dark:text-white" />
            <span className="text-base font-semibold text-gray-900 dark:text-white">Komanda26</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 dark:bg-gray-700">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === "login" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white" : 
                "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${tab === "register" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white" : 
                "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"}`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => (
                      setName(e.target.value),
                      setLoginState("unknown")
                  )}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all
                   dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-gray-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => (
                    setEmail(e.target.value),
                    setLoginState("unknown")
                )}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all
                 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 dark:text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => (
                    setPassword(e.target.value),
                    setLoginState("unknown")
                )}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all
                 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-gray-500"
                required
              />
            </div>

            {tab === "login" && (
              <div className="text-right">
                <button type="button" className="text-xs text-gray-400 hover:text-gray-700 transition-colors  dark:text-gray-300 dark:hover:text-white">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              onClick= { () => {
                  if(tab === "register"){
                      handleRegister();
                  }
                  else if(tab === "login"){
                      handleLogin();
                  }
              }}
              className={tab === "login" ? loginButtonStates[loginState].additionalClasses : signUpButtonStates[loginState].additionalClasses }
            >
              {tab === "login" ? loginButtonStates[loginState].label : signUpButtonStates[loginState].label}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
