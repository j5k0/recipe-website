import multer from "multer";
import { supabase } from "./db/supabase";
import express from "express";
import { createRecipe, getAllRecipes, getRecipeIngredients, getAllTags, } from "./db/recipes";
import { createUser } from "./db/user";
import jwt from 'jsonwebtoken';

const upload = multer(); 
const recipeRouter = express.Router();
const loginRouter = express.Router();

// Route for creating a new recipe
// Uses multer middleware to handle a single file upload with the field name "image"
recipeRouter.post("/recipes", upload.single("image"), async (req, res) => {
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

recipeRouter.get("/recipes", async (req, res) => {
  try {
    const recipes = await getAllRecipes();
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

recipeRouter.get("/recipes/:id/ingredients", async (req, res) => {
  try {
    const ingredients = await getRecipeIngredients(req.params.id);
    res.json(ingredients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

recipeRouter.get("/tags", async (req, res) => {
  try {
    const tags = await getAllTags();
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// Login, register 

loginRouter.post('/register', async (req, res) => {
    try{
        const { email, name, password } = req.body;
        const result = await createUser(name, email, password);
        res.status(201).json({ message: "User created" });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
})

export default {recipeRouter, loginRouter};
