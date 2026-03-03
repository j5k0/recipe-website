import { useState, useRef } from "react";

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
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // FormData object to send multipart/form-data (needed for file uploads)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    ingredients.forEach(i => formData.append("ingredients", i));
    selectedTags.forEach(t => formData.append("selectedTags", t));

    if (fileInputRef.current?.files?.[0]){
      formData.append("image", fileInputRef.current.files[0]);
    }

    // Send the FormData to the backend
    const response = await fetch(
      import.meta.env.VITE_BACKEND_URL + "/api/recipes",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Failed to submit");
    setSubmitted(true);
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Share Your Recipe
          </h2>
          <p className="text-gray-500">
            Have a delicious recipe? Share it with our community!
          </p>
        </div>

        {submitted && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
            🎉 Recipe submitted successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              {/* Upload icon */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Start Sharing
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipe Image
                </label>
                <div className="flex gap-4">
                  {imagePreview && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 text-sm"
                  >
                    <svg
                      className="w-8 h-8 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Image will be automatically resized to fit
                </p>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="recipe-title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Recipe Title
                </label>
                <input
                  id="recipe-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder="My Amazing Recipe"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="recipe-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="recipe-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 resize-none text-gray-900 placeholder:text-gray-400 transition-all"
                  placeholder="Tell us about your recipe..."
                  required
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 text-gray-900 placeholder:text-gray-400 transition-all"
                        placeholder="e.g., 2 cups flour"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="mt-2 text-sm text-gray-900 hover:text-gray-600 flex items-center gap-1 transition-colors"
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Ingredient
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400 font-normal">
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
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
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
                  className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Submit Recipe
                </button>
                <button
                  type="button"
                  onClick={() => {
                      setIsExpanded(false);
                  }}
                  className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
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
