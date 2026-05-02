import { pool } from "./pool";
import { Recipe } from "./types";

export async function likeRecipe(userEmail: string, recipeId: string): Promise<void> {
  await pool.query(
    `INSERT INTO user_favorites (user_email, recipe_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userEmail, recipeId]
  );
}

export async function unlikeRecipe(userEmail: string, recipeId: string): Promise<void> {
  await pool.query(
    `DELETE FROM user_favorites WHERE user_email = $1 AND recipe_id = $2`,
    [userEmail, recipeId]
  );
}

export async function getUserLikedRecipes(userEmail: string): Promise<Recipe[]> {
  const { rows } = await pool.query<Recipe>(
    `SELECT
      r.*,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name))
        FILTER (WHERE t.id IS NOT NULL), '[]'
      ) AS tags,
      COALESCE(
        (
          SELECT array_agg(ri.image_url ORDER BY ri.sort_order)
          FROM recipe_images ri
          WHERE ri.recipe_id = r.id
        ),
        CASE
          WHEN r.image IS NOT NULL THEN ARRAY[r.image]::text[]
          ELSE ARRAY[]::text[]
        END
      ) AS images
    FROM recipes r
    JOIN user_favorites uf ON uf.recipe_id = r.id
    LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
    LEFT JOIN tags t ON t.id = rt.tag_id
    WHERE uf.user_email = $1
    GROUP BY r.id
    ORDER BY uf.created_at DESC`,
    [userEmail]
  );
  return rows;
}
