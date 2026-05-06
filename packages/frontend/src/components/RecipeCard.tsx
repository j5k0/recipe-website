import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getPrimaryRecipeImage } from "../utils/recipeImages";
import { useLanguage } from "../i18n/LanguageContext";

export interface Recipe {
  id: string;
  title: string;
  description: string;
  created_at: string;
  image: string | null;
  images?: string[];
  tags?: { id: string; name: string }[];
  average_rating?: number | null;
  author_id?: string;
  author_name?: string;
  author_avatar_url?: string | null;
  upvote_count?: number;
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

export function RecipeCard({ recipe, onClick, index }: { recipe: Recipe; onClick: () => void; index: number }) {
  const [imgError, setImgError] = useState(false);
  const { t, tTag } = useLanguage();
  const primaryImage = getPrimaryRecipeImage(recipe);
  const voteScore = recipe.upvote_count ?? 0;
  const VoteScoreIcon = voteScore < 0 ? ChevronDown : ChevronUp;
  const voteScoreTone =
    voteScore > 0
      ? "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
      : voteScore < 0
      ? "border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
      : "border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-700/60 dark:text-gray-300";

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden relative bg-gray-50 dark:bg-gray-700">
        {primaryImage && !imgError ? (
          <img src={primaryImage} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
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
        <div className="mt-4 flex items-center gap-2">
          <div className="mr-auto flex min-w-0 items-center gap-2">
            {recipe.author_avatar_url ? (
              <img src={recipe.author_avatar_url} alt={recipe.author_name || t("recipes.unknown")} className="w-6 h-6 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500">
                {recipe.author_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
              {recipe.author_name || t("recipes.unknown")}
            </span>
          </div>
          <div className={`inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-semibold ${voteScoreTone}`} title={`${t("recipes.vote")}: ${voteScore}`} aria-label={`${t("recipes.vote")}: ${voteScore}`}>
            <VoteScoreIcon className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="tabular-nums">{voteScore}</span>
          </div>
          {recipe.average_rating !== undefined && recipe.average_rating !== null && recipe.average_rating > 0 && (
            <div className="flex shrink-0 items-center gap-1 text-xs text-amber-500">
              <span className="text-sm">★</span>
              <span className="font-medium">{Number(recipe.average_rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
