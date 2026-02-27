import express from "express";
import { createRecipe } from "./db/recipes"

const router = express.Router();

router.post("/recipes", async (req, res) => {
    console.log("received request");
    try{
        const { title, description } = req.body;
        const recipe = await createRecipe({ title, description });
        res.status(201).json(recipe);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: "Failed to create recipe" });
    }
})

export default router;
