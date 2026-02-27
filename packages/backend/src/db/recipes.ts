import { pool } from "./pool"
import { Recipe } from "./types"

export async function createRecipe(input: { title: string; description: string; }): Promise<Recipe> {
    console.log("trying to create a database entry");
    const { rows } = await pool.query<Recipe>(
        `INSERT INTO recipes (title, description) VALUES ($1, $2) RETURNING *`,
        [
            input.title,
            input.description
        ]
    );
    return rows[0];
}
