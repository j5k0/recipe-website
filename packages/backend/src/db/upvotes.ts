import { pool } from "./pool";
import { getUserId } from "./user";

export interface RecipeVoteSummary {
  vote_count: number;
  user_vote: number;
  has_upvoted: boolean;
  has_downvoted: boolean;
}

async function getUserIdFromEmail(userEmail?: string | null): Promise<string | null> {
  if (!userEmail) return null;
  const userId = await getUserId(userEmail);
  return userId || null;
}

export async function getRecipeVoteSummary(
  recipeId: string,
  userEmail?: string | null,
): Promise<RecipeVoteSummary> {
  const userId = await getUserIdFromEmail(userEmail);
  const { rows } = await pool.query<{
    vote_count: number;
    user_vote: number;
  }>(
    `SELECT
      COALESCE((SELECT SUM(vote_value)::int FROM recipe_votes WHERE recipe_id = $1), 0) AS vote_count,
      COALESCE(
        (SELECT vote_value FROM recipe_votes WHERE recipe_id = $1 AND user_id = $2),
        0
      ) AS user_vote`,
    [recipeId, userId],
  );

  const voteValue = Number(rows[0]?.user_vote ?? 0);
  return {
    vote_count: Number(rows[0]?.vote_count ?? 0),
    user_vote: voteValue,
    has_upvoted: voteValue === 1,
    has_downvoted: voteValue === -1,
  };
}

export async function voteRecipe(
  userEmail: string,
  recipeId: string,
  voteValue: number,
): Promise<RecipeVoteSummary> {
  const userId = await getUserIdFromEmail(userEmail);
  if (!userId) {
    throw new Error("User not found");
  }

  if (voteValue === 0) {
    await pool.query(
      `DELETE FROM recipe_votes WHERE user_id = $1 AND recipe_id = $2`,
      [userId, recipeId],
    );
  } else {
    await pool.query(
      `INSERT INTO recipe_votes (user_id, recipe_id, vote_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, recipe_id) DO UPDATE
       SET vote_value = EXCLUDED.vote_value`,
      [userId, recipeId, voteValue],
    );
  }

  return getRecipeVoteSummary(recipeId, userEmail);
}
