import multer from "multer";
import { supabase } from "./db/supabase";
import express from "express";
import { createRecipe, getAllRecipes, getRecipeIngredients, getAllTags, deleteRecipe, updateRecipe, getRecipeAuthorId, getRecipeReviews, addRecipeReview } from "./db/recipes";
import { likeRecipe, unlikeRecipe, getUserLikedRecipes } from "./db/likes";
import { getRecipeVoteSummary, voteRecipe } from "./db/upvotes";
import { createUser, findUser, getUserId, getUserName, getAvatarUrl, setAvatarUrl, deleteUser, updatePassword, updateProfile } from "./db/user";
import { getPreferences, upsertPreferences } from "./db/preferences";
import jwt from 'jsonwebtoken';
import { authenticateToken } from "./auth";
import bcrypt from "bcrypt";
import { JwtPayload, AuthRequest } from "./types";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";


const recipeRouter = express.Router();
const loginRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(1000),
});


//Image size and format validation
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_RECIPE_IMAGES = 5;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if(!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }

    cb(null, true);
  },
});

function handleUploadError(err: unknown, res: Response, next: NextFunction) {
  if(!err) {
    return next();
  }

  if(err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Image is too large. Maximum size is 5MB." });
  }

  if(err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ error: `You can upload up to ${MAX_RECIPE_IMAGES} recipe images.` });
  }

  if(err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }

  return res.status(400).json({ error: "Invalid image upload." });
}

function uploadRecipeImages(req: Request, res:Response, next: NextFunction) {
  upload.fields([
    { name: "images", maxCount: MAX_RECIPE_IMAGES },
    { name: "image", maxCount: 1 },
  ])(req, res, (err: unknown) => {
    return handleUploadError(err, res, next);
  })
}

function uploadSingleImage(req: Request, res:Response, next: NextFunction) {
  upload.single("image")(req, res, (err: unknown) => {
    return handleUploadError(err, res, next);
  })
}

function getRecipeUploadFiles(req: Request): Express.Multer.File[] {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return [
    ...(files?.images ?? []),
    ...(files?.image ?? []),
  ].slice(0, MAX_RECIPE_IMAGES);
}

async function uploadRecipeFiles(files: Express.Multer.File[]): Promise<string[]> {
  const uploads = files.map(async (file, index) => {
    const fileName = `${Date.now()}-${index}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("recipes")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("recipes")
      .getPublicUrl(fileName);

    return data.publicUrl;
  });

  return Promise.all(uploads);
}

function getBodyArray(value: unknown): string[] {
  return ([] as unknown[])
    .concat(value || [])
    .map(String)
    .filter((item) => item.trim().length > 0);
}

function getOptionalUserEmail(req: Request): string | null {
  const token = req.cookies?.token;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    return payload.email;
  } catch {
    return null;
  }
}

// Route for creating a new recipe
recipeRouter.post("/recipes", authenticateToken, uploadRecipeImages, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;
    const email = req.user!.email;
    const ingredients = getBodyArray(req.body.ingredients);
    const selectedTags = getBodyArray(req.body.selectedTags);
    const images = await uploadRecipeFiles(getRecipeUploadFiles(req));

    const recipe = await createRecipe({
      title,
      description,
      ingredients,
      selectedTags,
      email,
      images,
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

recipeRouter.get("/recipes/:id/author", async (req, res) => {
    try{
        const author = await getRecipeAuthorId(req.params.id);
        res.json(author);
    } catch(err){
        console.error(err);
        res.json({ error: "Failed to fetch author" });
    }
})

recipeRouter.get("/recipes/:id/ingredients", async (req, res) => {
  try {
    const ingredients = await getRecipeIngredients(req.params.id);
    res.json(ingredients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
});

recipeRouter.get("/recipes/:id/reviews", async (req, res) => {
  try {
    const reviews = await getRecipeReviews(req.params.id);
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

recipeRouter.post("/recipes/:id/reviews", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid review payload" });
    }

    const reviewerId = await getUserId(req.user!.email);
    if (!reviewerId) {
      return res.status(401).json({ error: "User not found" });
    }

    const review = await addRecipeReview({
      recipeId: req.params.id,
      reviewerId: reviewerId.toString(),
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to add review" });
  }
});

recipeRouter.get("/recipes/:id/upvote", async (req: Request, res: Response) => {
  try {
    const summary = await getRecipeVoteSummary(
      req.params.id,
      getOptionalUserEmail(req),
    );
    return res.json(summary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch vote status" });
  }
});

recipeRouter.post("/recipes/:id/upvote", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const summary = await voteRecipe(req.user!.email, req.params.id, 1);
    return res.status(201).json(summary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to upvote recipe" });
  }
});

recipeRouter.post("/recipes/:id/downvote", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const summary = await voteRecipe(req.user!.email, req.params.id, -1);
    return res.status(201).json(summary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to downvote recipe" });
  }
});

recipeRouter.post("/recipes/:id/vote", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const voteValue = Number(req.body.vote_value);
    if (![1, -1, 0].includes(voteValue)) {
      return res.status(400).json({ error: "vote_value must be 1, -1, or 0" });
    }
    const summary = await voteRecipe(req.user!.email, req.params.id, voteValue);
    return res.status(201).json(summary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to submit vote" });
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

recipeRouter.put("/recipes/:id", uploadRecipeImages, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { title, description } = req.body;
    const ingredients = req.body.ingredients ? getBodyArray(req.body.ingredients) : undefined;
    const selectedTags = req.body.selectedTags ? getBodyArray(req.body.selectedTags) : undefined;
    const uploadedFiles = getRecipeUploadFiles(req);
    const images = uploadedFiles.length > 0 ? await uploadRecipeFiles(uploadedFiles) : undefined;

    const recipe = await updateRecipe(recipeId, {
      title,
      description,
      ingredients,
      selectedTags,
      ...(images !== undefined && { images }),
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

// Like / unlike a recipe (auth required)
recipeRouter.post("/recipes/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await likeRecipe(req.user!.email, req.params.id);
    res.json({ liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like recipe" });
  }
});

recipeRouter.delete("/recipes/:id/like", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await unlikeRecipe(req.user!.email, req.params.id);
    res.json({ liked: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unlike recipe" });
  }
});

// Get current user's liked recipes (auth required)
recipeRouter.get("/user/liked", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const recipes = await getUserLikedRecipes(req.user!.email);
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch liked recipes" });
  }
});

recipeRouter.post("/user/avatar", authenticateToken, uploadSingleImage, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }
    const email = req.user!.email;
    const fileName = `avatar-${email}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });
    if (error) throw error;
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
    await setAvatarUrl(email, avatarUrl);
    return res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to upload avatar" });
  }
});

