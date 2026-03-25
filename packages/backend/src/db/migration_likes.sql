-- Run this migration to enable the Food Discover / liked recipes feature.
-- Execute once against your PostgreSQL database.

CREATE TABLE IF NOT EXISTS user_favorites (
  user_email TEXT NOT NULL,
  recipe_id  UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_email, recipe_id),
  FOREIGN KEY (user_email) REFERENCES users(email)   ON DELETE CASCADE,
  FOREIGN KEY (recipe_id)  REFERENCES recipes(id)    ON DELETE CASCADE
);

-- If recipes.id is not UUID (e.g. BIGINT/SERIAL), change the column type above to match.
