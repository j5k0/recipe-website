export type RecipeWithImages = {
  image?: string | null;
  images?: string[] | null;
};

export function getRecipeImages(recipe: RecipeWithImages): string[] {
  if (Array.isArray(recipe.images) && recipe.images.length > 0) {
    return recipe.images.filter((image): image is string => Boolean(image));
  }

  return recipe.image ? [recipe.image] : [];
}

export function getPrimaryRecipeImage(recipe: RecipeWithImages): string | null {
  return getRecipeImages(recipe)[0] ?? null;
}