recipeRouter.get("/user/preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const prefs = await getPreferences(req.user!.email);
    res.json(prefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

recipeRouter.put("/user/preferences", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { email_notifications, marketing_emails } = req.body;
    if (typeof email_notifications !== "boolean" || typeof marketing_emails !== "boolean") {
      return res.status(400).json({ error: "Invalid preferences payload" });
    }
    await upsertPreferences(req.user!.email, { email_notifications, marketing_emails });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update preferences" });
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

loginRouter.delete("/user", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ error: "Password required" });
        const user = await findUser(req.user!.email);
        if (!user) return res.status(404).json({ error: "User not found" });
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: "Incorrect password" });
        await deleteUser(req.user!.email);
        res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
        return res.status(200).json({ message: "Account deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete account" });
    }
});

loginRouter.put("/user/password", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new password required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }
        const user = await findUser(req.user!.email);
        if (!user) return res.status(404).json({ error: "User not found" });
        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: "Incorrect password" });
        await updatePassword(req.user!.email, newPassword);
        return res.json({ message: "Password updated" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update password" });
    }
});
loginRouter.put("/user/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { user_name, email, avatar_url } = req.body;
        const currentEmail = req.user!.email;
        let newEmail = currentEmail;
        
        await updateProfile(currentEmail, user_name, email, avatar_url);
        newEmail = email || currentEmail;
        
        if (email && email !== currentEmail) {
            res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
            const newPayload: JwtPayload = { user_name: req.user!.user_name, email: newEmail };
            const newToken = jwt.sign(newPayload, JWT_SECRET as string, { expiresIn: "1h" });
            res.cookie("token", newToken, { httpOnly: true, secure: true, sameSite: "none" });
        }
        
        return res.json({ message: "Profile updated" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to update profile" });
    }
});


loginRouter.post("/logout", async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    
    return res.status(200).json({});
})

// for testing purposes

loginRouter.get("/whoami", authenticateToken, async (req: AuthRequest, res: Response) => {
    if(req.user){
        const [id, avatar_url] = await Promise.all([
            getUserId(req.user.email),
            getAvatarUrl(req.user.email),
        ]);
        if(id != ""){
            res.json({
                user_name: await getUserName(req.user!.email),
                email: req.user.email,
                unique_id: id,
                avatar_url,
            });
        }
        else{
            res.status(500).json({ error: "User was not found" });
        }
    }
})

export default {recipeRouter, loginRouter};
