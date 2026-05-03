import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { DiscoverIcon, CloseIcon, ExpandArrow } from "../assets";
import { RecipeImageGallery } from "../components/RecipeImageGallery";
import { getPrimaryRecipeImage, getRecipeImages } from "../utils/recipeImages";
import { useLanguage } from "../i18n/LanguageContext";

const API_BASE =
  (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";
const api = (path: string) => `${API_BASE}/api${path}`;

interface Tag { id: string; name: string; }
interface Ingredient { id: string; info: string; }
interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string | null;
  images?: string[];
  tags: Tag[];
  created_at: string;
  author_name?: string;
  author_avatar_url?: string | null;
}

const TAG_EMOJIS: Record<string, string> = {
  Meat: "🥩", Salad: "🥗", Vegetarian: "🥦", Seafood: "🐟",
  Pasta: "🍝", Soup: "🍲", Dessert: "🍰", Breakfast: "🍳",
  Pizza: "🍕", Vegan: "🌱", Spicy: "🌶️", Quick: "⚡",
};

function timeAgo(dateStr: string, t: (key: string, ...args: any[]) => string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t("time.today");
  if (days === 1) return t("time.yesterday");
  if (days < 30) return t("time.daysAgo", days);
  if (days < 365) return t("time.monthsAgo", Math.floor(days / 30));
  return t("time.yearsAgo", Math.floor(days / 365));
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse dark:bg-gray-800 dark:border-gray-700">
      <div className="aspect-4/3 bg-gray-100 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-100 rounded-full dark:bg-gray-700" />
          <div className="h-5 w-12 bg-gray-100 rounded-full dark:bg-gray-700" />
        </div>
        <div className="h-5 bg-gray-100 rounded w-3/4 dark:bg-gray-700" />
        <div className="h-4 bg-gray-100 rounded w-full dark:bg-gray-700" />
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onClick, index }: { recipe: Recipe; onClick: () => void; index: number }) {
  const [imgError, setImgError] = useState(false);
  const { t, tTag } = useLanguage();
  const primaryImage = getPrimaryRecipeImage(recipe);
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden relative bg-gray-50 dark:bg-gray-700">
        {primaryImage && !imgError ? (
          <img
            src={primaryImage}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200 dark:text-gray-500">🍽</div>
        )}
        {recipe.created_at && (
          <span className="absolute top-3 right-3 text-xs bg-white/90 text-gray-500 px-2 py-0.5 rounded-full shadow-sm dark:bg-gray-900/90 dark:text-gray-300">
            {timeAgo(recipe.created_at, t)}
          </span>
        )}
      </div>
      <div className="p-5">
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full dark:text-gray-300 dark:bg-gray-700">
                {TAG_EMOJIS[tag.name] ? `${TAG_EMOJIS[tag.name]} ` : ""}{tTag(tag.name)}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1.5 group-hover:text-gray-600 transition-colors line-clamp-2 dark:text-white dark:group-hover:text-gray-300">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 dark:text-gray-300">{recipe.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {recipe.author_avatar_url ? (
              <img src={recipe.author_avatar_url} alt={recipe.author_name || t("recipes.unknown")}
                className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500">
                {recipe.author_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {recipe.author_name || t("recipes.unknown")}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-300 group-hover:text-gray-900 transition-colors duration-200 dark:text-gray-500 dark:group-hover:text-white">
            <span className="uppercase tracking-widest font-medium">{t("liked.viewRecipe")}</span>
            <ExpandArrow className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </button>
  );
}

function RecipeDetailModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadingIng, setLoadingIng] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { t, tTag, locale } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";

    fetch(api(`/recipes/${recipe.id}/ingredients`))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data) => { setIngredients(data); setLoadingIng(false); });

    return () => { clearTimeout(timer); document.body.style.overflow = ""; };
  }, [recipe.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
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
        className="modal-scroll relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white"
        >
          <CloseIcon className="w-4 h-4" />
        </button>

        <RecipeImageGallery images={getRecipeImages(recipe)} title={recipe.title} />
        <div className="hidden">
          {recipe.image && !imgError ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 dark:text-gray-500">🍽</div>
          )}
        </div>

        <div className="p-8">
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.tags.map((tag) => (
                <span key={tag.id} className="text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full dark:text-gray-300 dark:bg-gray-700">
                  {TAG_EMOJIS[tag.name] ? `${TAG_EMOJIS[tag.name]} ` : ""}{tTag(tag.name)}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight mb-1 dark:text-white">{recipe.title}</h2>

          {/* Author info */}
          <div className="flex items-center gap-2 mb-4">
            {recipe.author_avatar_url ? (
              <img src={recipe.author_avatar_url} alt={recipe.author_name || t("recipes.unknown")}
                className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-500">
                {recipe.author_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {recipe.author_name || t("recipes.unknown")}
              </p>
              {recipe.created_at && (
                <p className="text-xs text-gray-400 dark:text-gray-300">
                  {new Date(recipe.created_at).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-5 dark:bg-gray-700" />
          {recipe.description && (
            <p className="text-gray-500 leading-relaxed mb-6 text-sm dark:text-gray-200">{recipe.description}</p>
          )}
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-3 dark:text-gray-300">
            <span>{t("recipes.ingredients")}</span>
            <span className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </h4>
          {loadingIng ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 bg-gray-50 rounded-lg animate-pulse dark:bg-gray-700" />
              ))}
            </div>
          ) : ingredients.length === 0 ? (
            <p className="text-gray-400 text-sm italic dark:text-gray-300">{t("recipes.noIngredients")}</p>
          ) : (
            <ul className="space-y-1.5">
              {ingredients.map((ing, i) => (
                <li
                  key={ing.id}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-2.5 rounded-xl text-sm text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-8px)",
                    transition: `opacity 220ms ease ${180 + i * 35}ms, transform 220ms ease ${180 + i * 35}ms`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0 dark:bg-white" />
                  {ing.info}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LikedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetch(`${API_BASE}/auth/whoami`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) { setAuthed(false); setLoading(false); return; }
        setAuthed(true);
        return fetch(api("/user/liked"), { credentials: "include" })
          .then((r) => r.json())
          .then(setRecipes)
          .finally(() => setLoading(false));
      })
      .catch(() => { setAuthed(false); setLoading(false); });
  }, []);

  // ── Not logged in ──────────────────────────────────────────────
  if (authed === false) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto">
            ❤️
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("liked.title")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t("liked.loginToView")}
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <DiscoverIcon className="w-4 h-4" />
            {t("liked.goToDiscover")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────
  if (recipes.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto">🍃</div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{t("liked.noLiked")}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-300 mb-6">
            {t("liked.swipeRight")}
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <DiscoverIcon className="w-4 h-4" />
            {t("liked.startDiscovering")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Grid ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("liked.title")}</h1>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-0.5">
            {t("liked.savedCount", recipes.length)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recipes.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} onClick={() => setSelected(r)} />
          ))}
        </div>
      </div>

      {selected && <RecipeDetailModal recipe={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
