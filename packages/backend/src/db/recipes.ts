import { pool } from "./pool";
import { supabase } from "./supabase";
import { Recipe } from "./types";

export async function createRecipe(input: {
  title: string;
  description: string;
  ingredients: string[];
  selectedTags: string[];
  image?: string | null;
}): Promise<Recipe> {
  const { rows } = await pool.query<Recipe>(
    `WITH new_recipe AS (
            INSERT INTO recipes (title, description, image) 
            VALUES ($1, $2, $5) 
            RETURNING id
        ),
        insert_ingredients AS (
            INSERT INTO ingredients (recipe_id, info) 
            SELECT new_recipe.id, unnest($3::text[]) 
            FROM new_recipe
        )
        INSERT INTO recipe_tags (recipe_id, tag_id) 
        SELECT new_recipe.id, tags.id 
        FROM new_recipe 
        JOIN tags ON tags.name = ANY($4::text[]);`,
    [input.title, input.description, input.ingredients, input.selectedTags, input.image || null],
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

export async function deleteRecipe(recipeId: string): Promise<void> {
  // First get the recipe to check for image
  const { rows } = await pool.query<Recipe>('SELECT image FROM recipes WHERE id = $1', [recipeId]);
  const recipe = rows[0];

  // Delete image from Supabase storage if it exists
  if (recipe?.image) {
    try {
      // Extract filename from the public URL
      const recipesIndex = recipe.image.indexOf('/recipes/');
      if (recipesIndex !== -1) {
        const fileName = recipe.image.substring(recipesIndex + 9); // +9 to skip '/recipes/'

        if (fileName && fileName.length > 0) {
          console.log(`Deleting image file: ${fileName}`);
          await supabase.storage
            .from("recipes")
            .remove([fileName]);
        }
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      // Continue with database deletion even if image deletion fails
    }
  }

  // Delete in cascade order: ingredients, recipe_tags, then recipe
  await pool.query(`DELETE FROM ingredients WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipe_tags WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipes WHERE id = $1`, [recipeId]);
}

export async function updateRecipe(recipeId: string, input: {
  title?: string;
  description?: string;
  ingredients?: string[];
  selectedTags?: string[];
  image?: string | null;
}): Promise<Recipe> {
  // Handle image deletion if a new image is being set
  if (input.image !== undefined) {
    const { rows } = await pool.query<Recipe>('SELECT image FROM recipes WHERE id = $1', [recipeId]);
    const recipe = rows[0];

    // Delete old image from Supabase storage if it exists and we're replacing it
    if (recipe?.image && input.image) {
      try {
        const recipesIndex = recipe.image.indexOf('/recipes/');
        if (recipesIndex !== -1) {
          const fileName = recipe.image.substring(recipesIndex + 9);

          if (fileName && fileName.length > 0) {
            console.log(`Deleting old image file: ${fileName}`);
            await supabase.storage
              .from("recipes")
              .remove([fileName]);
          }
        }
      } catch (error) {
        console.error('Error deleting old image from storage:', error);
      }
    }
  }

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${idx++}`);
    values.push(input.title);
  }
  if (input.description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(input.description);
  }
  if (input.image !== undefined) {
    fields.push(`image = $${idx++}`);
    values.push(input.image);
  }

  if (fields.length > 0) {
    values.push(recipeId);
    await pool.query(
      `UPDATE recipes SET ${fields.join(", ")} WHERE id = $${idx}`,
      values,
    );
  }

  if (input.ingredients !== undefined) {
    await pool.query(`DELETE FROM ingredients WHERE recipe_id = $1`, [recipeId]);
    if (input.ingredients.length > 0) {
      await pool.query(
        `INSERT INTO ingredients (recipe_id, info)
         SELECT $1, unnest($2::text[])`,
        [recipeId, input.ingredients],
      );
    }
  }

  if (input.selectedTags !== undefined) {
    await pool.query(`DELETE FROM recipe_tags WHERE recipe_id = $1`, [recipeId]);
    if (input.selectedTags.length > 0) {
      await pool.query(
        `INSERT INTO recipe_tags (recipe_id, tag_id)
         SELECT $1, t.id
         FROM tags t
         WHERE t.name = ANY($2::text[])`,
        [recipeId, input.selectedTags],
      );
    }
  }

  const { rows: updatedRows } = await pool.query<Recipe>(
    `SELECT
      r.*,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name))
        FILTER (WHERE t.id IS NOT NULL), '[]'
      ) AS tags
    FROM recipes r
    LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
    LEFT JOIN tags t ON t.id = rt.tag_id
    WHERE r.id = $1
    GROUP BY r.id`,
    [recipeId],
  );

  return updatedRows[0];
}
