import { Request, Response, NextFunction } from "express";

export const IDValidator = (req: Request, res: Response, next: NextFunction) => {
	if (isNaN(Number(req.params.id))) {
    return res.status(400).json({ error: 'Seller ID must be a number' });
  }
	next();
}