import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ExpandArrow, CloseIcon, WarningIcon } from "../assets";

interface Tag { id: string; name: string; }
interface Ingredient { id: string; recipe_id: string; info: string; }
interface Recipe {
  id: string; title: string; description: string;
  created_at: string; image: string | null; tags?: Tag[];
}

const TAG_EMOJIS: Record<string, string> = {
  Meat: "🥩", Salad: "🥗", Vegetarian: "🥦", Seafood: "🐟",
  Pasta: "🍝", Soup: "🍲", Dessert: "🍰", Breakfast: "🍳",
  Pizza: "🍕", Vegan: "🌱", Spicy: "🌶️", Quick: "⚡",
};

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:3001";
const api = (path: string) => `${API_BASE}/api${path}`;

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
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10
       dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="aspect-4/3 overflow-hidden relative bg-gray-50 dark:bg-gray-700">
        {recipe.image && !imgError ? (
          <img src={recipe.image} alt={recipe.title}
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
        <div className="mt-4 flex items-center gap-1 text-xs text-gray-300 group-hover:text-gray-900 transition-colors duration-200 dark:text-gray-500 dark:group-hover:text-white">
          <span className="uppercase tracking-widest font-medium">View recipe</span>
          <ExpandArrow className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function RecipeModal({ recipe, onClose, onDelete, onSave }: { recipe: Recipe; onClose: () => void; onDelete?: () => void; onSave?: (update: { title: string; description: string; ingredients: string[]; selectedTags: string[]; image?: File }) => Promise<void> }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingIng, setLoadingIng] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(recipe.title);
  const [editDescription, setEditDescription] = useState(recipe.description ?? "");
  const [editIngredients, setEditIngredients] = useState<string>("");
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>(recipe.tags?.map((t) => t.id) ?? []);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    document.body.style.overflow = "hidden";
    fetch(api(`/recipes/${recipe.id}/ingredients`))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data) => {
        setIngredients(data);
        setLoadingIng(false);
        setEditIngredients(data.map((i: Ingredient) => i.info).join("\n"));
      });
    fetch(api(`/tags`))
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((data) => setAvailableTags(data));
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [recipe.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setEditing(false);
    setEditTitle(recipe.title);
    setEditDescription(recipe.description ?? "");
    setEditSelectedTags(recipe.tags?.map((t) => t.id) ?? []);
    setEditImage(null);
    setImagePreview(null);
  }, [recipe]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSave = async () => {
    if (!onSave) return;
    await onSave({
      title: editTitle,
      description: editDescription,
      ingredients: editIngredients
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      selectedTags: editSelectedTags,
      image: editImage || undefined,
    });
    setEditing(false);
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
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all
         dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white">
          <CloseIcon className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this recipe?")) {
                onDelete();
              }
            }}
            className="absolute top-4 right-16 z-10 px-3 py-1.5 text-xs font-medium rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-all
             dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-300 dark:hover:text-red-200"
          >
            Delete
          </button>
        )}

        <div className="aspect-16/7 overflow-hidden rounded-t-2xl bg-gray-50 dark:bg-gray-700 relative group">
          {editing ? (
            <label className="w-full h-full flex items-center justify-center cursor-pointer relative">
              {imagePreview ? (
                <img src={imagePreview} alt={recipe.title} className="w-full h-full object-cover" />
              ) : recipe.image && !imgError ? (
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 dark:text-gray-500">🍽</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditImage(file);
                    const reader = new FileReader();
                    reader.onload = (event) => setImagePreview(event.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition opacity-0 hover:opacity-100">
                <div className="text-center text-white">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm">Click to change image</p>
                </div>
              </div>
            </label>
          ) : recipe.image && !imgError ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200 dark:text-gray-500">🍽</div>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
            <div className="flex-1">
              {editing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-semibold text-gray-900 leading-tight mb-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              ) : (
                <h2 className="text-2xl font-semibold text-gray-900 leading-tight mb-1 dark:text-white">{recipe.title}</h2>
              )}
              {recipe.created_at && (
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-5 dark:text-gray-300">
                  {new Date(recipe.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-900 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-900 transition dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-200 dark:hover:text-white"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 mb-5 dark:bg-gray-700" />

          {editing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full text-sm text-gray-500 leading-relaxed mb-6 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              rows={4}
              placeholder="Add a description..."
            />
          ) : (
            recipe.description && (
              <p className="text-gray-500 leading-relaxed mb-6 text-sm dark:text-gray-200">{recipe.description}</p>
            )
          )}

          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-3 dark:text-gray-300">
            <span>Ingredients</span>
            <span className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </h4>

          {editing ? (
            <textarea
              value={editIngredients}
              onChange={(e) => setEditIngredients(e.target.value)}
              className="w-full text-sm text-gray-500 leading-relaxed mb-4 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              rows={6}
              placeholder="Enter one ingredient per line"
            />
          ) : loadingIng ? (
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

          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 mt-6 flex items-center gap-3 dark:text-gray-300">
            <span>Tags</span>
            <span className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </h4>

          {editing ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setEditSelectedTags((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                    editSelectedTags.includes(tag.id)
                      ? "bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {TAG_EMOJIS[tag.name] ? `${TAG_EMOJIS[tag.name]} ` : ""}{tag.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recipe.tags && recipe.tags.length > 0 ? (
                recipe.tags.map((tag) => (
                  <span key={tag.id} className="text-[11px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full dark:text-gray-300 dark:bg-gray-700">
                    {TAG_EMOJIS[tag.name] ? `${TAG_EMOJIS[tag.name]} ` : ""}{tag.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic dark:text-gray-300">No tags.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
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

  // Auto-open modal when ?open=id is set (from nav search click)
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

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(api(`/recipes/${recipeId}`), {
        method: 'DELETE',
      });
      if (response.ok) {
        setRecipes(recipes.filter(r => r.id !== recipeId));
        setSelected(null);
      } else {
        alert('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Error deleting recipe');
    }
  };

  const handleUpdateRecipe = async (recipeId: string, update: { title: string; description: string; ingredients: string[]; selectedTags: string[]; image?: File }) => {
    try {
      let options: RequestInit;

      if (update.image) {
        const formData = new FormData();
        formData.append('title', update.title);
        formData.append('description', update.description);
        update.ingredients.forEach((ing) => {
          formData.append('ingredients', ing);
        });
        update.selectedTags.forEach((tag) => {
          formData.append('selectedTags', tag);
        });
        formData.append('image', update.image);

        options = {
          method: 'PUT',
          body: formData,
        };
      } else {
        options = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        };
      }

      const response = await fetch(api(`/recipes/${recipeId}`), options);
      if (!response.ok) {
        alert('Failed to update recipe');
        return;
      }
      const updated = await response.json();
      setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelected(updated);
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Error updating recipe');
    }
  };

  const filtered = recipes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    const matchTag = activeTags.length === 0 || activeTags.every((tagId) => r.tags?.some((t) => t.id === tagId));
    return matchSearch && matchTag;
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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-4 dark:bg-gray-800">🍃</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 dark:text-white">No recipes found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-300">
              {search || activeTags.length > 0 ? "Try changing your search or filters" : "No recipes have been added yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </div>

      {selected && <RecipeModal recipe={selected} onClose={handleCloseModal} onDelete={() => handleDeleteRecipe(selected.id)} onSave={(update) => handleUpdateRecipe(selected.id, update)} />}
    </div>
  );
}
