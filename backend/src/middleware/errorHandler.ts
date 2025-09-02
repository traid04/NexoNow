import { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof jsonwebtoken.TokenExpiredError) {
    return res.status(400).json({ status: 'expired' });
  }
  else if (error instanceof jsonwebtoken.JsonWebTokenError) {
    return res.status(400).json({ status: 'invalid' });
  }
  else if (error instanceof Error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(400).json({ error: `Unknown error: ${error} `})
}