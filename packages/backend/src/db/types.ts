export interface Recipe{
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    tags: string[];
    created_at: string;
    image: string | null;
    average_rating?: number | null;
    upvote_count?: number;
}

export interface RecipeReview {
    id: string;
    recipe_id: string;
    reviewer_id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    created_at: string;
}
