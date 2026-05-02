export interface Recipe{
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    tags: string[];
    created_at: string;
    image: string | null;
    images: string[];
    average_rating?: number | null;
    author_id?: string;
    author_name?: string;
    author_avatar_url?: string | null;
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
