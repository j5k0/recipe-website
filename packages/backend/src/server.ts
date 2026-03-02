import multer from "multer";
import { supabase } from "./db/supabase";
import express from "express";
import { createRecipe, getAllRecipes, getRecipeIngredients, getAllTags, } from "./db/recipes";

const upload = multer(); 
const router = express.Router();

// Route for creating a new recipe
// Uses multer middleware to handle a single file upload with the field name "image"
router.post("/recipes", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const ingredients = [].concat(req.body.ingredients || []);
    const selectedTags = [].concat(req.body.selectedTags || []);

    let imageUrl: string | null = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from("recipes")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("recipes")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const recipe = await createRecipe({
      title,
      description,
      ingredients,
      selectedTags,
      image: imageUrl,
    });

    res.status(201).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// ── Nauji routes ──────────────────────────────────────────────

router.get("/recipes", async (req, res) => {
  try {
    const recipes = await getAllRecipes();
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

router.get("/recipes/:id/ingredients", async (req, res) => {
  try {
    const ingredients = await getRecipeIngredients(req.params.id);
    res.json(ingredients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

router.get("/tags", async (req, res) => {
  try {
    const tags = await getAllTags();
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

export default router;
