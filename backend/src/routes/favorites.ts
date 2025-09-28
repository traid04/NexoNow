import express from 'express';
import { tokenExtractor } from '../middleware/tokenExtractor';
import { RequestWithUser } from '../types/types';
import { Favorite } from '../models/index';
import { IDValidator } from '../middleware/IDValidator';
import { tokenValidator } from '../middleware/tokenValidator';

const router = express.Router();

router.post('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const body = {
      userId: reqUser.userId,
      productId: Number(req.params.id)
    };
    const favorite = await Favorite.findOne({ where: body });
    if (favorite) {
      return res.status(409).json({ error: "This product has already been favorited" });
    }
    const savedFavorite = await Favorite.create(body);
    return res.status(201).json(savedFavorite);
  }
  catch(error) {
    next(error);
  }
});

router.delete('/:id', IDValidator, tokenExtractor, tokenValidator, async (req: RequestWithUser, res, next) => {
  try {
    const reqUser = req.user!;
    const favToRemove = await Favorite.findOne({ where: { userId: reqUser.userId, productId: Number(req.params.id) } });
    if (!favToRemove) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    await favToRemove.destroy();
    return res.status(204).end();
  }
  catch(error) {
    next(error);
  }
});

export default router;