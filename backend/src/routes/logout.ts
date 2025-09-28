import express, { NextFunction, Response } from "express";
import { tokenExtractor } from "../middleware/tokenExtractor";
import { RequestWithUser } from "../types/types";
import { User } from '../models/index';
import { tokenValidator } from "../middleware/tokenValidator";
const router = express.Router();

router.post('/', tokenExtractor, tokenValidator, async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const reqUser = req.user!;
    const user = await User.findByPk(reqUser.userId);
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