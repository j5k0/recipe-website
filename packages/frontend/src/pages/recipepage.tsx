import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CloseIcon, WarningIcon } from "../assets";
import { RecipeImageGallery } from "../components/RecipeImageGallery";
import { SortDropdown, type SortOption } from "../components/sortdropdown";
import ShareRecipeForm from "../components/sharerecipe";
import { useAuth } from "../AuthContext";
import { getPrimaryRecipeImage, getRecipeImages } from "../utils/recipeImages";

interface Tag { id: string; name: string; }
interface Ingredient { id: string; recipe_id: string; info: string; }
interface RecipeReview {
  id: string;
  recipe_id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
interface Recipe {
  id: string; title: string; description: string;
  created_at: string; image: string | null; images?: string[]; tags?: Tag[];
  average_rating?: number | null;
  author_id?: string;
  author_name?: string;
  author_avatar_url?: string | null;
  upvote_count?: number;
}
interface UpvoteSummary { vote_count: number; user_vote: number; has_upvoted: boolean; has_downvoted: boolean; }

const TAG_EMOJIS: Record<string, string> = {
  Meat: "🥩", Salad: "🥗", Vegetarian: "🥦", Seafood: "🐟",
  Pasta: "🍝", Soup: "🍲", Dessert: "🍰", Breakfast: "🍳",
  Pizza: "🍕", Vegan: "🌱", Spicy: "🌶️", Quick: "⚡",
};

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:3001";
const api = (path: string) => `${API_BASE}/api${path}`;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_RECIPE_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
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
        <div className="h-4 bg-gray-100 rounded w-2/3 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onClick, index }: { recipe: Recipe; onClick: () => void; index: number }) {
  const [imgError, setImgError] = useState(false);
  const primaryImage = getPrimaryRecipeImage(recipe);
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10
       dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden relative bg-gray-50 dark:bg-gray-700">
        {primaryImage && !imgError ? (
          <img src={primaryImage} alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200 dark:text-gray-500">🍽</div>
        )}
        {recipe.created_at && (
          <span className="absolute top-3 right-3 text-xs bg-white/90 text-gray-500 px-2 py-0.5 rounded-full shadow-sm dark:bg-gray-900/90 dark:text-gray-300">
            {timeAgo(recipe.created_at)}
          </span>
        )}
      </div>
      <div className="p-5">
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.slice(0, 3).map((t) => (
              <span key={t.id} className="text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full dark:text-gray-300 dark:bg-gray-700">
                {TAG_EMOJIS[t.name] ? `${TAG_EMOJIS[t.name]} ` : ""}{t.name}
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
              <img src={recipe.author_avatar_url} alt={recipe.author_name || "Author"}
                className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500">
                {recipe.author_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {recipe.author_name || "Unknown"}
            </span>
          </div>
          {recipe.average_rating !== undefined && recipe.average_rating !== null && recipe.average_rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <span className="text-sm">★</span>
              <span className="font-medium">{Number(recipe.average_rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function RecipeModal({ recipe, onClose, onRecipeUpdate, onRecipeDelete }: { recipe: Recipe; onClose: () => void; onRecipeUpdate: (updated: Recipe) => void; onRecipeDelete: (id: string) => void }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [reviews, setReviews] = useState<RecipeReview[]>([]);
  const [loadingIng, setLoadingIng] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(recipe.title);
  const [editDescription, setEditDescription] = useState(recipe.description);
  const [editIngredients, setEditIngredients] = useState("");
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(recipe.upvote_count ?? 0);
  const [userVote, setUserVote] = useState<0 | 1 | -1>(0);
  const [loadingVote, setLoadingVote] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const { user } = useAuth();
  const hasUpvoted = userVote === 1;
  const hasDownvoted = userVote === -1;

  const isAuthor = user && recipe.author_id && user.unique_id === recipe.author_id;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";

    fetch(api(`/recipes/${recipe.id}/ingredients`))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data) => {
        setIngredients(data);
        setEditIngredients(data.map((ing: Ingredient) => ing.info).join("\n"));
        setLoadingIng(false);
      });

    fetch(api(`/recipes/${recipe.id}/reviews`))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data) => {
        setReviews(data);
        setLoadingReviews(false);
      });

    fetch(api("/tags"))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data) => {
        setAvailableTags(data);
        if (recipe.tags) {
          setEditSelectedTags(recipe.tags.map(t => t.id));
        }
      });

    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [recipe.id]);

