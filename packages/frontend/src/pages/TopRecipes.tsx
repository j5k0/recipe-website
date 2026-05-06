import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeCard, type Recipe } from "../components/RecipeCard";
import { useLanguage } from "../i18n/LanguageContext";
import { SortDropdown, type SortOption } from "../components/sortdropdown";

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:3001";
const api = (path: string) => `${API_BASE}/api${path}`;

type SortKey = "rating" | "votes";

export default function TopRecipes() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("rating");

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(api("/recipes"));
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Recipe[] = await res.json();
      setRecipes(data);
    } catch {
      setError(t("recipes.cannotConnect"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const sorted = [...recipes].sort((a, b) => {
    if (sortBy === "rating") {
      const ra = a.average_rating ?? 0;
      const rb = b.average_rating ?? 0;
      return rb - ra || (b.upvote_count ?? 0) - (a.upvote_count ?? 0);
    }
    return (b.upvote_count ?? 0) - (a.upvote_count ?? 0);
  });

  const topRecipes = sorted.slice(0, 20);

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipes?open=${recipe.id}`);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value === "reviews-desc" ? "rating" : "votes");
  };

  const topRecipeOptions = [
    { value: "reviews-desc" as SortOption, label: t("topRecipes.sortByRating") },
    { value: "votes-desc" as SortOption, label: t("topRecipes.sortByVotes") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("topRecipes.title")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {t("topRecipes.subtitle")}
            </p>
          </div>
          <SortDropdown 
            value={sortBy === "rating" ? "reviews-desc" : "votes-desc"} 
            onChange={handleSortChange}
            options={topRecipeOptions}
          />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse dark:bg-gray-800 dark:border-gray-700">
                <div className="aspect-4/3 bg-gray-100 dark:bg-gray-700" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4 dark:bg-gray-700" />
                  <div className="h-4 bg-gray-100 rounded w-full dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-center text-gray-500 dark:text-gray-400 py-12">{error}</p>}

        {!loading && !error && topRecipes.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">{t("recipes.noFound")}</p>
        )}

        {!loading && !error && topRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {topRecipes.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} onClick={() => handleRecipeClick(r)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
