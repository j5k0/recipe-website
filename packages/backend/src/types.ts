import { Request } from "express";

export interface User {
  email: string;
  user_name: string;
  password_hash: string;
}

export interface JwtPayload {
  user_name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
