import { useState, useRef } from "react";
import { UploadIcon, CloseIcon, ImageIcon, AddIcon } from "../assets";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_RECIPE_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const API_BASE =
  (import.meta as any).env?.VITE_BACKEND_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";



const TAGS = [
  { label: "Meat", emoji: "🥩" },
  { label: "Salad", emoji: "🥗" },
  { label: "Vegetarian", emoji: "🥦" },
  { label: "Seafood", emoji: "🐟" },
  { label: "Pasta", emoji: "🍝" },
  { label: "Soup", emoji: "🍲" },
  { label: "Dessert", emoji: "🍰" },
  { label: "Breakfast", emoji: "🍳" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Vegan", emoji: "🌱" },
  { label: "Spicy", emoji: "🌶️" },
  { label: "Quick", emoji: "⚡" },
];

export default function ShareRecipeForm() {
  const [title, setTitle] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label],
    );
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);

  const removeIngredient = (index: number) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  const updateIngredient = (index: number, value: string) => {
    const next = [...ingredients];
    next[index] = value;
    setIngredients(next);
  };

  const readImagePreview = (file: File) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSubmitError(null);

    if (files.length === 0) return;

    if (imageFiles.length + files.length > MAX_RECIPE_IMAGES) {
      e.target.value = "";
      setSubmitError(`You can upload up to ${MAX_RECIPE_IMAGES} recipe images.`);
      return;
    }

    const invalidType = files.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type));
    if (invalidType) {
      e.target.value = "";
      setSubmitError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    const oversized = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      e.target.value = "";
      setSubmitError("Image is too large. Maximum size is 5MB.");
      return;
    }

    const previews = await Promise.all(files.map(readImagePreview));
    setImageFiles((current) => [...current, ...files]);
    setImagePreviews((current) => [...current, ...previews]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((current) => current.filter((_, i) => i !== index));
    setImagePreviews((current) => current.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    ingredients.forEach((i) => formData.append("ingredients", i));
    selectedTags.forEach((t) => formData.append("selectedTags", t));

    imageFiles.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(API_BASE + "/api/recipes", {
       method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit recipe");
      }

      setSubmitted(true);
      setSubmitError(null);
      setTitle("");
      setDescription("");
      setIngredients([""]);
      setSelectedTags([]);
      setImageFiles([]);
      setImagePreviews([]);
    }   catch (err) {
      setSubmitted(false);
      setSubmitError(err instanceof Error ? err.message : "Failed to submit recipe");
    }
  };

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2 dark:text-white">
            Share Your Recipe
          </h2>
          <p className="text-gray-500 dark:text-gray-300 dark:text-gray-300">
            Have a delicious recipe? Share it with our community!
          </p>
        </div>

        {submitted && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center dark:bg-green-950/40 dark:border-green-900 dark:text-green-300">
            🎉 Recipe submitted successfully!
          </div>
        )}

        {submitError && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            {submitError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8 dark:bg-gray-800 dark:border dark:border-gray-700">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium
               dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <UploadIcon className="w-5 h-5" />
              Start Sharing
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Recipe Image
                </label>
                <div className="flex gap-4">
                  {imagePreviews.length > 0 && (
                    <div className="grid max-w-[18rem] grid-cols-2 gap-2 shrink-0">
                      {imagePreviews.map((preview, index) => (
                        <div key={preview} className="relative h-32 w-32 overflow-hidden rounded-lg">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                            aria-label="Remove image"
                          >
                            <CloseIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 text-sm
                     dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:bg-gray-900"
                  >
                  <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-400" />
                    {imagePreviews.length > 0 ? "Add Images" : "Upload Images"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-300">
                  Allowed: JPG, PNG, WEBP. Maximum size: 5MB each. Up to {MAX_RECIPE_IMAGES} images.
                </p>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="recipe-title"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                >
                  Recipe Title
                </label>
                <input
                  id="recipe-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 bg-white text-gray-900 placeholder:text-gray-400 transition-all
                   dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  placeholder="My Amazing Recipe"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="recipe-description"
                  className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="recipe-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none bg-white text-gray-900 placeholder:text-gray-400 transition-all
                   dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                  placeholder="Tell us about your recipe..."
                  required
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                  Ingredients
                </label>
                <div className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) =>
                          updateIngredient(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 text-gray-900 placeholder:text-gray-400 transition-all
                         dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500"
                        placeholder="e.g., 2 cups flour"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors dark:text-gray-400 dark:hover:text-red-400"
                        >
                        <CloseIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-2 text-sm text-gray-900 hover:text-gray-600 flex items-center gap-1 transition-colors dark:text-white dark:hover:text-gray-300"
                >
                <AddIcon className="w-4 h-4" />
                  Add Ingredient
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400 font-normal dark:text-gray-400">
                      {selectedTags.length} selected
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map(({ label, emoji }) => {
                    const active = selectedTags.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleTag(label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                          active
                            ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-400"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Submit Recipe
                </button>
                <button
                  type="button"
                  onClick={() => {
                      setIsExpanded(false);
                  }}
                  className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700 dark:text-gray-300
                   dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
