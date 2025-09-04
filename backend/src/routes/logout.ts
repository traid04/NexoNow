import express, { NextFunction, Response } from "express";
import { tokenExtractor } from "../middleware/tokenExtractor";
import { RequestWithUser } from "../types/types";
import { User } from '../models/index';
const router = express.Router();

router.post('/', tokenExtractor, async (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Token missing or invalid' });
  }
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found, invalid token' });
    }
    user.refreshToken = '';
    await user.save();
    res.clearCookie("refreshToken", { path: '/refresh' });
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

export default router;