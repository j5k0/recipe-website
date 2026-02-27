import { pool } from "./pool"
import { Recipe } from "./types"

export async function createRecipe(input: { title: string; description: string; ingredients: string[]}): Promise<Recipe> {
    const { rows } = await pool.query<Recipe>(
        `WITH new_recipe AS (
            INSERT INTO recipes (title, description) VALUES ($1, $2) RETURNING id
        )
        INSERT INTO ingredients (recipe_id, info) SELECT new_recipe.id, unnest($3::text[]) FROM new_recipe;`,
        [
            input.title,
            input.description,
            input.ingredients
        ]
    );
    return rows[0];
}
