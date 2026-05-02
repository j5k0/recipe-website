-- Run this migration to enable multiple images per recipe.
-- Execute once against your PostgreSQL database.
-- Keep recipes.image as the primary image for existing code and compatibility.

CREATE TABLE IF NOT EXISTS recipe_images (
  recipe_id  UUID NOT NULL,
  image_url  TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (recipe_id, image_url),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

INSERT INTO recipe_images (recipe_id, image_url, sort_order)
SELECT id, image, 0
FROM recipes
WHERE image IS NOT NULL
ON CONFLICT DO NOTHING;
