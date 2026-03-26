import { useState, useEffect, useRef, useCallback } from "react";
import { CloseIcon, HeartIcon, ExpandArrow } from "../assets";

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
  tags: Tag[];
  created_at: string;
}

const TAG_EMOJIS: Record<string, string> = {
  Meat: "🥩", Salad: "🥗", Vegetarian: "🥦", Seafood: "🐟",
  Pasta: "🍝", Soup: "🍲", Dessert: "🍰", Breakfast: "🍳",
  Pizza: "🍕", Vegan: "🌱", Spicy: "🌶️", Quick: "⚡",
};

const SWIPE_THRESHOLD = 80;

// ── Recipe detail modal ─────────────────────────────────────────────
function RecipeDetailModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadingIng, setLoadingIng] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    fetch(api(`/recipes/${recipe.id}/ingredients`))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data: Ingredient[]) => { setIngredients(data); setLoadingIng(false); });
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [recipe.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(8px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(8px)" : "blur(0px)",
        transition: "background-color 280ms ease, backdrop-filter 280ms ease",
      }}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "opacity 280ms ease, transform 280ms ease",
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
        <div className="aspect-video overflow-hidden rounded-t-2xl bg-gray-50 dark:bg-gray-700">
          {recipe.image && !imgError ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 dark:text-gray-500">🍽</div>
          )}
        </div>
        <div className="p-8">
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.tags.map((t) => (
                <span key={t.id} className="text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full dark:text-gray-300 dark:bg-gray-700">
                  {TAG_EMOJIS[t.name] ? `${TAG_EMOJIS[t.name]} ` : ""}{t.name}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight mb-1 dark:text-white">{recipe.title}</h2>
          {recipe.created_at && (
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-5 dark:text-gray-300">
              {new Date(recipe.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
          <div className="h-px bg-gray-100 mb-5 dark:bg-gray-700" />
          {recipe.description && (
            <p className="text-gray-500 leading-relaxed mb-6 text-sm dark:text-gray-200">{recipe.description}</p>
          )}
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-3 dark:text-gray-300">
            <span>Ingredients</span>
            <span className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </h4>
          {loadingIng ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-9 bg-gray-50 rounded-lg animate-pulse dark:bg-gray-700" />)}
            </div>
          ) : ingredients.length === 0 ? (
            <p className="text-gray-400 text-sm italic dark:text-gray-300">No ingredients listed.</p>
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

// ── Liked panel (slides in from right) ─────────────────────────────
function LikedPanel({ recipes, onClose, onSelect }: {
  recipes: Recipe[];
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
}) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-55 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "backdropIn 200ms ease" }}
      />
      <div
        className="fixed top-0 right-0 bottom-0 z-60 w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col"
        style={{ animation: "slideInRight 300ms cubic-bezier(0.34, 1.2, 0.64, 1)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Liked Recipes</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} this session
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-4xl mb-3">🍃</div>
              <p className="text-sm text-gray-400 dark:text-gray-500">No liked recipes yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recipes.map((recipe, i) => {
                const imgError = imgErrors[recipe.id];
                return (
                  <button
                    key={recipe.id}
                    onClick={() => onSelect(recipe)}
                    className="w-full text-left flex gap-3 items-center p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group"
                    style={{ animation: `itemFadeIn 200ms ease ${i * 40}ms both` }}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-200 dark:bg-gray-700">
                      {recipe.image && !imgError ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                          onError={() => setImgErrors((p) => ({ ...p, [recipe.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-300 dark:text-gray-600">🍽</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">{recipe.title}</p>
                      {recipe.tags && recipe.tags.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate dark:text-gray-500">
                          {recipe.tags.slice(0, 2).map((t) => `${TAG_EMOJIS[t.name] ?? ""} ${t.name}`).join(" · ")}
                        </p>
                      )}
                    </div>
                    <ExpandArrow className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-300 shrink-0 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes itemFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

// ── Main Discover component ─────────────────────────────────────────
export default function Discover() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ user_name: string; email: string } | null>(null);
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([]);

  // Panel & modal
  const [showLikedPanel, setShowLikedPanel] = useState(false);
  const [selectedDetailRecipe, setSelectedDetailRecipe] = useState<Recipe | null>(null);

  // Drag / animation state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  // Like visual effects
  const [likeEffect, setLikeEffect] = useState(false);
  const [heartParticles, setHeartParticles] = useState<{ id: number; x: number }[]>([]);

  // Toast
  const [toast, setToast] = useState<{ msg: string; kind: "like" | "skip" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragOffsetRef = useRef(0);
  const dragStartX = useRef(0);

  const setOffset = (val: number) => {
    dragOffsetRef.current = val;
    setDragOffset(val);
  };

  // ── Data loading ───────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/recipes`).then((r) => r.json()).catch(() => []),
      fetch(`${API_BASE}/auth/whoami`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([recipeData, userData]) => {
      const data: Recipe[] = Array.isArray(recipeData) ? recipeData : [];
      // Shuffle for random discovery order
      setRecipes([...data].sort(() => Math.random() - 0.5));
      setUser(userData);
      setLoading(false);
    });
  }, []);

  // ── Toast helper ───────────────────────────────────────────────
  const showToast = (msg: string, kind: "like" | "skip") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, kind });
    toastTimer.current = setTimeout(() => setToast(null), 1400);
  };

  // ── Trigger like effects ───────────────────────────────────────
  const triggerLikeEffects = useCallback(() => {
    setLikeEffect(true);
    setTimeout(() => setLikeEffect(false), 600);

    const now = Date.now();
    setHeartParticles([
      { id: now,     x: 35 },
      { id: now + 1, x: 50 },
      { id: now + 2, x: 65 },
    ]);
    setTimeout(() => setHeartParticles([]), 800);
  }, []);

  // ── Advance card ───────────────────────────────────────────────
  const advanceCard = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setExitDirection(null);
    setLikeEffect(false);
    setHeartParticles([]);
    dragOffsetRef.current = 0;
    setDragOffset(0);
  }, []);

  // ── Core swipe handler ─────────────────────────────────────────
  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (exitDirection !== null) return;
      const recipe = recipes[currentIndex];
      if (!recipe) return;

      setExitDirection(direction);

      if (direction === "right") {
        setLikedRecipes((prev) =>
          prev.some((r) => r.id === recipe.id) ? prev : [...prev, recipe]
        );
        triggerLikeEffects();
        showToast(`Liked "${recipe.title}"!`, "like");
        if (user) {
          fetch(`${API_BASE}/api/recipes/${recipe.id}/like`, {
            method: "POST",
            credentials: "include",
          }).catch(() => {});
        }
      } else {
        showToast("Skipped", "skip");
      }

      setTimeout(advanceCard, 720);
    },
    [exitDirection, currentIndex, recipes, user, advanceCard, triggerLikeEffects],
  );

  // ── Global mouse handlers ──────────────────────────────────────
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => setOffset(e.clientX - dragStartX.current);
    const onUp = () => {
      setIsDragging(false);
      const offset = dragOffsetRef.current;
      if (Math.abs(offset) > SWIPE_THRESHOLD) {
        handleSwipe(offset > 0 ? "right" : "left");
      } else {
        setOffset(0);
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, handleSwipe]);

  // ── Keyboard support ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleSwipe("right");
      else if (e.key === "ArrowLeft") handleSwipe("left");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSwipe]);

  // ── Pointer handlers ───────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    if (exitDirection !== null) return;
    dragStartX.current = e.clientX;
    setIsDragging(true);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (exitDirection !== null) return;
    dragStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setOffset(e.touches[0].clientX - dragStartX.current);
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const offset = dragOffsetRef.current;
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      handleSwipe(offset > 0 ? "right" : "left");
    } else {
      setOffset(0);
    }
  };

  // ── Derived values ─────────────────────────────────────────────
  const currentRecipe = recipes[currentIndex];
  const nextRecipe = recipes[currentIndex + 1];
  const isDone = !loading && currentIndex >= recipes.length;
  const likedCount = likedRecipes.length;

  const cardStyle = (): React.CSSProperties => {
    if (exitDirection === "right") {
      return {
        opacity: 0,
        transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.07}deg) scale(1.06)`,
        transition: "opacity 700ms ease, transform 700ms ease",
        cursor: "default",
      };
    }
    if (exitDirection === "left") {
      return {
        opacity: 0,
        transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.07}deg) scale(0.94)`,
        transition: "opacity 600ms ease, transform 600ms ease",
        cursor: "default",
      };
    }
    return {
      transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.07}deg)`,
      transition: isDragging ? "none" : "transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      cursor: isDragging ? "grabbing" : "grab",
    };
  };

  const likeOpacity = Math.max(0, Math.min(1, dragOffset / SWIPE_THRESHOLD));
  const nopeOpacity = Math.max(0, Math.min(1, -dragOffset / SWIPE_THRESHOLD));

  // ── Loading skeleton ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-80 h-120 bg-white dark:bg-gray-800 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-700 shadow-xl" />
          <p className="text-sm text-gray-400">Loading recipes…</p>
        </div>
      </div>
    );
  }

  // ── All done ───────────────────────────────────────────────────
  if (isDone) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            You've seen them all!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {likedCount > 0
              ? `You liked ${likedCount} recipe${likedCount !== 1 ? "s" : ""} this session`
              : "No recipes liked this session"}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {likedCount > 0 && (
              <button
                onClick={() => setShowLikedPanel(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <HeartIcon className="w-4 h-4" />
                View Liked Recipes
              </button>
            )}
            <button
              onClick={() => { setCurrentIndex(0); setLikedRecipes([]); setRecipes(prev => [...prev].sort(() => Math.random() - 0.5)); }}
              className="px-5 py-2.5 bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white rounded-full text-sm font-medium hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-700"
            >
              Start Over
            </button>
          </div>
          {!user && likedCount > 0 && (
            <p className="mt-6 text-sm text-amber-600 dark:text-amber-400">
              Log in to save liked recipes permanently
            </p>
          )}
        </div>
        {showLikedPanel && (
          <LikedPanel
            recipes={likedRecipes}
            onClose={() => setShowLikedPanel(false)}
            onSelect={setSelectedDetailRecipe}
          />
        )}
        {selectedDetailRecipe && (
          <RecipeDetailModal recipe={selectedDetailRecipe} onClose={() => setSelectedDetailRecipe(null)} />
        )}
      </div>
    );
  }

  // ── Main discover UI ───────────────────────────────────────────
  return (
    <div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center select-none overflow-hidden">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 left-1/2 z-50 px-5 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none
            ${toast.kind === "like" ? "bg-green-500 text-white" : "bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900"}`}
          style={{ animation: "discoverFadeUp 160ms ease", transform: "translateX(-50%)" }}
        >
          {toast.msg}
        </div>
      )}

      <div className="w-full max-w-md px-4 py-8 flex flex-col items-center gap-6">
        {/* Header row */}
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Discover</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {recipes.length - currentIndex} recipe{recipes.length - currentIndex !== 1 ? "s" : ""} left
            </p>
          </div>
          <button
            onClick={() => setShowLikedPanel(true)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              likedCount > 0
                ? "text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                : "text-gray-300 dark:text-gray-600 cursor-default"
            }`}
            disabled={likedCount === 0}
          >
            <HeartIcon className="w-4 h-4" />
            {likedCount} liked
          </button>
        </div>

        {/* Card stack */}
        <div className="relative w-full" style={{ height: "480px" }}>
          {/* Next card peeking behind — full content, blurred until it becomes active */}
          {nextRecipe && (
            <div
              key={nextRecipe.id}
              className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-md"
              style={{
                filter: exitDirection ? "blur(0px)" : "blur(4px)",
                transition: exitDirection ? "filter 600ms ease" : "none",
                zIndex: 1,
              }}
            >
              {nextRecipe.image ? (
                <img src={nextRecipe.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 dark:text-gray-600">🍽</div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
                {nextRecipe.tags && nextRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {nextRecipe.tags.slice(0, 3).map((t) => (
                      <span key={t.id} className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full">
                        {TAG_EMOJIS[t.name] ?? ""} {t.name}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-xl font-bold text-white leading-snug mb-1 line-clamp-2">{nextRecipe.title}</h2>
                {nextRecipe.description && (
                  <p className="text-sm text-white/80 line-clamp-2">{nextRecipe.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Current card */}
          {currentRecipe && (
            <div
              key={currentRecipe.id}
              className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xl"
              style={{ ...cardStyle(), zIndex: 2 }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Recipe image */}
              {currentRecipe.image ? (
                <img
                  src={currentRecipe.image}
                  alt={currentRecipe.title}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-gray-50 dark:bg-gray-700 text-gray-200 dark:text-gray-600 pointer-events-none">
                  🍽
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

              {/* Color overlay — drag tint + full color on exit */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: exitDirection === "right"
                    ? "rgba(74,222,128,0.82)"
                    : exitDirection === "left"
                    ? "rgba(239,68,68,0.82)"
                    : dragOffset > 0
                    ? `rgba(74,222,128,${likeOpacity * 0.38})`
                    : `rgba(239,68,68,${nopeOpacity * 0.38})`,
                  transition: exitDirection ? "none" : isDragging ? "none" : "background 200ms ease",
                  zIndex: 3,
                }}
              />

              {/* Floating hearts on like */}
              {heartParticles.map((p) => (
                <div
                  key={p.id}
                  className="absolute text-2xl pointer-events-none"
                  style={{
                    bottom: "96px",
                    left: `${p.x}%`,
                    animation: "floatHeart 750ms ease forwards",
                    zIndex: 4,
                  }}
                >
                  ❤️
                </div>
              ))}

              {/* LIKE stamp */}
              <div
                className="absolute top-10 left-5 border-4 border-green-400 text-green-400 px-3 py-1 rounded-lg text-2xl font-black uppercase tracking-widest pointer-events-none"
                style={{
                  opacity: likeOpacity,
                  transform: `rotate(-15deg) scale(${0.8 + likeOpacity * 0.3})`,
                  zIndex: 5,
                }}
              >
                LIKE
              </div>

              {/* NOPE stamp */}
              <div
                className="absolute top-10 right-5 border-4 border-red-400 text-red-400 px-3 py-1 rounded-lg text-2xl font-black uppercase tracking-widest pointer-events-none"
                style={{
                  opacity: nopeOpacity,
                  transform: `rotate(15deg) scale(${0.8 + nopeOpacity * 0.3})`,
                  zIndex: 5,
                }}
              >
                NOPE
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none" style={{ zIndex: 2 }}>
                {currentRecipe.tags && currentRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {currentRecipe.tags.slice(0, 3).map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full"
                      >
                        {TAG_EMOJIS[t.name] ?? ""} {t.name}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-xl font-bold text-white leading-snug mb-1 line-clamp-2">
                  {currentRecipe.title}
                </h2>
                {currentRecipe.description && (
                  <p className="text-sm text-white/80 line-clamp-2">{currentRecipe.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 items-center">
          {/* Skip — red */}
          <button
            onClick={() => handleSwipe("left")}
            title="Skip (← key)"
            className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-400 hover:scale-110 active:scale-95 transition-all"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Like — green with pop animation */}
          <button
            onClick={() => handleSwipe("right")}
            title="Like (→ key)"
            className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-400 active:scale-95"
            style={{ animation: likeEffect ? "heartPop 500ms cubic-bezier(0.34, 1.56, 0.64, 1)" : "none" }}
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Swipe right to like · Swipe left to skip · Use ← → arrow keys
        </p>

        {/* Login nudge */}
        {!user && likedCount > 0 && (
          <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-700 dark:text-amber-300 text-center">
            Log in to save your liked recipes permanently!
          </div>
        )}
      </div>

      {/* Liked panel */}
      {showLikedPanel && (
        <LikedPanel
          recipes={likedRecipes}
          onClose={() => setShowLikedPanel(false)}
          onSelect={(r) => { setSelectedDetailRecipe(r); }}
        />
      )}

      {/* Recipe detail modal (above the panel) */}
      {selectedDetailRecipe && (
        <RecipeDetailModal recipe={selectedDetailRecipe} onClose={() => setSelectedDetailRecipe(null)} />
      )}

      <style>{`
        @keyframes discoverFadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes heartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.38); }
          70%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes floatHeart {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-90px) scale(0.4); }
        }
      `}</style>
    </div>
  );
}
