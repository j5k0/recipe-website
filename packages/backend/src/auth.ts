import { Request, Response, NextFunction } from 'express';
import { User, JwtPayload, AuthRequest } from "./types";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function authenticateToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
        req.user = payload;
        next();
    } catch {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}
