import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const API_BASE =
  (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";
const api = (path: string) => `${API_BASE}/api${path}`;

const TAG_EMOJIS: Record<string, string> = {
  Meat: "🥩",
  Salad: "🥗",
  Vegetarian: "🥦",
  Seafood: "🐟",
  Pasta: "🍝",
  Soup: "🍲",
  Dessert: "🍰",
  Breakfast: "🍳",
  Pizza: "🍕",
  Vegan: "🌱",
  Spicy: "🌶️",
  Quick: "⚡",
};

interface Tag {
  id: string;
  name: string;
}

export default function Navigation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const activeTags = searchParams.getAll("tag");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(api("/tags"))
      .then((r) => (r.ok ? r.json() : []))
      .then(setTags)
      .catch(() => {});
  }, []);

  // Close filter on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close filter on any key press
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (filterOpen) setFilterOpen(false);
      if (e.key === "Escape") {
        setFilterOpen(false);
        setLoginOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [filterOpen]);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    // Close filter when typing
    if (filterOpen) setFilterOpen(false);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) next.set("search", val.trim());
    else next.delete("search");
    navigate({ pathname: "/", search: next.toString() }, { replace: true });
  };

  const toggleTag = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("tag");
    const newTags = activeTags.includes(id)
      ? activeTags.filter((t) => t !== id)
      : [...activeTags, id];
    newTags.forEach((t) => next.append("tag", t));
    navigate({ pathname: "/", search: next.toString() });
  };

  const clearTags = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("tag");
    navigate({ pathname: "/", search: next.toString() });
  };

  const iconNavClass = ({ isActive }: { isActive: boolean }) =>
    `w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
      isActive
        ? "bg-gray-100 text-gray-900"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <svg
              className="w-7 h-7 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
            <span className="text-lg font-semibold text-gray-900 tracking-tight">
              Komanda26
            </span>
          </NavLink>

          {/* Search + Filter */}
          <div className="flex-1 max-w-2xl mx-auto relative">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all"
              />
              {/* Filter button */}
              <div
                ref={filterRef}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                <button
                  onClick={() => setFilterOpen((o) => !o)}
                  className="relative block"
                >
                  <span
                    className={`block transition-colors ${filterOpen || activeTags.length > 0 ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    {activeTags.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-900 rounded-full text-[8px] text-white flex items-center justify-center font-bold leading-none">
                        {activeTags.length}
                      </span>
                    )}
                  </span>
                </button>

                {/* Filter dropdown — inside filterRef so outside clicks close it */}
                {filterOpen && (
                  <div
                    className="absolute top-full right-0 mt-4 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 p-4"
                    style={{ animation: "fadeSlideDown 180ms ease" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Filter by tag
                      </span>
                      {activeTags.length > 0 && (
                        <button
                          onClick={clearTags}
                          className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => {
                        const active = activeTags.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleTag(t.id)}
                            className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                              active
                                ? "bg-gray-900 border-gray-900 text-white"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {TAG_EMOJIS[t.name] ?? ""} {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 shrink-0">
            <NavLink to="/about" title="About" className={iconNavClass}>
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </NavLink>

            <NavLink to="/settings" title="Settings" className={iconNavClass}>
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </NavLink>

            <NavLink to="/account" title="Account" className={iconNavClass}>
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </NavLink>

            <button
              onClick={() => setLoginOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors ml-1"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideDown {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </nav>

      {/* Login modal */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
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
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
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
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.97)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
            <span className="text-base font-semibold text-gray-900">
              Komanda26
            </span>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password
              </label>
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
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
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
