export interface Recipe{
    id: string;
    title: string;
    description: string;
    ingredients: string[];
    tags: string[];
    created_at: string;
    image: string | null;
}