  useEffect(() => {
    let cancelled = false;
    setUpvoteCount(recipe.upvote_count ?? 0);
    setUserVote(0);
    setLoadingVote(true);

    fetch(api(`/recipes/${recipe.id}/upvote`), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((data: UpvoteSummary | null) => {
        if (cancelled || !data) return;
        setUpvoteCount(data.vote_count);
        setUserVote(data.user_vote as 0 | 1 | -1);
      })
      .finally(() => {
        if (!cancelled) setLoadingVote(false);
      });

    return () => { cancelled = true; };
  }, [recipe.id, user?.email]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const readImagePreview = (file: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    if (files.length > MAX_RECIPE_IMAGES) {
      e.target.value = "";
      alert(`You can upload up to ${MAX_RECIPE_IMAGES} recipe images.`);
      return;
    }

    const invalidType = files.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      e.target.value = "";
      alert("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    const oversized = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      e.target.value = "";
      alert("Image is too large. Maximum size is 5MB.");
      return;
    }

    const previews = await Promise.all(files.map(readImagePreview));
    setEditImages(files);
    setImagePreviews(previews);
    e.target.value = "";
  };

  const handleSaveRecipe = async () => {
    if (savingRecipe) return;

    try {
      setSavingRecipe(true);
      const formData = new FormData();
      formData.append("title", editTitle);
      formData.append("description", editDescription);

      const ingredientsList = editIngredients.split("\n").filter(i => i.trim());
      ingredientsList.forEach(ing => formData.append("ingredients", ing));

      const selectedTagNames = availableTags
        .filter(tag => editSelectedTags.includes(tag.id))
        .map(tag => tag.name);
      selectedTagNames.forEach(tag => formData.append("selectedTags", tag));

      editImages.forEach((image) => formData.append("images", image));

      const response = await fetch(api(`/recipes/${recipe.id}`), {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update recipe");
      }


      const updatedRecipe = await response.json();
      onRecipeUpdate(updatedRecipe);
      setEditing(false);
      setEditImages([]);
      setImagePreviews([]);
    } catch (err) {
      console.error("Error saving recipe:", err);
      alert(err instanceof Error ? err.message : "Failed to save recipe");
    } finally {
      setSavingRecipe(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (deletingRecipe) return;

    try {
      setDeletingRecipe(true);
      const response = await fetch(api(`/recipes/${recipe.id}`), {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete recipe");

      setShowDeleteConfirm(false);
      onRecipeDelete(recipe.id);
      handleClose();
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe");
    } finally {
      setDeletingRecipe(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditTitle(recipe.title);
    setEditDescription(recipe.description);
    setEditIngredients(ingredients.map(ing => ing.info).join("\n"));
    setEditImages([]);
    setImagePreviews([]);
    if (recipe.tags) {
      setEditSelectedTags(recipe.tags.map(t => t.id));
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      alert("Please log in to add a review.");
      return;
    }

    const trimmedComment = newReviewComment.trim();
    if (!trimmedComment) {
      alert("Review comment cannot be empty.");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(api(`/recipes/${recipe.id}/reviews`), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: newReviewRating,
          comment: trimmedComment,
        }),
      });

      if (!response.ok) throw new Error("Failed to add review");

      const createdReview: RecipeReview = await response.json();
      setReviews((prev) => [createdReview, ...prev]);
      setNewReviewComment("");
      setNewReviewRating(5);
    } catch (err) {
      console.error("Error adding review:", err);
      alert("Failed to add review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVote = async (voteValue: 1 | -1 | 0) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (submittingVote) return;
    if ((voteValue === 1 && userVote === 1) || (voteValue === -1 && userVote === -1)) {
      voteValue = 0;
    }

    try {
      setSubmittingVote(true);
      const response = await fetch(api(`/recipes/${recipe.id}/vote`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote_value: voteValue }),
      });

      if (!response.ok) throw new Error("Failed to submit vote");

      const data: UpvoteSummary = await response.json();
      setUpvoteCount(data.vote_count);
      setUserVote(data.user_vote as 0 | 1 | -1);
      onRecipeUpdate({ ...recipe, upvote_count: data.vote_count });
    } catch (err) {
      console.error("Error submitting vote:", err);
      alert("Failed to submit vote");
    } finally {
      setSubmittingVote(false);
    }
  };

  const currentImages = imagePreviews.length > 0 ? imagePreviews : getRecipeImages(recipe);
  const currentImage = currentImages[0] ?? null;

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
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {isAuthor ?
              editing ? null : (
            <>
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600">
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deletingRecipe}
                className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-red-500 dark:hover:bg-red-600"
              >
                {deletingRecipe ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : null}
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white">
                <CloseIcon className="w-4 h-4" />
              </button>
        </div>

        {showDeleteConfirm && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 rounded-2xl bg-black/45 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <WarningIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Delete recipe</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-300">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                <span className="font-medium text-gray-900 dark:text-white">{recipe.title}</span> will be permanently removed from your recipes.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingRecipe}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecipe}
                  disabled={deletingRecipe}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
                >
                  {deletingRecipe ? "Deleting..." : "Confirm delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showLoginPrompt && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 rounded-2xl bg-black/45 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Log in required</h2>
                  <p className="text-xs text-gray-400 dark:text-gray-300">Sign in to vote on recipes</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
                Please log in to your account to vote on this recipe.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    handleClose();
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Go to login
                </button>
              </div>
            </div>
          </div>
        )}

        {editing ? (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-16/7 overflow-hidden rounded-t-2xl bg-gray-50 dark:bg-gray-700 w-full hover:opacity-80 transition-opacity cursor-pointer relative"
            >
              {currentImage ? (
                <img src={currentImage} alt={editTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 dark:text-gray-500">🍽</div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Click to change image</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="p-8">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-semibold text-gray-900 mb-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Recipe title"
              />

              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-5 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                placeholder="Recipe description"
                rows={3}
              />

              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-300">Tags</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setEditSelectedTags(prev =>
                      prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                    )}
                    className={`text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full transition-colors ${
                      editSelectedTags.includes(tag.id)
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {TAG_EMOJIS[tag.name] ? `${TAG_EMOJIS[tag.name]} ` : ""}{tag.name}
                  </button>
                ))}
              </div>

              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 dark:text-gray-300">Ingredients</h4>
              <textarea
                value={editIngredients}
                onChange={(e) => setEditIngredients(e.target.value)}
                className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-6 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                placeholder="Each ingredient on a new line"
                rows={6}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSaveRecipe}
                  disabled={savingRecipe}
                  className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {savingRecipe ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={savingRecipe}
                  className="flex-1 bg-gray-100 text-gray-900 font-medium py-2 rounded-lg hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
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
                  {recipe.tags.map((t) => (
                    <span key={t.id} className="text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full dark:text-gray-300 dark:bg-gray-700">
                      {TAG_EMOJIS[t.name] ? `${TAG_EMOJIS[t.name]} ` : ""}{t.name}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="text-2xl font-semibold text-gray-900 leading-tight mb-1 dark:text-white">{recipe.title}</h2>
              
              {/* Author info */}
              <div className="flex items-center gap-2 mb-4">
                {recipe.author_avatar_url ? (
                  <img src={recipe.author_avatar_url} alt={recipe.author_name || "Author"}
                    className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-500">
                    {recipe.author_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {recipe.author_name || "Unknown"}
                  </p>
                  {recipe.created_at && (
                    <p className="text-xs text-gray-400 dark:text-gray-300">
                      {new Date(recipe.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                {recipe.created_at && (
                  <p className="text-xs text-gray-400 uppercase tracking-wider dark:text-gray-300">
                    {new Date(recipe.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleVote(1)}
                    disabled={loadingVote || submittingVote}
                    aria-pressed={hasUpvoted}
                    title={hasUpvoted ? "Remove upvote" : "Upvote recipe"}
                    className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                      hasUpvoted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <div className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                    <span className="tabular-nums">{upvoteCount}</span>
                    <span>{loadingVote ? "Loading votes..." : hasUpvoted ? "Upvoted" : hasDownvoted ? "Downvoted" : "Vote"}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVote(-1)}
                    disabled={loadingVote || submittingVote}
                    aria-pressed={hasDownvoted}
                    title={hasDownvoted ? "Remove downvote" : "Downvote recipe"}
                    className={`inline-flex h-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                      hasDownvoted
                        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-9 bg-gray-50 rounded-lg animate-pulse dark:bg-gray-700" />)}
                </div>
              ) : ingredients.length === 0 ? (
                <p className="text-gray-400 text-sm italic dark:text-gray-300">No ingredients listed.</p>
              ) : (
                <ul className="space-y-1.5">
                  {ingredients.map((ing, i) => (
                    <li key={ing.id}
                      className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-2.5 rounded-xl text-sm text-gray-600
                       dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
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

              <h4 className="text-xs uppercase tracking-widest text-gray-400 mt-8 mb-3 flex items-center gap-3 dark:text-gray-300">
                <span>Reviews</span>
                <span className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
              </h4>

              {user ? (
                <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="text-sm text-gray-600 dark:text-gray-200">Rating:</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="text-sm rounded-lg border border-gray-200 px-2 py-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} star{rating > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Share your thoughts about this recipe..."
                    className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    {submittingReview ? "Submitting..." : "Add Review"}
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic mb-5 dark:text-gray-300">
                  Log in to write a review.
                </p>
              )}

              {loadingReviews ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse dark:bg-gray-700" />)}
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-400 text-sm italic dark:text-gray-300">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:bg-gray-700 dark:border-gray-600">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{review.reviewer_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-300">
                          {new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <p className="text-sm text-amber-500 mb-2">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-200">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const activeTags = searchParams.getAll("tag");
  const openId = searchParams.get("open");

  useEffect(() => {
    fetch(api("/recipes"))
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(setRecipes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (openId && recipes.length > 0) {
      const recipe = recipes.find((r) => r.id === openId);
      if (recipe) setSelected(recipe);
    }
  }, [openId, recipes]);

  const handleCloseModal = () => {
    setSelected(null);
    const next = new URLSearchParams(searchParams);
    next.delete("open");
    setSearchParams(next, { replace: true });
  };

  const handleRecipeUpdate = (updated: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelected(updated);
  };

  const handleRecipeDelete = (recipeId: string) => {
    setRecipes(prev => prev.filter(r => r.id !== recipeId));
    handleCloseModal();
  };

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    const matchTag = activeTags.length === 0 || activeTags.every((tagId) => r.tags?.some((t) => t.id === tagId));
    return matchSearch && matchTag;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "date-asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "reviews-desc":
        const ratingA = a.average_rating ?? -1;
        const ratingB = b.average_rating ?? -1;
        return ratingB - ratingA;
      case "reviews-asc":
        const ratingC = a.average_rating ?? -1;
        const ratingD = b.average_rating ?? -1;
        return ratingC - ratingD;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16 dark:bg-gray-900">
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            <WarningIcon className="w-4 h-4 shrink-0" />
            Cannot connect to backend — {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {loading ? "Recipes" : `${sorted.length} Recipe${sorted.length !== 1 ? "s" : ""}`}
          </h2>
          {!loading && sorted.length > 0 && (
            <SortDropdown value={sortBy} onChange={setSortBy} />
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-4 dark:bg-gray-800">🍃</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 dark:text-white">No recipes found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-300">
              {search || activeTags.length > 0 ? "Try changing your search or filters" : "No recipes have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </div>

      {selected && <RecipeModal recipe={selected} onClose={handleCloseModal} onRecipeUpdate={handleRecipeUpdate} onRecipeDelete={handleRecipeDelete} />}
      <ShareRecipeForm />
    </div>
  );
}
