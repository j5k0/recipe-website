import { pool } from "./pool";
import { Recipe } from "./types";

export async function createRecipe(input: {
  title: string;
  description: string;
  ingredients: string[];
  selectedTags: string[];
}): Promise<Recipe> {
  const { rows } = await pool.query<Recipe>(
    `WITH new_recipe AS (
            INSERT INTO recipes (title, description) VALUES ($1, $2) RETURNING id
        ),
        insert_ingredients AS (
            INSERT INTO ingredients (recipe_id, info) SELECT new_recipe.id, unnest($3::text[]) FROM new_recipe
        )
        INSERT INTO recipe_tags (recipe_id, tag_id) SELECT new_recipe.id, tags.id FROM new_recipe JOIN tags ON tags.name = ANY($4::text[]);`,
    [input.title, input.description, input.ingredients, input.selectedTags],
  );
  return rows[0];
}

// ── Naujos funkcijos ──────────────────────────────────────────────

export async function getAllRecipes(): Promise<Recipe[]> {
  const { rows } = await pool.query<Recipe>(`
        SELECT 
            r.*,
            COALESCE(
                json_agg(json_build_object('id', t.id, 'name', t.name))
                FILTER (WHERE t.id IS NOT NULL), '[]'
            ) AS tags
        FROM recipes r
        LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
    `);
  return rows;
}

export async function getRecipeIngredients(recipeId: string) {
  const { rows } = await pool.query(
    `SELECT * FROM ingredients WHERE recipe_id = $1`,
    [recipeId],
  );
  return rows;
}

export async function getAllTags() {
  const { rows } = await pool.query(`SELECT * FROM tags ORDER BY name ASC`);
  return rows;
}
