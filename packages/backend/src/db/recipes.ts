import { pool } from "./pool"
import { Recipe } from "./types"

export async function createRecipe(input: { title: string; description: string; ingredients: string[], selectedTags: string[]}): Promise<Recipe> {
    const { rows } = await pool.query<Recipe>(
        `WITH new_recipe AS (
            INSERT INTO recipes (title, description) VALUES ($1, $2) RETURNING id
        ),
        insert_ingredients AS (
            INSERT INTO ingredients (recipe_id, info) SELECT new_recipe.id, unnest($3::text[]) FROM new_recipe
        )
        INSERT INTO recipe_tags (recipe_id, tag_id) SELECT new_recipe.id, tags.id FROM new_recipe JOIN tags ON tags.name = ANY($4::text[]);`,
        [
            input.title,
            input.description,
            input.ingredients,
            input.selectedTags
        ]
    );
    return rows[0];
}
