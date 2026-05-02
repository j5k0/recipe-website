import type { PoolClient } from "pg";
import { pool } from "./pool";
import { supabase } from "./supabase";
import { Recipe, RecipeReview } from "./types";
import { randomUUID } from "crypto";

const recipeImagesSelect = `
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
`;

function getStorageFileName(publicUrl: string): string | null {
  const cleanUrl = publicUrl.split("?")[0];
  const marker = "/recipes/";
  const markerIndex = cleanUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const fileName = cleanUrl.substring(markerIndex + marker.length);
  return fileName.length > 0 ? fileName : null;
}

async function removeRecipeStorageImages(imageUrls: string[]): Promise<void> {
  const fileNames = Array.from(
    new Set(
      imageUrls
        .map(getStorageFileName)
        .filter((fileName): fileName is string => Boolean(fileName)),
    ),
  );

  if (fileNames.length === 0) {
    return;
  }

  try {
    await supabase.storage.from("recipes").remove(fileNames);
  } catch (error) {
    console.error("Error deleting recipe images from storage:", error);
  }
}

async function insertRecipeImages(
  client: PoolClient,
  recipeId: string,
  images: string[],
): Promise<void> {
  if (images.length === 0) {
    return;
  }

  await client.query(
    `INSERT INTO recipe_images (recipe_id, image_url, sort_order)
     SELECT $1, image_url, sort_order - 1
     FROM unnest($2::text[]) WITH ORDINALITY AS image_list(image_url, sort_order)
     ON CONFLICT DO NOTHING`,
    [recipeId, images],
  );
}

async function getRecipeImages(recipeId: string): Promise<string[]> {
  const { rows } = await pool.query<{ images: string[] }>(
    `SELECT ${recipeImagesSelect}
     FROM recipes r
     WHERE r.id = $1`,
    [recipeId],
  );

  return rows[0]?.images ?? [];
}

async function getRecipeById(recipeId: string): Promise<Recipe> {
  const { rows } = await pool.query<Recipe>(
    `SELECT
      r.*,
      u.id AS author_id,
      u.user_name AS author_name,
      u.avatar_url AS author_avatar_url,
      COALESCE(
        json_agg(json_build_object('id', t.id, 'name', t.name))
        FILTER (WHERE t.id IS NOT NULL), '[]'
      ) AS tags,
      ${recipeImagesSelect},
      (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM recipe_reviews
        WHERE recipe_id = r.id
      ) AS average_rating,
      (
        SELECT COALESCE(SUM(vote_value)::int, 0)
        FROM recipe_votes
        WHERE recipe_id = r.id
      ) AS upvote_count
    FROM recipes r
    LEFT JOIN users u ON u.id = r.created_by
    LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
    LEFT JOIN tags t ON t.id = rt.tag_id
    WHERE r.id = $1
    GROUP BY r.id, u.id, u.user_name, u.avatar_url`,
    [recipeId],
  );

  return rows[0];
}

