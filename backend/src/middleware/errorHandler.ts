import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";
import { UniqueConstraintError } from "sequelize";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof jsonwebtoken.TokenExpiredError) {
    return res.status(401).json({ status: 'expired' });
  }
  if (error instanceof jsonwebtoken.JsonWebTokenError) {
    return res.status(401).json({ status: 'invalid' });
  }
  if (error instanceof UniqueConstraintError) {
    const errors = error.errors.map(e => e.message);
    return res.status(400).json({ error: errors });
  }
  if (error instanceof Error) {
    return res.status(409).json({ error: error.message });
  }
  return res.status(400).json({ error: `Unknown error: ${error} `})
} 