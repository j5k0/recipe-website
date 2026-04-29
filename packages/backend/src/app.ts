import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./server";

export function createApp() {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

  app.use("/api", router.recipeRouter);
  app.use("/auth", router.loginRouter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
