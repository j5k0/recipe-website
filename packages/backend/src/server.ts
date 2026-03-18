import multer from "multer";
import { supabase } from "./db/supabase";
import express from "express";
import { createRecipe, getAllRecipes, getRecipeIngredients, getAllTags, deleteRecipe, updateRecipe } from "./db/recipes";
import { createUser, findUser } from "./db/user";
import jwt from 'jsonwebtoken';
import { authenticateToken } from "./auth";
import bcrypt from "bcrypt";
import { User, JwtPayload, AuthRequest } from "./types";
import { Router, Request, Response } from "express";

const upload = multer(); 
const recipeRouter = express.Router();
const loginRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

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

recipeRouter.put("/recipes/:id", upload.single("image"), async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { title, description } = req.body;
    const ingredients = req.body.ingredients ? [].concat(req.body.ingredients) : undefined;
    const selectedTags = req.body.selectedTags ? [].concat(req.body.selectedTags) : undefined;

    let imageUrl: string | null | undefined = undefined;

    // Only handle image if one was provided
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

    const recipe = await updateRecipe(recipeId, {
      title,
      description,
      ingredients,
      selectedTags,
      ...(imageUrl !== undefined && { image: imageUrl }),
    });

    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

recipeRouter.delete("/recipes/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;
    await deleteRecipe(recipeId);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Login, register 

loginRouter.post('/register', async (req, res) => {
    try{
        const { email, name, password } = req.body;
        const result = await createUser(name, email, password);
        if(result){
            res.status(201).json({ message: "User created" });
        }
        else{
            res.status(409).json({ error: "Email or name already exists" });
        }
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
})

loginRouter.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await findUser(email);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload: JwtPayload = { user_name: user.user_name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1h" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.json({ message: "Logged in" });
});

// for testing purposes

loginRouter.get("/whoami", authenticateToken, (req: AuthRequest, res: Response) => {
    if(req.user){
        res.json({
            user_name: req.user.user_name,
            email: req.user.email
        });
    }
})

export default {recipeRouter, loginRouter};
