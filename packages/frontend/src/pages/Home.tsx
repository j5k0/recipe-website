import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ShareRecipeForm from "../components/sharerecipe";
import { useAuth } from "../AuthContext"


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
const ALL_TAGS = Object.keys(TAG_EMOJIS);

const API_BASE =
  (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";
const api = (p: string) => `${API_BASE}/api${p}`;

interface Tag {
  id: string;
  name: string;
}
interface Recipe {
  id: string;
  title: string;
  description: string;
  created_at: string;
  image: string | null;
  tags?: Tag[];
}

// Static floating emojis - no interaction, pure CSS animation
const HERO_EMOJIS = [
  { e: "🍕", x: 7, y: 15, size: 38, anim: "floatA", dur: "6s", delay: "0s" },
  { e: "🥗", x: 85, y: 10, size: 30, anim: "floatB", dur: "8s", delay: "1s" },
  { e: "🍜", x: 12, y: 62, size: 26, anim: "floatC", dur: "7s", delay: "2s" },
  { e: "🧁", x: 88, y: 55, size: 32, anim: "floatA", dur: "9s", delay: "0.5s" },
  { e: "🥩", x: 52, y: 7, size: 24, anim: "floatB", dur: "5s", delay: "1.5s" },
  { e: "🍋", x: 4, y: 40, size: 22, anim: "floatC", dur: "7.5s", delay: "3s" },
  {
    e: "🫐",
    x: 91,
    y: 30,
    size: 26,
    anim: "floatA",
    dur: "6.5s",
    delay: "0.8s",
  },
  {
    e: "🌿",
    x: 75,
    y: 72,
    size: 20,
    anim: "floatB",
    dur: "8.5s",
    delay: "2.5s",
  },
  { e: "🧄", x: 25, y: 80, size: 24, anim: "floatC", dur: "6s", delay: "1.2s" },
  { e: "🍓", x: 42, y: 87, size: 26, anim: "floatA", dur: "7s", delay: "0.3s" },
  { e: "🥕", x: 18, y: 28, size: 22, anim: "floatB", dur: "9s", delay: "2s" },
  {
    e: "🫚",
    x: 63,
    y: 80,
    size: 20,
    anim: "floatC",
    dur: "5.5s",
    delay: "1.8s",
  },
];

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.12 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function FeaturedCard({
  recipe,
  delay = 0,
}: {
  recipe: Recipe;
  delay?: number;
}) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/recipes")}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 focus:outline-none
       dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden relative bg-gray-50 dark:bg-gray-700">
        {recipe.image && !imgError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200 dark:text-gray-500">
            🍽
          </div>
        )}
        {recipe.created_at && (
          <span className="absolute top-3 right-3 text-xs bg-white/90 text-gray-500 px-2 py-0.5 rounded-full shadow-sm dark:bg-gray-900/90 dark:text-gray-300">
            {new Date(recipe.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
      <div className="p-5">
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full dark:text-gray-300 dark:bg-gray-700"
              >
                {TAG_EMOJIS[tag.name] ?? ""} {t(`tags.${tag.name}`, tag.name)}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 dark:text-white">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 dark:text-gray-300">
            {recipe.description}
          </p>
        )}
      </div>
    </button>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const { user } = useAuth();

  useScrollReveal();

  useEffect(() => {
    fetch(api("/recipes"))
      .then((r) => (r.ok ? r.json() : []))
      .then(setRecipes)
      .catch(() => {});
    fetch(api("/tags"))
      .then((r) => (r.ok ? r.json() : []))
      .then(setTags)
      .catch(() => {});
  }, []);

  const featured = recipes.slice(0, 6);
  const displayTags =
    tags.length > 0
      ? tags
      : ALL_TAGS.map((name, i) => ({ id: String(i), name }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      search.trim()
        ? `/recipes?search=${encodeURIComponent(search.trim())}`
        : "/recipes",
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Hero ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-16 bg-[linear-gradient(160deg,#ffffff_0%,#f9fafb_50%,#f3f4f6_100%)]
         dark:bg-[linear-gradient(160deg,#111827_0%,#0f172a_50%,#020617_100%)]"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
        }}
      >
        {/* Static floating food emojis */}
        {HERO_EMOJIS.map((em, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${em.x}%`,
              top: `${em.y}%`,
              fontSize: em.size,
              lineHeight: 1,
              userSelect: "none",
              pointerEvents: "none",
              opacity: 0.18,
              animation: `${em.anim} ${em.dur} ease-in-out infinite ${em.delay}`,
              filter: "grayscale(20%)",
            }}
          >
            {em.e}
          </div>
        ))}

        {/* Subtle radial glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(17,24,39,.03) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            textAlign: "center",
            maxWidth: 620,
            zIndex: 1,
            animation: "fadeUp 0.8s cubic-bezier(.16,1,.3,1) both",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 mb-8 dark:bg-white/10">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest dark:text-gray-300">
              {t("home.badge")}
            </span>
          </div>

          <h1
            className="font-bold text-gray-900 leading-tight mb-5 dark:text-white"
            style={{
              fontSize: "clamp(40px, 6.5vw, 76px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            {t("home.hero").split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>

          <p
            className="text-gray-500 mb-10 mx-auto dark:text-gray-300"
            style={{
              fontSize: "clamp(15px,1.8vw,18px)",
              lineHeight: 1.7,
              maxWidth: 440,
            }}
          >
            {t("home.heroSub")}
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center mx-auto mb-0 rounded-full border border-gray-200 bg-white py-[5px] pr-[5px] pl-5
              shadow-[0_2px_16px_rgba(0,0,0,.06)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_2px_20px_rgba(0,0,0,.35)]"
            style={{
              maxWidth: 480,
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("home.searchPlaceholder")}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="shrink-0 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {t("home.search")}
            </button>
          </form>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30"
          style={{ animation: "floatB 2.5s ease-in-out infinite" }}
        >
          <span className="text-[10px] text-gray-400 uppercase tracking-widest dark:text-gray-500">
            {t("home.scroll")}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400 dark:text-gray-500"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Browse by category ────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100 dark:bg-gray-950 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-300">
              {t("home.browseByCategoryLabel")}
            </p>
            <h2
              className="text-3xl font-semibold text-gray-900 dark:text-white"
              style={{ letterSpacing: "-0.01em" }}
            >
              {t("home.browseByCategory")}
            </h2>
          </div>
          <div className="reveal reveal-delay-1 flex flex-wrap gap-2.5 justify-center">
            {displayTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => navigate(`/recipes?tag=${tag.id}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 bg-white hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all
                 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-800 dark:hover:border-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              >
                {TAG_EMOJIS[tag.name] ?? ""} {t(`tags.${tag.name}`, tag.name)}
              </button>
            ))}
            <button
              onClick={() => navigate("/recipes")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-gray-300 text-sm text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all
                dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white"
            >
              {t("home.viewAll")}
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured Recipes ──────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 bg-gray-50 border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="reveal flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 dark:text-gray-300">
                  {t("home.latestLabel")}
                </p>
                <h2
                  className="text-3xl font-semibold text-gray-900 dark:text-white"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {t("home.latest")}
                </h2>
              </div>
              <button
                onClick={() => navigate("/recipes")}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white"
              >
                {t("home.seeAll")}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="reveal reveal-delay-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((r, i) => (
                <FeaturedCard key={r.id} recipe={r} delay={i * 60} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Share Recipe ─────────────────────────────── */}
      {user && <ShareRecipeForm />}

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100 dark:bg-gray-950 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal bg-gray-900 rounded-3xl px-12 py-14 flex items-center justify-between flex-wrap gap-8 relative overflow-hidden dark:bg-gray-800">
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
              style={{
                background: "radial-gradient(circle, #fff 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-300">
                {t("home.ctaLabel")}
              </p>
              <h2
                className="text-2xl font-semibold text-white leading-snug"
                style={{ maxWidth: 550 }}
              >
                {t("home.ctaText")}
              </h2>
            </div>
            <button
              onClick={() => navigate("/recipes")}
              className="shrink-0 px-7 py-3.5 bg-white text-gray-900 font-semibold text-sm rounded-full hover:bg-gray-100 transition-colors relative"
            >
              {t("home.browseRecipes")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
