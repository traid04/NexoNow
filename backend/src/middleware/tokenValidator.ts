import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types/types";

export const tokenValidator = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  next();
}