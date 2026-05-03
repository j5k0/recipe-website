import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Logo,
  LensIcon,
  FilterIcon,
  InformationIcon,
  RecipesIcon,
  DiscoverIcon,
  SettingsIcon,
  UserIcon,
} from "../assets";
import LoginModal from "./loginmodal.tsx";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

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
  const { user } = useAuth();
  const { t, tTag, lang, setLang } = useLanguage();

  useEffect(() => {
    fetch(api("/tags"))
      .then((r) => (r.ok ? r.json() : []))
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
    if (filterOpen) setFilterOpen(false);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) next.set("search", val.trim());
    else next.delete("search");
    navigate(
      { pathname: "/recipes", search: next.toString() },
      { replace: true },
    );
  };

  const toggleTag = (id: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("tag");
    const newTags = activeTags.includes(id)
      ? activeTags.filter((t) => t !== id)
      : [...activeTags, id];
    newTags.forEach((t) => next.append("tag", t));
    navigate({ pathname: "/recipes", search: next.toString() });
  };

  const clearTags = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("tag");
    navigate({ pathname: "/recipes", search: next.toString() });
  };

  const iconNavClass = ({ isActive }: { isActive: boolean }) =>
    `w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
      isActive
        ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
        : "text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
    }`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <Logo className="w-7 h-7 text-gray-900 dark:text-white" />
            <span className="text-lg font-semibold text-gray-900 tracking-tight dark:text-white">
              Komanda26
            </span>
          </NavLink>

          {/* Search + Filter */}
          <div className="flex-1 max-w-2xl mx-auto relative">
            <div className="relative">
              <LensIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder")}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400 transition-all
                 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-gray-500"
              />
              <div
                ref={filterRef}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                <button
                  onClick={() => setFilterOpen((o) => !o)}
                  className="relative block"
                >
                  <span
                    className={`block transition-colors ${filterOpen || activeTags.length > 0 ? "text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                  >
                    <FilterIcon className="w-4 h-4" />
                    {activeTags.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-900 rounded-full text-[8px] text-white flex items-center justify-center font-bold leading-none">
                        {activeTags.length}
                      </span>
                    )}
                  </span>
                </button>
                {filterOpen && (
                  <div
                    className="absolute top-full right-0 mt-4 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg z-50 p-4 dark:bg-gray-800 dark:border-gray-700"
                    style={{ animation: "fadeSlideDown 180ms ease" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-300">
                        {t("nav.filterByTag")}
                      </span>
                      {activeTags.length > 0 && (
                        <button
                          onClick={clearTags}
                          className="text-xs text-gray-400 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white"
                        >
                          {t("nav.clearAll")}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const active = activeTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                              active
                                ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400"
                            }`}
                          >
                            {TAG_EMOJIS[tag.name] ?? ""} {tTag(tag.name)}
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
            <NavLink to="/recipes" title="Recipes" className={iconNavClass}>
              <RecipesIcon className="w-4.5 h-4.5" />
            </NavLink>
            <NavLink to="/discover" title="Discover" className={iconNavClass}>
              <DiscoverIcon className="w-4.5 h-4.5" />
            </NavLink>
            <NavLink to="/about" title="About" className={iconNavClass}>
              <InformationIcon className="w-4.5 h-4.5" />
            </NavLink>
            <NavLink to="/settings" title="Settings" className={iconNavClass}>
              <SettingsIcon className="w-4.5 h-4.5" />
            </NavLink>

            {/* Language selector */}
            <div className="flex items-center rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden ml-1">
              <button
                onClick={() => setLang("en")}
                title="English"
                className={`px-2 py-1.5 leading-none transition-colors ${
                  lang === "en"
                    ? "bg-gray-200 dark:bg-gray-600"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <svg width="22" height="14" viewBox="0 0 22 14" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
                  <rect width="22" height="14" fill="#012169"/>
                  <path d="M0,0 L22,14 M22,0 L0,14" stroke="white" strokeWidth="2.8"/>
                  <path d="M11,0 V14 M0,7 H22" stroke="white" strokeWidth="4.7"/>
                  <path d="M0,0 L22,14 M22,0 L0,14" stroke="#C8102E" strokeWidth="1.8"/>
                  <path d="M11,0 V14 M0,7 H22" stroke="#C8102E" strokeWidth="2.8"/>
                </svg>
              </button>
              <button
                onClick={() => setLang("lt")}
                title="Lietuvių"
                className={`px-2 py-1.5 leading-none transition-colors ${
                  lang === "lt"
                    ? "bg-gray-200 dark:bg-gray-600"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <svg width="22" height="14" viewBox="0 0 22 14" xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
                  <rect width="22" height="4.67" y="0" fill="#FDB913"/>
                  <rect width="22" height="4.67" y="4.67" fill="#006A44"/>
                  <rect width="22" height="4.66" y="9.34" fill="#C1272D"/>
                </svg>
              </button>
            </div>

            {user && (
              <NavLink
                to="/account"
                title="Account"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-1 rounded-full transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`
                }
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.user_name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-white dark:text-gray-900">
                      {user.user_name[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white pr-1">
                  {user.user_name}
                </span>
              </NavLink>
            )}
            {!user && (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors ml-1
                dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                <UserIcon className="w-4 h-4" />
                {t("nav.login")}
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideDown {
            from { opacity: 0; transform: translateY(-6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </nav>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}