export async function createRecipe(input: {
  title: string;
  description: string;
  ingredients: string[];
  selectedTags: string[];
  email: string;
  images?: string[];
}): Promise<Recipe> {
  const client = await pool.connect();
  const images = input.images ?? [];

  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO recipes (title, description, image, created_by)
       SELECT $1, $2, $3, users.id
       FROM users
       WHERE users.email = $4
       RETURNING id`,
      [input.title, input.description, images[0] ?? null, input.email],
    );
    const recipeId = rows[0]?.id;

    if (!recipeId) {
      throw new Error("Recipe author was not found");
    }

    if (input.ingredients.length > 0) {
      await client.query(
        `INSERT INTO ingredients (recipe_id, info)
         SELECT $1, unnest($2::text[])`,
        [recipeId, input.ingredients],
      );
    }

    if (input.selectedTags.length > 0) {
      await client.query(
        `INSERT INTO recipe_tags (recipe_id, tag_id)
         SELECT $1, tags.id
         FROM tags
         WHERE tags.name = ANY($2::text[])`,
        [recipeId, input.selectedTags],
      );
    }

    await insertRecipeImages(client, recipeId, images);
    await client.query("COMMIT");

    return getRecipeById(recipeId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ── Naujos funkcijos ──────────────────────────────────────────────

export async function getAllRecipes(): Promise<Recipe[]> {
  const { rows } = await pool.query<Recipe>(`
        SELECT 
            r.*,
            u.id AS author_id,
            u.user_name AS author_name,
            u.avatar_url AS author_avatar_url,
            COALESCE(
                json_agg(json_build_object('id', t.id, 'name', t.name))
                FILTER (WHERE t.id IS NOT NULL), '[]'
            ) AS tags,
            ${recipeImagesSelect},
            (
                SELECT ROUND(AVG(rating)::numeric, 1)
                FROM recipe_reviews
                WHERE recipe_id = r.id
            ) AS average_rating,
            (
                SELECT COALESCE(SUM(vote_value)::int, 0)
                FROM recipe_votes
                WHERE recipe_id = r.id
            ) AS upvote_count
        FROM recipes r
        LEFT JOIN users u ON u.id = r.created_by
        LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
        LEFT JOIN tags t ON t.id = rt.tag_id
        GROUP BY r.id, u.id, u.user_name, u.avatar_url
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

export async function getRecipeReviews(recipeId: string): Promise<RecipeReview[]> {
  const { rows } = await pool.query<RecipeReview>(
    `SELECT
      rr.id,
      rr.recipe_id,
      rr.reviewer_id,
      u.user_name AS reviewer_name,
      rr.rating,
      rr.comment,
      rr.created_at
     FROM recipe_reviews rr
     JOIN users u ON u.id = rr.reviewer_id
     WHERE rr.recipe_id = $1
     ORDER BY rr.created_at DESC`,
    [recipeId],
  );
  return rows;
}

export async function addRecipeReview(input: {
  recipeId: string;
  reviewerId: string;
  rating: number;
  comment: string;
}): Promise<RecipeReview> {
  const reviewId = randomUUID();
  const { rows } = await pool.query<RecipeReview>(
    `INSERT INTO recipe_reviews (id, recipe_id, reviewer_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, recipe_id, reviewer_id, rating, comment, created_at`,
    [reviewId, input.recipeId, input.reviewerId, input.rating, input.comment],
  );

  const { rows: userRows } = await pool.query<{ user_name: string }>(
    `SELECT user_name FROM users WHERE id = $1`,
    [input.reviewerId],
  );

  return {
    ...rows[0],
    reviewer_name: userRows[0]?.user_name ?? "Unknown",
  };
}

export async function getRecipeAuthorId(recipeId: string): Promise<String>{
    const { rows } = await pool.query<String>('SELECT created_by FROM recipes WHERE id = $1;', [recipeId])
    return rows[0];
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  const imageUrls = await getRecipeImages(recipeId);
  await removeRecipeStorageImages(imageUrls);

  // Delete in cascade order: ingredients, recipe_tags, then recipe
  await pool.query(`DELETE FROM ingredients WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipe_tags WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipe_reviews WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipe_votes WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipe_images WHERE recipe_id = $1`, [recipeId]);
  await pool.query(`DELETE FROM recipes WHERE id = $1`, [recipeId]);
}

export async function updateRecipe(recipeId: string, input: {
  title?: string;
  description?: string;
  ingredients?: string[];
  selectedTags?: string[];
  images?: string[];
}): Promise<Recipe> {
  if (input.images !== undefined) {
    const oldImageUrls = await getRecipeImages(recipeId);
    await removeRecipeStorageImages(oldImageUrls);
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
  if (input.images !== undefined) {
    fields.push(`image = $${idx++}`);
    values.push(input.images[0] ?? null);
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

  if (input.images !== undefined) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(`DELETE FROM recipe_images WHERE recipe_id = $1`, [recipeId]);
      await insertRecipeImages(client, recipeId, input.images);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  return getRecipeById(recipeId);
}
